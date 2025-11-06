# ===============================================
# File: src/scripts/ImageSummarizerLLM.py
# Description: Multi-provider image summarizer using environment-based config
# ===============================================

import os
import base64
import logging
from openai import OpenAI
from src.prompts.media_summarizer_prompt import SUMMARY_PROMPT, MODEL_SUMMARY_PROMPT

try:
    import google.generativeai as genai
except ImportError:
    genai = None

logging.basicConfig(level=logging.INFO)


class ImageSummarizer:
    """
    Extracts visible textual and diagrammatic content from answer script images
    using the selected LLM provider (OpenAI, Gemini, or DeepSeek).
    Ensures faithful, unmodified transcription — no summarization or interpretation.
    """

    def __init__(self, provider_key: str):
        self.provider_key = provider_key.lower()
        self.config = self._load_provider_config(self.provider_key)

        self.model = self.config["model"]
        self.api_key = self.config["api_key"]
        self.temperature = self.config["temperature"]
        self.client = None

        logging.info(f"[LLM] Initializing ImageSummarizer with provider={self.provider_key}, model={self.model}")

        # Initialize client based on provider
        if self.provider_key == "openai":
            self.client = OpenAI(api_key=self.api_key)

        elif self.provider_key == "gemini":
            if not genai:
                raise ImportError("⚠️ google-generativeai package not installed.")
            genai.configure(api_key=self.api_key)
            self.client = genai

        elif self.provider_key == "deepseek":
            self.client = OpenAI(api_key=self.api_key, base_url="https://api.deepseek.com/v1")

        else:
            raise ValueError(f"❌ Unsupported provider: {self.provider_key}")

    def _load_provider_config(self, provider: str) -> dict:
        """Load API key, model, and temperature from environment variables."""
        env_map = {
            "openai": {
                "api_key": os.getenv("OPENAI_API_KEY"),
                "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                "temperature": float(os.getenv("OPENAI_TEMPERATURE", 0.2)),
            },
            "gemini": {
                "api_key": os.getenv("GOOGLE_API_KEY"),
                "model": os.getenv("GEMINI_MODEL", "gemini-2.0-flash"),
                "temperature": float(os.getenv("GEMINI_TEMPERATURE", 0.2)),
            },
            "deepseek": {
                "api_key": os.getenv("DEEPSEEK_API_KEY"),
                "model": os.getenv("DEEPSEEK_MODEL", "deepseek-r1:7b"),
                "temperature": float(os.getenv("DEEPSEEK_TEMPERATURE", 0.2)),
            },
        }

        if provider not in env_map:
            raise ValueError(f"❌ Unsupported provider key: {provider}")

        config = env_map[provider]
        if not config["api_key"]:
            raise ValueError(f"❌ Missing API key for provider: {provider.upper()}")

        return config

    def summarize_image(
        self,
        image_path: str,
        mode: str = "student",
        domain: str = "Engineering",
        guideline_text: str | None = None,
    ) -> str | None:
        """Convert image to faithful text description (no manipulation)."""
        if not os.path.exists(image_path):
            logging.error(f"[LLM] ❌ File not found: {image_path}")
            return None

        # ------------------------------------------------------------------
        # Updated Prompts — Strict factual extraction (no summarization)
        # ------------------------------------------------------------------
        if mode == "model":
            system_prompt = MODEL_SUMMARY_PROMPT.strip()
            user_context = (
                f"Extract and describe the visible content of this model answer image in the domain of {domain}. "
                "Provide a clear, structured text representation of everything present — including written text, symbols, "
                "labels, diagrams, and shapes — exactly as shown in the image, without adding, omitting, or interpreting any information. "
                "Preserve terminology, equations, and diagram notations exactly as they appear. "
                "Do not summarize or rewrite content in your own words; simply transcribe and structurally describe what is visible."
            )
            if guideline_text:
                user_context += f"\n\n📘 GUIDELINES:\n{guideline_text.strip()}\n"
        else:
            system_prompt = SUMMARY_PROMPT.strip()
            user_context = (
                f"Extract and describe the visible content of this student's answer image in the domain of {domain}. "
                "Convert the image into clear, readable text — capturing all written content, formulas, symbols, diagrams, and notations exactly as shown. "
                "Do not interpret, evaluate, or modify the answer in any way. "
                "Focus only on accurately representing the visible elements and their structure."
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
            if self.provider_key in ["openai", "deepseek"]:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": user_context},
                                {
                                    "type": "image_url",
                                    "image_url": {"url": f"data:{mime_type};base64,{base64_image}"}
                                },
                            ],
                        },
                    ],
                    temperature=self.temperature,
                    max_tokens=700,
                )
                summary = response.choices[0].message.content.strip()

            # ----------------------------------------------------------
            # Google Gemini
            # ----------------------------------------------------------
            elif self.provider_key == "gemini":
                model = self.client.GenerativeModel(self.model)
                with open(image_path, "rb") as img_file:
                    image_data = img_file.read()
                response = model.generate_content(
                    [system_prompt + "\n\n" + user_context,
                     {"mime_type": mime_type, "data": image_data}],
                    generation_config={
                        "temperature": self.temperature,
                        "max_output_tokens": 700,
                    },
                )
                summary = response.text.strip()

            else:
                raise ValueError(f"❌ Unsupported provider: {self.provider_key}")

            logging.info(
                f"[LLM] ✅ Extracted ({mode}, domain={domain}) using {self.provider_key}: {os.path.basename(image_path)}"
            )
            return summary

        except Exception as e:
            logging.exception(f"[LLM] ❌ Failed to process image {image_path}: {e}")
            return None


# ----------------------------------------------------------------------
# Manual Testing (Run directly)
# ----------------------------------------------------------------------
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Test image-to-text extraction using environment-based LLM config.")
    parser.add_argument("--provider", required=True, choices=["openai", "gemini", "deepseek"], help="LLM provider key")
    parser.add_argument("--image_path", required=True, help="Path to a local image file (e.g., ./sample.png)")
    parser.add_argument("--mode", default="student", choices=["student", "model"], help="Type of image to process")
    parser.add_argument("--domain", default="General", help="Academic domain (e.g., Physics, Civil Engineering)")
    parser.add_argument("--guideline", default=None, help="Path to a text file with model guidelines")

    args = parser.parse_args()

    guideline_text = None
    if args.guideline and os.path.exists(args.guideline):
        with open(args.guideline, "r", encoding="utf-8") as f:
            guideline_text = f.read()

    summarizer = ImageSummarizer(args.provider)
    summary = summarizer.summarize_image(
        args.image_path,
        mode=args.mode,
        domain=args.domain,
        guideline_text=guideline_text
    )

    print("\n🧠 IMAGE TEXT EXTRACTION RESULT\n" + "-" * 60)
    print(summary or "❌ No result generated.")
