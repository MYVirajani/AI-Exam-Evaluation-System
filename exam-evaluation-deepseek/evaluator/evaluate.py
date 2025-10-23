import json
from evaluator.client import client

def evaluate_answer(question, student_answer, total_marks):
    """Evaluate a student answer using LLM and return marks and feedback"""
    prompt = f"""
    You are a teacher evaluating student answers. For this question worth {total_marks} marks:
    Question: {question}
    
    Evaluate this answer:
    {student_answer}
    
    Return ONLY JSON with:
    - "awarded_marks" (number between 0-{total_marks})
    - "feedback" (specific improvement suggestions)
    - "key_points_missed" (list of important concepts not mentioned)
    
    Do not include any additional text or explanation outside the JSON structure.
    """
    try:
        completion = client.chat.completions.create(
            model="deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
            messages=[{"role": "user", "content": prompt}],
        )
        
        response_text = completion.choices[0].message.content
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        json_str = response_text[json_start:json_end]
        result = json.loads(json_str)

        required_fields = ["awarded_marks", "feedback", "key_points_missed"]
        if not all(field in result for field in required_fields):
            return {
                "awarded_marks": 0,
                "feedback": "Evaluation failed - incomplete response",
                "key_points_missed": []
            }

        return result

    except (json.JSONDecodeError, Exception):
        return {
            "awarded_marks": 0,
            "feedback": "Evaluation failed - API or parsing error",
            "key_points_missed": []
        }
