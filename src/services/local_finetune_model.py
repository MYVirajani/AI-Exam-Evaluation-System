# import torch
# from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
# import logging, os

# logger = logging.getLogger(__name__)

# class LocalFinetuneDeepseek:
#     def __init__(self, model_path: str, device: str = None):
#         self.model_path = model_path
#         self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")

#         logger.info(f"🔧 Loading local fine-tuned model from {self.model_path} on {self.device}")
#         self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
#         self.model = AutoModelForCausalLM.from_pretrained(
#             self.model_path,
#             torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
#             device_map="auto"
#         )
#         self.pipe = pipeline(
#             "text-generation",
#             model=self.model,
#             tokenizer=self.tokenizer,
#             device=0 if torch.cuda.is_available() else -1
#         )

#     def generate(self, prompt: str, temperature: float = 0.3, max_tokens: int = 1024):
#         outputs = self.pipe(
#             prompt,
#             max_new_tokens=max_tokens,
#             temperature=temperature,
#             do_sample=True,
#             top_p=0.9
#         )
#         return outputs[0]["generated_text"]

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import logging
import os

logger = logging.getLogger(__name__)

class LocalFinetuneDeepseek:
    def __init__(self, model_path: str = None):
        self.model_path = model_path or os.getenv("LOCAL_FINETUNE_MODEL_PATH", "E:\\finetune_voice\\DeepSeek-R1-DomainData-Merged")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        logger.info(f"🔧 Loading local fine-tuned DeepSeek model from {self.model_path} on {self.device}")

        # Load tokenizer and model
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
        self.model = AutoModelForCausalLM.from_pretrained(
            self.model_path,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto"
        )

        # Create text generation pipeline
        self.pipe = pipeline(
            "text-generation",
            model=self.model,
            tokenizer=self.tokenizer,
            device=0 if torch.cuda.is_available() else -1
        )

    def generate(self, prompt: str, temperature: float = 0.3, max_tokens: int = 1024):
        outputs = self.pipe(
            prompt,
            max_new_tokens=max_tokens,
            temperature=temperature,
            do_sample=True,
            top_p=0.9
        )
        return outputs[0]["generated_text"]
