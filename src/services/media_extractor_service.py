import os
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.oxml import parse_xml
from docx.oxml.ns import qn
from docx2pdf import convert
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")


class MediaExtractorService:
    """
    Service for extracting images and tables from a .docx file,
    saving them in the same folder, updating references inside the document,
    and converting it to PDF.
    """

    def __init__(self):
        logger.info("✅ MediaExtractorService initialized.")

    # -----------------------------
    # Internal helper methods
    # -----------------------------
    def _save_image(self, image_blob, folder_path, doc_basename, counter):
        """Save image bytes as PNG in the same folder as the DOCX."""
        image_name = f"{doc_basename}_img_{counter}.png"
        image_path = os.path.join(folder_path, image_name)
        image = Image.open(BytesIO(image_blob))
        image.save(image_path)
        return image_path

    def _save_table_as_image(self, table, folder_path, doc_basename, counter):
        """Convert a Word table to an image representation."""
        rows = []
        for row in table.rows:
            cols = [cell.text.strip() for cell in row.cells]
            rows.append(" | ".join(cols))
        text = "\n".join(rows) or "(Empty Table)"

        img_name = f"{doc_basename}_tbl_{counter}.png"
        img_path = os.path.join(folder_path, img_name)

        font = ImageFont.load_default()
        lines = text.splitlines()
        width = int(max(font.getlength(line) for line in lines) + 20)
        height = int(15 * len(lines) + 20)
        img = Image.new("RGB", (width, height), "white")
        draw = ImageDraw.Draw(img)
        y = 10
        for line in lines:
            draw.text((10, y), line, fill="black", font=font)
            y += 15
        img.save(img_path)
        return img_path

    # -----------------------------
    # Core document processing
    # -----------------------------
    def process_docx(self, file_path):
        """
        Processes a .docx file:
          - Extracts images & tables.
          - Saves them as PNGs in the same folder.
          - Replaces them with placeholders in the doc.
          - Saves an updated .docx & converts it to PDF.
          - Returns the updated .docx absolute path.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"❌ File not found: {file_path}")

        if not file_path.lower().endswith(".docx"):
            raise ValueError("❌ Only .docx files are supported.")

        folder_path = os.path.dirname(file_path)
        basename = os.path.splitext(os.path.basename(file_path))[0]

        logger.info(f"📄 Processing file: {file_path}")
        doc = Document(file_path)
        img_counter = 0
        tbl_counter = 0

        # Process elements in reading order
        body_elements = list(doc.element.body)

        for element in body_elements:
            tag = element.tag

            # ---- Table extraction ----
            if tag.endswith("tbl"):
                tbl_counter += 1
                for tbl in doc.tables:
                    if tbl._element is element:
                        tbl_path = self._save_table_as_image(tbl, folder_path, basename, tbl_counter)
                        parent = element.getparent()
                        idx = parent.index(element)
                        placeholder = parse_xml(
                            f'<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
                            f'<w:r><w:t>[Table: {os.path.basename(tbl_path)}]</w:t></w:r></w:p>'
                        )
                        parent.insert(idx + 1, placeholder)
                        parent.remove(element)
                        break

            # ---- Image extraction ----
            elif tag.endswith("p"):
                paragraph = None
                for p in doc.paragraphs:
                    if p._element is element:
                        paragraph = p
                        break

                if paragraph:
                    for run in paragraph.runs:
                        blips = run.element.xpath(".//a:blip")
                        if blips:
                            img_counter += 1
                            embed_rid = blips[0].get(qn("r:embed"))
                            image_part = doc.part.related_parts[embed_rid]
                            image_data = image_part.blob
                            img_path = self._save_image(image_data, folder_path, basename, img_counter)
                            run.text = f"[Image: {os.path.basename(img_path)}]"
                            for blip in blips:
                                blip.getparent().remove(blip)

        # ---- Save updated DOCX ----
        updated_path = os.path.join(folder_path, f"updated_{basename}.docx")
        doc.save(updated_path)
        logger.info(f"✅ Saved updated Word file: {updated_path}")

        # ---- Convert to PDF ----
        pdf_path = os.path.join(folder_path, f"{basename}.pdf")
        try:
            convert(updated_path, pdf_path)
            logger.info(f"📘 Converted to PDF: {pdf_path}")
        except Exception as e:
            logger.warning(f"⚠️ PDF conversion failed: {e}")

        logger.info(f"📊 Extracted {img_counter} images, {tbl_counter} tables.")
        return os.path.abspath(updated_path)
