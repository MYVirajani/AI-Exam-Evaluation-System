# extract_figures_tables.py
import os
import json
import fitz
import cv2
import numpy as np
import pdfplumber
from PIL import Image
from docx import Document

INPUT_FOLDER = "docs"
OUTPUT_FOLDER = "outputs"


def ensure_dir(path):
    os.makedirs(path, exist_ok=True)


# ---------------- PDF FIGURE EXTRACTION ---------------- #
def extract_figures_from_pdf(pdf_path, output_figure_dir):
    doc = fitz.open(pdf_path)
    figure_metadata = []

    for page_index, page in enumerate(doc, start=1):
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
        np_img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, 3)

        gray = cv2.cvtColor(np_img, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 80, 200)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        count = 0
        for cnt in contours:
            x, y, w, h = cv2.boundingRect(cnt)
            if w > 100 and h > 100 and w * h > 4000:
                roi = np_img[y:y + h, x:x + w]
                count += 1
                fig_path = os.path.join(output_figure_dir, f"figure_page{page_index}_{count}.png")
                Image.fromarray(roi).save(fig_path)
                figure_metadata.append({
                    "type": "figure",
                    "page": page_index,
                    "figure_file": os.path.basename(fig_path),
                    "bbox": [int(x), int(y), int(w), int(h)]
                })

    doc.close()
    return figure_metadata


# ---------------- PDF TABLE EXTRACTION ---------------- #
def extract_tables_from_pdf(pdf_path, output_table_dir):
    table_metadata = []
    count = 0

    with pdfplumber.open(pdf_path) as pdf:
        for page_index, page in enumerate(pdf.pages, start=1):
            tables = page.extract_tables()
            for table in tables:
                count += 1
                table_path = os.path.join(output_table_dir, f"table_page{page_index}_{count}.json")
                with open(table_path, "w", encoding="utf-8") as f:
                    json.dump(table, f, indent=2)
                table_metadata.append({
                    "type": "table",
                    "page": page_index,
                    "table_file": os.path.basename(table_path),
                    "rows": len(table),
                    "cols": len(table[0]) if table else 0
                })

    return table_metadata


# ---------------- WORD IMAGE EXTRACTION ---------------- #
def extract_images_from_docx(docx_path, output_figure_dir):
    from zipfile import ZipFile

    figure_metadata = []
    with ZipFile(docx_path, "r") as docx:
        count = 0
        for file in docx.namelist():
            if file.startswith("word/media/") and (file.lower().endswith(".png") or file.lower().endswith(".jpg") or file.lower().endswith(".jpeg")):
                count += 1
                image_data = docx.read(file)
                image_path = os.path.join(output_figure_dir, f"figure_{count}.png")
                with open(image_path, "wb") as img_file:
                    img_file.write(image_data)
                figure_metadata.append({
                    "type": "figure",
                    "figure_file": os.path.basename(image_path)
                })
    return figure_metadata


# ---------------- WORD TABLE EXTRACTION ---------------- #
def extract_tables_from_docx(docx_path, output_table_dir):
    doc = Document(docx_path)
    table_metadata = []
    count = 0

    for t_index, table in enumerate(doc.tables, start=1):
        data = []
        for row in table.rows:
            data.append([cell.text.strip() for cell in row.cells])
        count += 1
        table_path = os.path.join(output_table_dir, f"table_{t_index}.json")
        with open(table_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        table_metadata.append({
            "type": "table",
            "table_file": os.path.basename(table_path),
            "rows": len(data),
            "cols": len(data[0]) if data else 0
        })

    return table_metadata


# ---------------- PROCESSING FUNCTION ---------------- #
def process_documents(input_folder=INPUT_FOLDER, output_folder=OUTPUT_FOLDER):
    files = [f for f in os.listdir(input_folder) if f.lower().endswith((".pdf", ".docx"))]
    if not files:
        print("[!] No PDF or DOCX files found in folder:", input_folder)
        return

    print(f"[+] Found {len(files)} document(s) to process...")

    for file_name in files:
        file_path = os.path.join(input_folder, file_name)
        student_name = os.path.splitext(file_name)[0]
        student_folder = os.path.join(output_folder, student_name)
        figure_dir = os.path.join(student_folder, "figures")
        table_dir = os.path.join(student_folder, "tables")

        ensure_dir(figure_dir)
        ensure_dir(table_dir)

        print(f"\n[+] Processing '{file_name}'...")
        figures_metadata, tables_metadata = [], []

        if file_name.lower().endswith(".pdf"):
            figures_metadata = extract_figures_from_pdf(file_path, figure_dir)
            tables_metadata = extract_tables_from_pdf(file_path, table_dir)
        elif file_name.lower().endswith(".docx"):
            figures_metadata = extract_images_from_docx(file_path, figure_dir)
            tables_metadata = extract_tables_from_docx(file_path, table_dir)

        metadata = {
            "file": file_name,
            "num_figures": len(figures_metadata),
            "num_tables": len(tables_metadata),
            "figures": figures_metadata,
            "tables": tables_metadata
        }

        meta_path = os.path.join(student_folder, "metadata.json")
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=4)

        print(f"[✓] Completed '{file_name}' — Figures: {len(figures_metadata)}, Tables: {len(tables_metadata)}")

    print("\n[✓] All documents processed successfully!")


if __name__ == "__main__":
    process_documents()
