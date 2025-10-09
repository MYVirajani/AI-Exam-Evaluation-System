# extract_figures_tables.py
import os
import json
import fitz 
import cv2
import numpy as np
import pdfplumber
from PIL import Image

INPUT_FOLDER = "pdfs"
OUTPUT_FOLDER = "outputs"


def ensure_dir(path):
    os.makedirs(path, exist_ok=True)



def extract_figures(pdf_path, output_figure_dir):
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
                    "page": page_index,
                    "figure_file": os.path.basename(fig_path),
                    "bbox": [int(x), int(y), int(w), int(h)]
                })

    doc.close()
    return figure_metadata


def process_pdfs(input_folder=INPUT_FOLDER, output_folder=OUTPUT_FOLDER):
    pdf_files = [f for f in os.listdir(input_folder) if f.lower().endswith(".pdf")]
    if not pdf_files:
        print("[!] No PDF files found in folder:", input_folder)
        return

    print(f"[+] Found {len(pdf_files)} PDF(s) to process...")

    for pdf_file in pdf_files:
        pdf_path = os.path.join(input_folder, pdf_file)
        student_name = os.path.splitext(pdf_file)[0]
        student_folder = os.path.join(output_folder, student_name)
        figure_dir = os.path.join(student_folder, "figures")
        ensure_dir(figure_dir)

        print(f"\n[+] Processing '{pdf_file}'...")
        figures_metadata = extract_figures(pdf_path, figure_dir)

        metadata = {
            "student_file": pdf_file,
            "num_figures": len(figures_metadata),
            "figures": figures_metadata,
        }
        meta_path = os.path.join(student_folder, "metadata.json")
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=4)

        print(f"[✓] Completed '{pdf_file}' — Figures: {len(figures_metadata)}")

    print("\n[✓] All PDFs processed successfully!")


if __name__ == "__main__":
    process_pdfs()
