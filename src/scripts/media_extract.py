import os
from io import BytesIO
from PIL import Image
from docx import Document
from docx.oxml import parse_xml
from docx.oxml.ns import qn
from xml.sax.saxutils import escape
from docx2pdf import convert

# Optional dependencies
try:
    from docx_math import convert_omml
    DOCX_MATH_AVAILABLE = True
except ImportError:
    DOCX_MATH_AVAILABLE = False

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
    image_name = f"{doc_basename}_img_{counter}.png"
    image_path = os.path.join(EXTRACT_DIR, image_name)
    Image.open(BytesIO(image_blob)).save(image_path)
    return image_path


def export_shapes_to_images(docx_path, output_dir):
    """Export flowcharts/shapes as PNGs via MS Word COM (Windows only)."""
    exported = {}
    if not WIN32_AVAILABLE:
        print("⚠️ win32com not available — skipping flowchart export.")
        return exported

    word = win32com.client.Dispatch("Word.Application")
    word.Visible = False
    doc = word.Documents.Open(docx_path)
    for i, shape in enumerate(doc.Shapes, start=1):
        try:
            path = os.path.join(output_dir, f"flowchart_{i}.png")
            shape.Export(path, 1)
            exported[f"flowchart_{i}"] = path
        except Exception:
            pass
    doc.Close(False)
    word.Quit()
    return exported


def table_to_latex(table):
    rows = []
    for row in table.rows:
        cells = [cell.text.strip().replace("\n", " ") for cell in row.cells]
        rows.append(" & ".join(cells) + r" \\")
    col_count = len(table.rows[0].cells) if table.rows else 1
    header = r"\begin{tabular}{" + "|c" * col_count + "|}" + "\n\\hline"
    body = "\n\\hline\n".join(rows)
    footer = "\n\\hline\n\\end{tabular}"
    return f"{header}\n{body}{footer}"


def omml_to_latex(omath):
    if DOCX_MATH_AVAILABLE:
        try:
            return convert_omml(omath)
        except Exception as e:
            return f"[Equation conversion error: {e}]"
    else:
        return "[Unconverted Equation: OMML detected]"


def replace_omml_with_latex(doc):
    """Replace OMML math elements inline with LaTeX placeholders."""
    NS = {"m": "http://schemas.openxmlformats.org/officeDocument/2006/math"}
    omml_nodes = doc.element.body.xpath(".//*[local-name()='oMath'] | .//*[local-name()='oMathPara']")
    count = 0
    for omath in omml_nodes:
        latex = omml_to_latex(omath)
        safe_latex = escape(latex)
        para = parse_xml(
            f'<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
            f'<w:r><w:t>[LaTeX Equation: {safe_latex}]</w:t></w:r></w:p>'
        )
        parent = omath.getparent()
        parent.addnext(para)
        parent.remove(omath)
        count += 1
    return count


# -----------------------------
# CORE PROCESSING FUNCTION
# -----------------------------
def process_docx(docx_path):
    basename = os.path.splitext(os.path.basename(docx_path))[0]
    print(f"\n📄 Processing: {basename}.docx")

    doc = Document(docx_path)
    img_counter = 0
    tbl_counter = 0
    latex_insertions = 0

    # Export flowcharts
    flowcharts = export_shapes_to_images(docx_path, EXTRACT_DIR)

    body_elements = list(doc.element.body)

    for element in body_elements:
        tag = element.tag

        # ---------- TABLE ----------
        if tag.endswith("tbl"):
            tbl_counter += 1
            for tbl in doc.tables:
                if tbl._element is element:
                    latex = table_to_latex(tbl)
                    safe_latex = escape(latex)
                    parent = element.getparent()
                    idx = parent.index(element)
                    para = parse_xml(
                        f'<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
                        f'<w:r><w:t>[LaTeX Table: {safe_latex}]</w:t></w:r></w:p>'
                    )
                    parent.insert(idx + 1, para)
                    parent.remove(element)
                    latex_insertions += 1
                    break

        # ---------- PARAGRAPHS ----------
        elif tag.endswith("p"):
            paragraph = next((p for p in doc.paragraphs if p._element is element), None)
            if not paragraph:
                continue

            # Embedded images
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

    # ---------- EQUATIONS (OMML) ----------
    eq_count = replace_omml_with_latex(doc)
    latex_insertions += eq_count
    if eq_count:
        print(f"🧮 Converted {eq_count} equations to LaTeX.")

    # ---------- FLOWCHARTS ----------
    for name, path in flowcharts.items():
        safe_chart = escape(
            f"\\begin{{figure}}[h]\\centering\\includegraphics[width=0.8\\linewidth]{{{os.path.basename(path)}}}\\caption{{Flowchart extracted}}\\end{{figure}}"
        )
        doc.add_paragraph(f"[LaTeX Flowchart: {safe_chart}]")

    # ---------- SAVE ----------
    updated_path = os.path.join(OUTPUT_DIR, f"updated_{basename}.docx")
    doc.save(updated_path)
    print(f"✅ Saved updated Word: {updated_path}")
    print(f"   Extracted {img_counter} images, {tbl_counter} tables, {latex_insertions} LaTeX inserts.")

    # ---------- PDF ----------
    pdf_path = os.path.join(PDF_DIR, f"{basename}.pdf")
    try:
        convert(updated_path, pdf_path)
        print(f"📘 Converted to PDF: {pdf_path}")
    except Exception as e:
        print(f"⚠️ PDF conversion failed for {basename}: {e}")

    return updated_path, pdf_path


# -----------------------------
# MAIN
# -----------------------------
def main():
    docx_files = [f for f in os.listdir(INPUT_DIR) if f.lower().endswith(".docx")]
    if not docx_files:
        print("⚠️ No .docx files found in input folder.")
        return

    for file in docx_files:
        process_docx(os.path.join(INPUT_DIR, file))

    print("\n🎉 All documents processed successfully!")
    print(f"📂 Extracted media in: {EXTRACT_DIR}")
    print(f"📄 Updated Word docs in: {OUTPUT_DIR}")
    print(f"📘 PDFs in: {PDF_DIR}")


if __name__ == "__main__":
    main()
