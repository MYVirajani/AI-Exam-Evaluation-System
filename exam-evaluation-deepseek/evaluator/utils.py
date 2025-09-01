import json
# from evaluator.evaluate import evaluate_answer
from evaluator.evaluate_by_rag import evaluate_answer_with_rag

def process_answers(json_file):
    """Process all answers in the JSON file"""
    try:
        with open(json_file) as f:
            answers = json.load(f)
    except Exception as e:
        print(f"Error loading JSON file {json_file}: {e}")
        return []

    results = []
    for index, item in enumerate(answers, 1):
        print(f"\nProcessing answer {index}/{len(answers)} (ID: {item['answer_id']})...")
        try:
            evaluation = evaluate_answer_with_rag(
                item["question"],
                item["answer"],
                item["total_marks"]
            )

            results.append({
                "answer_id": item["answer_id"],
                "question": item["question"],
                "answer": item["answer"],
                "total_marks": item["total_marks"],
                "awarded_marks": evaluation["awarded_marks"],
                "feedback": evaluation["feedback"],
                "key_points_missed": evaluation.get("key_points_missed", [])
            })

            print(f"Awarded marks: {evaluation['awarded_marks']}/{item['total_marks']}")

        except Exception as e:
            print(f"Fatal error for answer ID {item['answer_id']}: {e}")
            results.append({
                "answer_id": item["answer_id"],
                "question": item["question"],
                "answer": item["answer"],
                "total_marks": item["total_marks"],
                "awarded_marks": 0,
                "feedback": "Fatal error during evaluation",
                "key_points_missed": []
            })

    return results
