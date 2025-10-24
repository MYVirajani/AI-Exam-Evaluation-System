EXTRACT_MODEL_ANSWERS_PROMPT = """
You will receive the full text of an *official model-answer or marking guide* document.  
The text may include embedded media references represented as:
[Image: <absolute_or_relative_path_to_image>]

-----------------------------------
**Your Tasks:**

1. **Extract global metadata** (only once per document):
   - "module_code": e.g., "EE6250"
   - "exam_year": e.g., 2025
   - "exam_month": e.g., "June"

2. **Reconstruct the full question hierarchy** exactly as it appears in the source:
   Example: Q1 → Q1.i → Q1.i.a

3. **For each lowest-level question node**, extract the following fields:

   - `"question"`: The question text (if not explicitly present, set to "")
   - `"answer"`: The official model answer text.  
     ⚠️ Note: The model answer **can sometimes be an empty string** — handle this gracefully.
   - `"guideline"`: Include all *marking criteria*, *key points*, and *instructions for checking* that apply to evaluating the answer.  
     These may appear as bullet points, notes, or phrases such as “Key Points,” “Instructions for checking,” “Marking guidelines,” etc.  
     Merge them into a single coherent text block (or "" if none found).
   - `"marks"`: Maximum marks (integer, or null if not specified).
   - `"media_urls"`: A list of all image paths extracted from `[Image: ...]` tags in that specific answer section.  
     Example: ["E:/data/extracted_media/Model_answer_diagram_img_4.png"]

-----------------------------------
**Output Format — JSON only**

Return a single, valid JSON object strictly following this structure:

{
  "metadata": {
    "module_code": "EE6250",
    "exam_year": 2025,
    "exam_month": "June"
  },
  "answers": {
    "Q1": {
      "i": {
          "question": "Define supervised learning.",
          "answer": "Supervised learning is ...",
          "guideline": "Include mention of labeled data and prediction tasks. Key Points: labeled dataset, prediction of outcomes. Instructions for checking: verify both terms are present.",
          "marks": 5,
          "media_urls": ["E:/path/to/image1.png", "E:/path/to/image2.png"]
      },
      "ii": {
        "question": "Explain overfitting in ML.",
        "answer": "",
        "guideline": "Key points: overfitting occurs when model fits training data too closely. Instructions for checking: mention poor generalization.",
        "marks": 3,
        "media_urls": []
      }
    },
    "Q2": { ... }
  }
}

-----------------------------------
**Strict Rules:**

* Output **only valid JSON** — no markdown, no explanations, no code fences.
* Maintain **nested hierarchy** exactly as found (e.g., "Q1" → "i" → "a").
* Each question node must include all **five fields**: `question`, `answer`, `guideline`, `marks`, `media_urls`.
* `media_urls` must always be a **JSON array**, even if empty.
* Clean up redundant spaces, ensure syntactically valid and well-formatted JSON.
* Do **not alter or shorten** any image paths inside `[Image: ...]` tags.
"""
