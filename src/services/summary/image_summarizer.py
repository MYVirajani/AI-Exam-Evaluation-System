import os
import base64
import logging
from openai import OpenAI
from src.prompts.media_summarizer_prompt import SUMMARY_PROMPT

logging.basicConfig(level=logging.INFO)


class ImageSummarizerLLM:
    """
    Summarizes local student answer images (charts, diagrams, tables, etc.)
    using GPT-4-Vision (gpt-4o-mini) and a structured academic summarization prompt.
    """

    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("❌ OPENAI_API_KEY not found in environment variables.")
        self.client = OpenAI(api_key=self.api_key)

    # ----------------------------------------------------------------------
    # Summarize local image using GPT-4-Vision
    # ----------------------------------------------------------------------
    def summarize_image(self, image_path: str) -> str | None:
        """
        Describe a local image by encoding it to Base64 and sending it inline.
        Returns a textual descriptive summary.
        """
        if not os.path.exists(image_path):
            logging.error(f"[LLM] ❌ File not found: {image_path}")
            return None

        try:
            # --- Encode image as base64 ---
            with open(image_path, "rb") as img_file:
                image_bytes = img_file.read()
            base64_image = base64.b64encode(image_bytes).decode("utf-8")

            # Detect MIME type
            ext = os.path.splitext(image_path)[-1].lower().replace(".", "")
            mime_type = f"image/{'jpeg' if ext in ['jpg', 'jpeg'] else ext}"

            # --- Send to model ---
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Vision-capable model
                messages=[
                    {
                        "role": "system",
                        "content": SUMMARY_PROMPT.strip(),
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": (
                                    "Analyze this image extracted from a student's handwritten or typed exam script. "
                                    "Follow all steps in the system prompt to provide a structured description."
                                ),
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{mime_type};base64,{base64_image}"
                                },
                            },
                        ],
                    },
                ],
                max_tokens=600,
            )

            summary = response.choices[0].message.content.strip()
            logging.info(f"[LLM] ✅ Successfully summarized: {os.path.basename(image_path)}")
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
    args = parser.parse_args()

    summarizer = ImageSummarizerLLM()
    summary = summarizer.summarize_image(args.image_path)

    print("\n🧠 IMAGE SUMMARY RESULT\n" + "-" * 60)
    print(summary or "❌ No summary generated.")
