import json
from evaluator.client import client
from json_creator.prompt_builder import build_metadata_extraction_prompt

def extract_metadata(qp_text, model_text, rubric_text, answer_text, file_id, question_no):
    prompt = build_metadata_extraction_prompt(qp_text, model_text, rubric_text, answer_text, file_id, question_no)

    try:
        completion = client.chat.completions.create(
            model="deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
            messages=[{"role": "user", "content": prompt}],
        )
        response_text = completion.choices[0].message.content
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        return json.loads(response_text[json_start:json_end])
    except Exception as e:
        print(f"Extraction failed: {e}")
        return {
            "answer_id": f"{file_id}-{question_no}",
            "question": "",
            "answer": answer_text.strip(),
            "total_marks": None,
            "model_answers": None,
            "rubrics": None
        }