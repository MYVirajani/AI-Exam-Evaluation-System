EXTRACT_MODEL_ANSWERS_PROMPT = """
You will receive the full text of an *official model-answer or marking guide* document.  
The text may include embedded media references represented as:
[Image: <absolute_or_relative_path_to_image>]

It may also contain **mathematical equations** written inline (e.g., `x = y + 2`) or as separate lines, 
including special symbols (ω, ζ, s², Laplace, ⇒, ∝, etc.), or LaTeX-style notation.

-----------------------------------
### Your Tasks

1. **Extract media URLs**
   - Detect all `[Image: <path>]` placeholders.
   - Store each image path (absolute or relative) under the `"media_urls"` field of the corresponding question.
   - Remove the `[Image: ...]` placeholder from the `"answer"` text.

2. **Reconstruct the full question hierarchy**  
   Maintain the original numbering pattern exactly as in the document.  
   Examples:
   - Q1 → Q1.i → Q1.i.a  
   - Q2 → Q2.a → Q2.a.ii  

3. **For each lowest-level question node**, extract the following fields:
   - `"question"`: The question text (if not explicitly written, set to an empty string "").
   - `"answer"`: The official model answer content.  
     - Preserve all mathematical and symbolic expressions exactly as they appear.
     - Keep inline or multiline equations untouched (e.g., `y(t) = e^{-ζω_nt}`).
     - Maintain structure and punctuation, including newlines where meaningful.
   - `"guideline"`: Combine any *marking instructions*, *key points*, *criteria*, or *notes for examiners* into one coherent text block.  
     Examples of such sections include:
       * “Key Points”
       * “Instructions for checking”
       * “Marking guideline(s)”
       * “Expected points”  
     If none are found, set `"guideline": ""`.
   - `"marks"`: The total mark allocation (integer if explicitly given, otherwise `null`).
   - `"media_urls"`: A list of all image paths detected from `[Image: ...]` tags in that question’s section.

-----------------------------------
### Output Format — JSON Only

Return a **single valid JSON object** in the following structure:

{
  "answers": {
    "Q1": {
      "i": {
        "question": "Define supervised learning.",
        "answer": "Supervised learning is a type of machine learning that uses labeled data to train predictive models.",
        "guideline": "Key Points: labeled dataset, mapping input to output, generalization ability. Instructions for checking: ensure both 'labeled data' and 'prediction' are mentioned.",
        "marks": 5,
        "media_urls": ["E:/data/extracted_media/ML_Q1_i_img_1.png"]
      },
      "ii": {
        "question": "Explain overfitting in ML.",
        "answer": "Overfitting occurs when a model learns noise and outliers in the training data, reducing performance on unseen data.",
        "guideline": "Key points: model memorizes training data; poor generalization. Instructions for checking: mention 'training data' and 'unseen data'.",
        "marks": 3,
        "media_urls": []
      }
    },
    "Q2": {
      "a": {
        "question": "State the role of activation functions.",
        "answer": "Activation functions introduce non-linearity into neural networks, enabling them to model complex relationships.",
        "guideline": "Key points: mention non-linearity, hidden layers, and differentiability.",
        "marks": null,
        "media_urls": ["E:/path/to/activation_diagram.png"]
      }
    }
  }
}

-----------------------------------
### Strict Rules

* Output **only valid JSON** — no markdown, no explanations, no code fences.
* Maintain **exact question hierarchy** (e.g., Q1 → i → a).
* Each question node **must include all five fields**:
  `"question"`, `"answer"`, `"guideline"`, `"marks"`, `"media_urls"`.
* `media_urls` must always be a **JSON array**, even if empty.
* Remove `[Image: ...]` tags from the text body after extracting URLs.
* Preserve **equations, math notation, and symbols** exactly as written.
* Retain all meaningful newlines (`\\n`) for multi-line equations or stepwise derivations.
* Do not infer or guess missing text.
* Ensure valid JSON structure — properly quoted strings, commas, and braces.
* `marks` should be an integer (e.g., 10) or `null` if unspecified.
* Do **not modify or shorten** image paths extracted from `[Image: ...]`.

-----------------------------------
"""
