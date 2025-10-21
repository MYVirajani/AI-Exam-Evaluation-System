import os
from io import BytesIO
from PIL import Image
from docx import Document
from docx.oxml import parse_xml
from docx.oxml.ns import qn
from xml.sax.saxutils import escape
from docx2pdf import convert

# Optional dependency for flowcharts (Windows only)
try:
    import win32com.client
    WIN32_AVAILABLE = True
except ImportError:
    WIN32_AVAILABLE = False

# -----------------------------
# CONFIGURATION
# -----------------------------
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(ROOT_DIR, "data")
INPUT_DIR = os.path.join(DATA_DIR, "raw_answer_scripts_docs")
EXTRACT_DIR = os.path.join(DATA_DIR, "extracted_media")
OUTPUT_DIR = os.path.join(DATA_DIR, "updated_answer_scripts_docs")
PDF_DIR = os.path.join(DATA_DIR, "Answer_scripts")

os.makedirs(EXTRACT_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(PDF_DIR, exist_ok=True)


# -----------------------------
# HELPER FUNCTIONS
# -----------------------------
def save_image(image_blob, doc_basename, counter):
    """Save embedded image bytes to file and return its path."""
    image_name = f"{doc_basename}_img_{counter}.png"
    image_path = os.path.join(EXTRACT_DIR, image_name)
    image = Image.open(BytesIO(image_blob))
    image.save(image_path)
    return image_path


def export_shapes_to_images(docx_path, output_dir):
    """Export flowcharts/shapes as images using MS Word COM (Windows only)."""
    exported_paths = []
    if not WIN32_AVAILABLE:
        print("⚠️ win32com not available — skipping flowchart extraction.")
        return exported_paths

    word = win32com.client.Dispatch("Word.Application")
    word.Visible = False
    doc = word.Documents.Open(docx_path)
    count = 0
    for shape in doc.Shapes:
        count += 1
        shape_path = os.path.join(output_dir, f"flowchart_{count}.png")
        try:
            shape.Export(shape_path, 1)  # 1 = PNG
            exported_paths.append(shape_path)
        except Exception:
            pass
    doc.Close(False)
    word.Quit()
    return exported_paths


def table_to_latex(table):
    """Convert Word table to LaTeX tabular format."""
    rows = []
    for row in table.rows:
        cells = [cell.text.strip().replace("\n", " ") for cell in row.cells]
        rows.append(" & ".join(cells) + r" \\")
    col_count = len(table.rows[0].cells) if table.rows else 1
    header = r"\begin{tabular}{" + "|c" * col_count + "|}" + "\n\\hline"
    body = "\n\\hline\n".join(rows)
    footer = "\n\\hline\n\\end{tabular}"
    return f"{header}\n{body}{footer}"


# -----------------------------
# CORE PROCESSING FUNCTION
# -----------------------------
def process_docx(docx_path):
    doc = Document(docx_path)
    basename = os.path.splitext(os.path.basename(docx_path))[0]
    print(f"\n📄 Processing: {basename}.docx")

    img_counter = 0
    tbl_counter = 0
    latex_insertions = 0

    # Export flowcharts first
    flowcharts = export_shapes_to_images(docx_path, EXTRACT_DIR)
    if flowcharts:
        print(f"🧩 Exported {len(flowcharts)} flowcharts.")

    body_elements = list(doc.element.body)

    for element in body_elements:
        tag = element.tag

        # ---------- TABLE ----------
        if tag.endswith("tbl"):
            tbl_counter += 1
            for tbl in doc.tables:
                if tbl._element is element:
                    latex_code = table_to_latex(tbl)
                    safe_latex = escape(latex_code)
                    parent = element.getparent()
                    idx = parent.index(element)
                    placeholder = parse_xml(
                        f'<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
                        f'<w:r><w:t>[LaTeX Table: {safe_latex}]</w:t></w:r></w:p>'
                    )
                    parent.insert(idx + 1, placeholder)
                    parent.remove(element)
                    latex_insertions += 1
                    break

        # ---------- PARAGRAPH (check for embedded images) ----------
        elif tag.endswith("p"):
            paragraph = next((p for p in doc.paragraphs if p._element is element), None)
            if not paragraph:
                continue

            for run in paragraph.runs:
                blips = run.element.xpath(".//a:blip")
                if blips:
                    img_counter += 1
                    embed_rid = blips[0].get(qn("r:embed"))
                    image_part = doc.part.related_parts[embed_rid]
                    image_data = image_part.blob
                    img_path = save_image(image_data, basename, img_counter)
                    run.text = f"[Image: {img_path}]"
                    for blip in blips:
                        blip.getparent().remove(blip)

    # ---------- FLOWCHARTS ----------
    for fc_path in flowcharts:
        safe_chart = escape(
            f"\\begin{{figure}}[h]\\centering\\includegraphics[width=0.8\\linewidth]{{{os.path.basename(fc_path)}}}\\caption{{Flowchart extracted}}\\end{{figure}}"
        )
        doc.add_paragraph(f"[LaTeX Flowchart: {safe_chart}]")

    # ---------- SAVE UPDATED DOCX ----------
    updated_path = os.path.join(OUTPUT_DIR, f"updated_{basename}.docx")
    doc.save(updated_path)
    print(f"✅ Saved updated Word: {updated_path}")
    print(f"   Extracted {img_counter} images, {tbl_counter} tables, {latex_insertions} LaTeX tables inserted.")

    # ---------- PDF CONVERSION ----------
    pdf_path = os.path.join(PDF_DIR, f"{basename}.pdf")
    try:
        convert(updated_path, pdf_path)
        print(f"📘 Converted to PDF: {pdf_path}")
    except Exception as e:
        print(f"⚠️ PDF conversion failed for {basename}: {e}")

    return updated_path, pdf_path


# -----------------------------
# MAIN SCRIPT
# -----------------------------
def main():
    docx_files = [f for f in os.listdir(INPUT_DIR) if f.lower().endswith(".docx")]
    if not docx_files:
        print("⚠️ No .docx files found in input folder.")
        return

    for file in docx_files:
        process_docx(os.path.join(INPUT_DIR, file))

    print("\n🎉 All documents processed successfully!")
    print(f"📂 Extracted images/tables in: {EXTRACT_DIR}")
    print(f"📄 Updated .docx files in: {OUTPUT_DIR}")
    print(f"📘 PDFs saved in: {PDF_DIR}")


if __name__ == "__main__":
    main()
