# ===============================================
# File: src/scripts/ImageSummarizerLLM.py
# Description: Multi-provider image summarizer using selected LLM model
# ===============================================

import os
import base64
import logging
from openai import OpenAI
from src.prompts.media_summarizer_prompt import SUMMARY_PROMPT, MODEL_SUMMARY_PROMPT

# Optional: import Gemini or DeepSeek SDKs if used in your setup
try:
    import google.generativeai as genai
except ImportError:
    genai = None

logging.basicConfig(level=logging.INFO)


class ImageSummarizer:
    """
    Summarizes images (charts, diagrams, tables, etc.) using the selected LLM provider and model.
    Supports OpenAI GPT-4-Vision, Google Gemini, and DeepSeek.
    """

    def __init__(self, provider: str = "OpenAI", model: str | None = None):
        self.provider = provider
        self.model = model or self._get_default_model(provider)
        self.client = None

        logging.info(f"[LLM] Initializing ImageSummarizer with provider={provider}, model={self.model}")

        if provider.lower() == "openai":
            self.api_key = os.getenv("OPENAI_API_KEY")
            if not self.api_key:
                raise ValueError("❌ OPENAI_API_KEY not found in environment variables.")
            self.client = OpenAI(api_key=self.api_key)

        elif provider.lower() == "googlegemini":
            self.api_key = os.getenv("GOOGLE_API_KEY")
            if not self.api_key:
                raise ValueError("❌ GOOGLE_API_KEY not found in environment variables.")
            if not genai:
                raise ImportError("⚠️ google-generativeai package is not installed.")
            genai.configure(api_key=self.api_key)
            self.client = genai

        elif provider.lower() == "deepseek":
            self.api_key = os.getenv("DEEPSEEK_API_KEY")
            if not self.api_key:
                raise ValueError("❌ DEEPSEEK_API_KEY not found in environment variables.")
            self.client = OpenAI(api_key=self.api_key, base_url="https://api.deepseek.com/v1")

        else:
            raise ValueError(f"❌ Unsupported provider: {provider}")

    def _get_default_model(self, provider: str) -> str:
        """Return the default summarization model for each provider."""
        defaults = {
            "openai": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            "googlegemini": "gemini-1.5-flash",
            "deepseek": "deepseek-r1:7b",
        }
        return defaults.get(provider.lower(), "gpt-4o-mini")

    def summarize_image(
        self,
        image_path: str,
        mode: str = "student",
        domain: str = "General",
        guideline_text: str | None = None,
    ) -> str | None:
        """
        Summarize an image (student or model) using the selected LLM model.
        mode: "student" | "model"
        domain: subject area (e.g., Physics, Civil Engineering)
        guideline_text: optional marking scheme for model answers
        Returns a textual summary or None.
        """
        if not os.path.exists(image_path):
            logging.error(f"[LLM] ❌ File not found: {image_path}")
            return None

        # Construct prompts
        if mode == "model":
            system_prompt = MODEL_SUMMARY_PROMPT.format(domain=domain).strip()
            user_context = (
                f"Analyze this model answer image in the domain of {domain}. "
                "Summarize its content and alignment with guidelines, focusing on clarity, correctness, and notation."
            )
            if guideline_text:
                user_context += f"\n\n📘 GUIDELINES:\n{guideline_text.strip()}\n"
        else:
            system_prompt = SUMMARY_PROMPT.format(domain=domain).strip()
            user_context = (
                f"Summarize this student's answer image in the domain of {domain}. "
                "Focus on the main idea, structure, and correctness."
            )

        # Encode image
        with open(image_path, "rb") as img_file:
            image_bytes = img_file.read()
        base64_image = base64.b64encode(image_bytes).decode("utf-8")
        ext = os.path.splitext(image_path)[-1].lower().replace(".", "")
        mime_type = f"image/{'jpeg' if ext in ['jpg', 'jpeg'] else ext}"

        try:
            # ----------------------------------------------------------
            # OpenAI / DeepSeek
            # ----------------------------------------------------------
            if self.provider.lower() in ["openai", "deepseek"]:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": user_context},
                                {"type": "image_url",
                                 "image_url": {"url": f"data:{mime_type};base64,{base64_image}"}},
                            ],
                        },
                    ],
                    max_tokens=700,
                )
                summary = response.choices[0].message.content.strip()

            # ----------------------------------------------------------
            # Google Gemini
            # ----------------------------------------------------------
            elif self.provider.lower() == "googlegemini":
                model = self.client.GenerativeModel(self.model)
                with open(image_path, "rb") as img_file:
                    image_data = img_file.read()
                response = model.generate_content(
                    [system_prompt + "\n\n" + user_context,
                     {"mime_type": mime_type, "data": image_data}],
                    generation_config={"max_output_tokens": 700},
                )
                summary = response.text.strip()

            else:
                raise ValueError(f"❌ Unsupported provider: {self.provider}")

            logging.info(f"[LLM] ✅ Summarized ({mode}, domain={domain}) using {self.provider}: {os.path.basename(image_path)}")
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

    summarizer = ImageSummarizer()
    summary = summarizer.summarize_image(
        args.image_path,
        mode=args.mode,
        domain=args.domain,
        guideline_text=guideline_text
    )

    print("\n🧠 IMAGE SUMMARY RESULT\n" + "-" * 60)
    print(summary or "❌ No summary generated.")
