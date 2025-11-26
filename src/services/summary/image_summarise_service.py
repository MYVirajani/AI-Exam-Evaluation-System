import os
import base64
import logging
from openai import OpenAI
from src.prompts.media_summarizer_prompt import SUMMARY_PROMPT, MODEL_SUMMARY_PROMPT
from src.services.database_services.evaluation_model_db import EvaluationModelService

try:
    import google.generativeai as genai
except ImportError:
    genai = None


logging.basicConfig(level=logging.INFO)


class ImageSummarizer:
    """
    Extracts visible textual and diagrammatic content from answer script images
    using provider configuration stored in evaluation_model table.
    """

    def __init__(self, model_id: str):
        self.model_id = model_id

        # -----------------------------------------------------------
        # Load model config from database
        # -----------------------------------------------------------
        self.db = EvaluationModelService()
        model_config = self.db.get_model_config(model_id=model_id)

        if not model_config:
            raise ValueError(f"❌ No model found for model_id={model_id}")

        self.provider_key = model_config["provider"].lower()
        self.model = model_config["chat_model"]
        self.embedding_model = model_config["embedding_model"]
        self.temperature = model_config["temperature"]

        # -----------------------------------------------------------
        # API keys from environment
        # -----------------------------------------------------------
        self.api_key = self._resolve_api_key(self.provider_key)

        logging.info(
            f"[LLM] Loaded provider={self.provider_key}, model={self.model}, "
            f"embedding={self.embedding_model}, temp={self.temperature}"
        )

        # -----------------------------------------------------------
        # Initialize the appropriate client
        # -----------------------------------------------------------
        if self.provider_key == "openai":
            self.client = OpenAI(api_key=self.api_key)

        elif self.provider_key == "gemini":
            if not genai:
                raise ImportError("⚠️ google-generativeai package not installed.")
            genai.configure(api_key=self.api_key)
            self.client = genai

        elif self.provider_key == "deepseek":
            # NOTE: DeepSeek uses OpenAI-compatible API with custom base URL
            self.client = OpenAI(api_key=self.api_key, base_url="https://api.deepseek.com/v1")

        else:
            raise ValueError(f"❌ Unsupported provider: {self.provider_key}")

        logging.info(f"[LLM] Initialized summarizer using provider={self.provider_key}")

    # -----------------------------------------------------------
    # Map provider → correct environment key
    # -----------------------------------------------------------
    def _resolve_api_key(self, provider: str) -> str:
        provider_map = {
            "openai": os.getenv("OPENAI_API_KEY"),
            "gemini": os.getenv("GOOGLE_API_KEY"),
            "deepseek": os.getenv("DEEPSEEK_API_KEY"),
        }

        key = provider_map.get(provider)
        if not key:
            raise ValueError(f"❌ Missing API key for provider={provider.upper()}")
        return key

    # -----------------------------------------------------------
    # Summarize image
    # -----------------------------------------------------------
    def summarize_image(
        self,
        image_path: str,
        mode: str = "student",
        domain: str = "Engineering",
        guideline_text: str | None = None,
    ) -> str | None:

        if not os.path.exists(image_path):
            logging.error(f"[LLM] ❌ File not found: {image_path}")
            return None

        # Select prompt based on mode
        if mode == "model":
            system_prompt = MODEL_SUMMARY_PROMPT.strip()
            user_context = (
                f"Extract and describe visible image content in the domain of {domain}. "
                "Include all text, diagrams, shapes, labels, equations exactly as shown without summarizing."
            )
            if guideline_text:
                user_context += f"\n\n📘 GUIDELINES:\n{guideline_text.strip()}\n"

        else:
            system_prompt = SUMMARY_PROMPT.strip()
            user_context = (
                f"Extract and describe everything visible in this student's answer image for {domain}. "
                "Do not interpret, judge, or modify content—only transcribe exactly what appears."
            )

        # Encode image
        with open(image_path, "rb") as img_file:
            image_bytes = img_file.read()

        base64_image = base64.b64encode(image_bytes).decode("utf-8")
        ext = os.path.splitext(image_path)[-1].lower().replace(".", "")
        mime_type = f"image/{'jpeg' if ext in ['jpg', 'jpeg'] else ext}"

        try:
            # -------------------------------------------------------
            # OpenAI / DeepSeek (compatible)
            # -------------------------------------------------------
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
                                    "image_url": {
                                        "url": f"data:{mime_type};base64,{base64_image}"
                                    },
                                },
                            ],
                        },
                    ],
                    temperature=self.temperature,
                    max_tokens=700,
                )
                summary = response.choices[0].message.content.strip()

            # -------------------------------------------------------
            # GEMINI
            # -------------------------------------------------------
            elif self.provider_key == "gemini":
                model = self.client.GenerativeModel(self.model)
                response = model.generate_content(
                    [
                        system_prompt + "\n\n" + user_context,
                        {"mime_type": mime_type, "data": image_bytes},
                    ],
                    generation_config={
                        "temperature": self.temperature,
                        "max_output_tokens": 700,
                    },
                )
                summary = response.text.strip()

            else:
                raise ValueError(f"❌ Unsupported provider: {self.provider_key}")

            logging.info(
                f"[LLM] ✅ Completed extraction ({mode}, domain={domain}) using {self.provider_key}"
            )
            return summary

        except Exception as e:
            logging.exception(f"[LLM] ❌ Image processing failed: {e}")
            return None
