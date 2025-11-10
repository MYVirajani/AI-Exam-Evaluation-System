# import torch
# from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
# import re, json

# class LocalFinetunedExtractor:
#     def __init__(self, model_path: str):
#         print(f"🔹 Loading local fine-tuned model from: {model_path}")

#         # Ensure UTF-8 environment (Windows fix)
#         import os, sys
#         os.environ["PYTHONUTF8"] = "1"
#         sys.stdout.reconfigure(encoding='utf-8')
#         sys.stderr.reconfigure(encoding='utf-8')

#         # Load tokenizer and model
#         self.tokenizer = AutoTokenizer.from_pretrained(
#             model_path,
#             trust_remote_code=True,
#             use_fast=False,
#         )

#         self.model = AutoModelForCausalLM.from_pretrained(
#             model_path,
#             torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
#             device_map="cpu",
#             trust_remote_code=True,
#         )

#         # Create a text-generation pipeline
#         self.pipe = pipeline(
#             "text-generation",
#             model=self.model,
#             tokenizer=self.tokenizer,
#             max_new_tokens=1024,
#             do_sample=False,
#         )

#     # def extract(self, prompt: str) -> str:
#     #     """Run generation on local fine-tuned model"""
#     #     print("🧠 Generating from local fine-tuned model...")
#     #     outputs = self.pipe(prompt)
#     #     return outputs[0]["generated_text"]
#     # def extract(self, prompt: str):
#     #     print("🧠 Generating from local fine-tuned model...")
#     #     outputs = self.pipe(prompt)
#     #     raw_output = outputs[0]["generated_text"]

#     #     print("\n==== RAW MODEL OUTPUT ====\n", raw_output, "\n===========================\n")

#     #     # Try to extract JSON-like structure if available
#     #     match = re.search(r"\[.*\]", raw_output, re.DOTALL)
#     #     if match:
#     #         json_text = match.group(0)
#     #         json_text = re.sub(r'[\x00-\x1f\x7f]', '', json_text)
#     #         try:
#     #             parsed = json.loads(json_text)
#     #             if isinstance(parsed, list):
#     #                 return parsed  # ✅ expected structure
#     #         except json.JSONDecodeError:
#     #             print("⚠️ JSON parse failed, fallback to plain text parsing")

#     #     # 🔄 If no JSON found, fallback: single text answer block
#     #     print("⚠️ JSON not found. Treating model output as plain text.")
#     #     return [
#     #         {
#     #             "question": "Q1_i",
#     #             "answer": raw_output.strip()
#     #         }
#     #     ]
    
#     # def extract(self, prompt: str):
#     #     print("🧠 Generating from local fine-tuned model...")
#     #     outputs = self.pipe(prompt)
#     #     raw_output = outputs[0]["generated_text"]

#     #     print("\n==== RAW MODEL OUTPUT ====\n", raw_output, "\n===========================\n")

#     #     # Split by sub-question pattern (i), (ii), (iii), etc.
#     #     items = re.split(r'\((\w+)\)', raw_output)[1:]  # returns [i, text, ii, text,...]
#     #     answers = {}
#     #     for idx in range(0, len(items), 2):
#     #         q_num = items[idx].strip()
#     #         ans_text = items[idx+1].strip()
#     #         answers[q_num] = ans_text

#     #     # Convert to list of dicts like before
#     #     structured_output = [{"question": f"Q1_{k}", "answer": v} for k, v in answers.items()]
#     #     return structured_output

# import torch
# from transformers import pipeline

# class LocalFinetunedExtractor:
#     """
#     Loads and runs a locally fine-tuned model (e.g., DeepSeek).
#     """

#     def __init__(self, model_path: str):
#         print(f"🔹 Loading local fine-tuned model from: {model_path}")

#         # Detect device (GPU if available, else CPU)
#         self.device = "cuda" if torch.cuda.is_available() else "cpu"
#         print(f"Device set to use {self.device}")

#         # Initialize model pipeline
#         self.pipe = pipeline(
#             "text-generation",
#             model=model_path,
#             torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
#             device=0 if torch.cuda.is_available() else -1,
#         )

#     def extract(self, prompt: str) -> str:
#         """
#         Run generation using the fine-tuned model.
#         """
#         print("🧠 Generating from local fine-tuned model...")
#         outputs = self.pipe(prompt, max_new_tokens=512)
#         return outputs[0]["generated_text"]


# import os
# import torch
# from transformers import pipeline

# class LocalFinetunedExtractor:
#     """
#     Loads and runs a locally fine-tuned model (e.g., DeepSeek).
#     """

#     def __init__(self, model_path: str):
#         print(f"🔹 Loading local fine-tuned model from: {model_path}")

#         # 🔒 Force CPU mode (ignore any GPU)
#         os.environ["CUDA_VISIBLE_DEVICES"] = ""
#         self.device = "cpu"
#         print("Device forced to CPU (CUDA disabled)")

#         # Initialize model pipeline on CPU
#         self.pipe = pipeline(
#             "text-generation",
#             model=model_path,
#             torch_dtype=torch.float32,  # ✅ Always use float32 on CPU
#             device=-1,  # ✅ -1 means CPU
#         )

#     def extract(self, prompt: str) -> str:
#         """
#         Run generation using the fine-tuned model.
#         """
#         print("🧠 Generating from local fine-tuned model (CPU)...")
#         outputs = self.pipe(prompt, max_new_tokens=512)
#         return outputs[0]["generated_text"]


# src/services/local_finetuned_grader.py

# import os
# import re
# import json
# import torch
# from transformers import pipeline

# class LocalFinetunedGrader:
#     """
#     Loads and runs a locally fine-tuned model (e.g., DeepSeek)
#     specifically for grading (not extraction).
#     """

#     def __init__(self, model_path: str):
#         print(f"🔹 Loading local fine-tuned model for grading from: {model_path}")

#         # Force CPU mode for compatibility
#         os.environ["CUDA_VISIBLE_DEVICES"] = ""
#         self.device = "cpu"
#         print("Device forced to CPU (CUDA disabled)")

#         # Initialize model pipeline on CPU
#         self.pipe = pipeline(
#             "text-generation",
#             model=model_path,
#             torch_dtype=torch.float32,  # ✅ CPU-safe dtype
#             device=-1,  # ✅ Use CPU
#         )

#     def grade(self, prompt):
#         """
#         Run grading prompt through local fine-tuned model and return standardized JSON string.
#         """
#         print("🧠 Generating grading output from local fine-tuned model (CPU)...")
        
#         # 🔧 Use self.pipe (not self.pipeline)
#         response = self.pipe(prompt)

#         # 🔍 Log what model actually returned (optional, but helpful)
#         print("Raw model output:", response)

#         # 🧩 Handle different return formats
#         if isinstance(response, dict):
#             return json.dumps(response, ensure_ascii=False)
#         if isinstance(response, list) and len(response) > 0 and isinstance(response[0], dict):
#             if "generated_text" in response[0]:
#                 return response[0]["generated_text"]
#             else:
#                 return json.dumps(response[0], ensure_ascii=False)
#         return str(response)

# import os
# import re
# import json
# import torch
# from transformers import pipeline

# class LocalFinetunedGrader:
#     """
#     Loads and runs a locally fine-tuned model (e.g., DeepSeek)
#     specifically for grading (not extraction).
#     """

#     def __init__(self, model_path: str):
#         print(f"🔹 Loading local fine-tuned model for grading from: {model_path}")
#         os.environ["CUDA_VISIBLE_DEVICES"] = ""
#         self.device = "cpu"
#         print("Device forced to CPU (CUDA disabled)")

#         self.pipe = pipeline(
#             "text-generation",
#             model=model_path,
#             torch_dtype=torch.float32,
#             device=-1,
#         )

#     def grade(self, prompt):
#         """
#         Run grading prompt through local fine-tuned model and return
#         standardized JSON *string* for compatibility with RAG grader.
#         """
#         print("🧠 Generating grading output from local fine-tuned model (CPU)...")
#         response = self.pipe(prompt)
#         print("Raw model output:", response)

#         # --- Extract text ---
#         if isinstance(response, list) and len(response) > 0:
#             if isinstance(response[0], dict) and "generated_text" in response[0]:
#                 output_text = response[0]["generated_text"]
#             else:
#                 output_text = str(response[0])
#         elif isinstance(response, dict):
#             output_text = response.get("generated_text", str(response))
#         else:
#             output_text = str(response)

#         # --- Try to extract valid JSON from text ---
#         match = re.search(r"\{.*?\}", output_text, re.DOTALL)
#         if match:
#             json_text = match.group(0)
#             try:
#                 data = json.loads(json_text)
#                 # ✅ Ensure keys exist and are valid
#                 score = float(data.get("score", 0))
#                 reason = data.get("reason", "").strip()
#                 clean_json = json.dumps({"score": score, "reason": reason}, ensure_ascii=False)
#                 print("✅ Clean JSON extracted:", clean_json)
#                 return clean_json
#             except Exception as e:
#                 print(f"⚠️ JSON parse failed: {e}")

#         # --- Fallback: if no JSON found, produce default structure ---
#         print("⚠️ No valid JSON found in model output; returning fallback JSON.")
#         fallback_json = json.dumps({
#             "score": 0,
#             "reason": "Invalid LLM Response"
#         })
#         return fallback_json


# import os
# import re
# import json
# import torch
# from transformers import pipeline

# class LocalFinetunedGrader:
#     """
#     Loads and runs a locally fine-tuned model (e.g., DeepSeek)
#     specifically for grading student answers.
#     """

#     def __init__(self, model_path: str):
#         print(f"🔹 Loading local fine-tuned model for grading from: {model_path}")
#         os.environ["CUDA_VISIBLE_DEVICES"] = ""  # Force CPU
#         self.device = "cpu"
#         print("Device forced to CPU (CUDA disabled)")

#         self.pipe = pipeline(
#             "text-generation",
#             model=model_path,
#             torch_dtype=torch.float32,
#             device=-1,  # CPU
#         )

#     def extract_json(self, output_text: str) -> dict:
#         """
#         Safely extract JSON from model output text.
#         Handles messy wrappers like <think>, <jason>, ```json```, or extra text.
#         Returns a dictionary with keys: 'score' and 'reason'.
#         """
#         # Find all JSON-like blocks in the text
#         candidates = re.findall(r"\{.*?\}", output_text, re.DOTALL)
#         for candidate in reversed(candidates):  # try last block first
#             try:
#                 data = json.loads(candidate)
#                 # Ensure required keys exist
#                 score = float(data.get("score", 0))
#                 reason = data.get("reason", "").strip()
#                 return {"score": score, "reason": reason}
#             except Exception as e:
#                 continue
#         # Fallback if no valid JSON
#         return {"score": 0, "reason": "Invalid LLM Response"}

#     def grade(self, prompt: str) -> str:
#         """
#         Run grading prompt through the local fine-tuned model.
#         Returns a standardized JSON string for compatibility with RAG grader.
#         """
#         print("🧠 Generating grading output from local fine-tuned model (CPU)...")
#         response = self.pipe(prompt)
#         print("Raw model output:", response)

#         # Extract the generated text
#         if isinstance(response, list) and len(response) > 0:
#             if isinstance(response[0], dict) and "generated_text" in response[0]:
#                 output_text = response[0]["generated_text"]
#             else:
#                 output_text = str(response[0])
#         elif isinstance(response, dict):
#             output_text = response.get("generated_text", str(response))
#         else:
#             output_text = str(response)

#         # Extract JSON from model output
#         data = self.extract_json(output_text)

#         # Convert to JSON string for storage
#         clean_json = json.dumps(data, ensure_ascii=False)
#         print("✅ Clean JSON extracted:", clean_json)
#         return clean_json


# # Example usage
# if __name__ == "__main__":
#     model_path = "path/to/your/fine-tuned-model"
#     grader = LocalFinetunedGrader(model_path)

#     prompt = """
#     You are a strict but fair examiner. Grade the student answer using
#     the model answer and marking guideline.

#     STUDENT ANSWER: Middleware in Express processes requests and responses.

#     MAXIMUM MARKS: 1.0

#     OUTPUT (JSON ONLY):
#     {"score": <int>, "reason": "<one-sentence explanation>"}
#     """
#     result = grader.grade(prompt)
#     print("Final grading output:", result)

import os
import re
import json
import torch
from transformers import pipeline


class LocalFinetunedGrader:
    """
    Loads and runs a locally fine-tuned model (e.g., DeepSeek)
    specifically for grading student answers.
    """

    def __init__(self, model_path: str):
        print(f"🔹 Loading local fine-tuned model for grading from: {model_path}")
        os.environ["CUDA_VISIBLE_DEVICES"] = ""  # Force CPU
        self.device = "cpu"
        print("Device forced to CPU (CUDA disabled)")

        self.pipe = pipeline(
            "text-generation",
            model=model_path,
            torch_dtype=torch.float32,
            device=-1,  # CPU
        )

    # -------------------------------------------------------------------------
    # SANITIZE MODEL OUTPUT
    # -------------------------------------------------------------------------
    def _clean_output(self, text: str) -> str:
        """
        Removes assistant chatter, <think> blocks, explanations,
        and everything before the first '{'.
        """
        # Remove <think> blocks
        text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)

        # Remove words like "Assistant:" or analysis before JSON
        if "{" in text:
            text = text[text.index("{") :]

        # Remove trailing junk after last }
        if "}" in text:
            last = text.rindex("}") + 1
            text = text[:last]

        return text.strip()

    # -------------------------------------------------------------------------
    # STRICT JSON EXTRACTION
    # -------------------------------------------------------------------------
    def extract_json(self, output_text: str) -> dict:
        output_text = self._clean_output(output_text)

        candidates = re.findall(r"\{.*?\}", output_text, re.DOTALL)

        for candidate in reversed(candidates):
            try:
                data = json.loads(candidate)

                score = float(data.get("score", 0))
                reason = str(data.get("reason", "")).strip()

                return {"score": score, "reason": reason}

            except Exception:
                continue

        return {"score": 0, "reason": "Invalid LLM Response"}

    # -------------------------------------------------------------------------
    # SINGLE QUESTION GRADING
    # -------------------------------------------------------------------------
    def grade(self, prompt: str) -> str:
        """
        Force the model to output JSON only.
        """
        print("🧠 Generating grading output from local fine-tuned model (CPU)...")

        response = self.pipe(
            prompt,
            max_new_tokens=150,
            do_sample=False,
            temperature=0.0,         # <-- NO creativity
            top_p=1.0,
            repetition_penalty=1.2,  # <-- avoids chatter repeats
            eos_token_id=None,
        )

        print("Raw model output:", response)

        # Extract text
        if isinstance(response, list) and response and "generated_text" in response[0]:
            output_text = response[0]["generated_text"]
        else:
            output_text = str(response)

        data = self.extract_json(output_text)

        clean_json = json.dumps(data, ensure_ascii=False)
        print("✅ Clean JSON extracted:", clean_json)

        return clean_json

    # -------------------------------------------------------------------------
    # MULTIPLE QUESTION GRADING
    # -------------------------------------------------------------------------
    def grade_multiple(self, answers_json: dict, rubric_text: str) -> dict:
        results = {}

        for key, student_answer in answers_json.items():
            print(f"\n🔍 Grading {key}...")

            if not student_answer or not student_answer.strip():
                results[key] = {"score": 0, "reason": "Empty answer"}
                continue

            prompt = f"""
You are a strict examiner. Grade the answer.

STUDENT ANSWER:
{student_answer}

RUBRIC:
{rubric_text}

OUTPUT STRICTLY IN JSON:
{{
  "score": <int_or_float>,
  "reason": "<one short sentence>"
}}
ONLY RETURN JSON. NO EXPLANATION. NO ANALYSIS. NO TALKING.
"""

            raw_json = self.grade(prompt)

            try:
                cleaned = json.loads(raw_json)
            except Exception:
                cleaned = {"score": 0, "reason": "Invalid LLM Response"}

            results[key] = cleaned

        return results


# -------------------------------------------------------------------------
# RUN TEST
# -------------------------------------------------------------------------
if __name__ == "__main__":
    model_path = "E:\finetune_voice\DeepSeek-R1-DomainData-Merged"
    grader = LocalFinetunedGrader(model_path)

    student_answers = {
        "Q1_i": "Create, Read, Update, Delete operations...",
        "Q1_ii": "Primary key ensures uniqueness...",
        "Q1_iii": "",
        "Q1_iv": "Foreign key links tables...",
    }

    rubric = "Award marks based on correctness and clarity."

    results = grader.grade_multiple(student_answers, rubric)
    print(json.dumps(results, indent=2))
