import re

class PromptTemplates:
    """Template utilities for consistent prompt formatting."""

    @staticmethod
    def format_grading_prompt(template: str, **kwargs) -> str:
        return template.format(**kwargs)

    @staticmethod
    def extract_score_from_response(response: str) -> tuple[float, str]:
        score_match = re.search(r'SCORE:\s*(\d+\.?\d*)', response, re.IGNORECASE)
        score = float(score_match.group(1)) if score_match else 0.0

        feedback_match = re.search(r'FEEDBACK:\s*(.*?)(?=\n[A-Z_]+:|$)', response, re.IGNORECASE | re.DOTALL)
        feedback = feedback_match.group(1).strip() if feedback_match else "No feedback provided."

        return score, feedback

    @staticmethod
    def extract_confidence_from_response(response: str) -> float:
        confidence_match = re.search(r'CONFIDENCE:\s*(\d+\.?\d*)', response, re.IGNORECASE)
        return float(confidence_match.group(1)) if confidence_match else 5.0
