# ===============================================
# File: src/scripts/ImageSummarizerLLM.py
# Description: Image summarizer with guideline-based model analysis
# ===============================================

import os
import base64
import logging
from openai import OpenAI
from src.prompts.media_summarizer_prompt import SUMMARY_PROMPT, MODEL_SUMMARY_PROMPT  

logging.basicConfig(level=logging.INFO)


class ImageSummarizerLLM:
    """
    Summarizes images (charts, diagrams, tables, etc.) from either
    student answer scripts or model answer papers using GPT-4-Vision.
    """

    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("❌ OPENAI_API_KEY not found in environment variables.")
        self.client = OpenAI(api_key=self.api_key)

    def summarize_image(
        self,
        image_path: str,
        mode: str = "student",
        domain: str = "General",
        guideline_text: str | None = None
    ) -> str | None:
        """
        Describe a local image by encoding it to Base64 and sending it inline.
        mode: "student" | "model"
        domain: subject or academic domain (e.g., Physics, Civil Engineering)
        guideline_text: optional marking scheme or answer guideline text for model images
        Returns a textual descriptive summary.
        """
        if not os.path.exists(image_path):
            logging.error(f"[LLM] ❌ File not found: {image_path}")
            return None

        # Format domain into the system prompt
        if mode == "model":
            system_prompt = MODEL_SUMMARY_PROMPT.format(domain=domain).strip()
            user_context = (
                f"Analyze this model answer image within the domain of {domain}. "
                "Compare the answer with the provided marking guidelines and explain how it aligns "
                "with the expected structure, notation, and technical accuracy."
            )

            if guideline_text:
                user_context += f"\n\n---\n📘 GUIDELINES:\n{guideline_text.strip()}\n---\n"

        else:
            system_prompt = SUMMARY_PROMPT.format(domain=domain).strip()
            user_context = (
                f"Analyze this student's answer image within the domain of {domain}. "
                "Summarize it based on notations and conventions standard to that field."
            )

        try:
            with open(image_path, "rb") as img_file:
                image_bytes = img_file.read()
            base64_image = base64.b64encode(image_bytes).decode("utf-8")

            ext = os.path.splitext(image_path)[-1].lower().replace(".", "")
            mime_type = f"image/{'jpeg' if ext in ['jpg', 'jpeg'] else ext}"

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": user_context},
                            {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{base64_image}" }},
                        ],
                    },
                ],
                max_tokens=700,
            )

            summary = response.choices[0].message.content.strip()
            logging.info(f"[LLM] ✅ Summarized ({mode}, domain={domain}): {os.path.basename(image_path)}")
            return summary

        except Exception as e:
            logging.exception(f"[LLM] ❌ Failed to summarize image {image_path}: {e}")
            return None


# ----------------------------------------------------------------------
# Manual Testing (Run directly)
# ----------------------------------------------------------------------
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Test GPT-4 Vision summarizer on a local image file.")
    parser.add_argument("--image_path", required=True, help="Path to a local image (e.g., ./sample.png)")
    parser.add_argument("--mode", default="student", choices=["student", "model"], help="Image type to summarize")
    parser.add_argument("--domain", default="General", help="Academic domain (e.g., Physics, Civil Engineering)")
    parser.add_argument("--guideline", default=None, help="Path to text file containing model guidelines")

    args = parser.parse_args()

    guideline_text = None
    if args.guideline and os.path.exists(args.guideline):
        with open(args.guideline, "r", encoding="utf-8") as f:
            guideline_text = f.read()

    summarizer = ImageSummarizerLLM()
    summary = summarizer.summarize_image(
        args.image_path,
        mode=args.mode,
        domain=args.domain,
        guideline_text=guideline_text
    )

    print("\n🧠 IMAGE SUMMARY RESULT\n" + "-" * 60)
    print(summary or "❌ No summary generated.")
