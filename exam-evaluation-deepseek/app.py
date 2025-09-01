import os
import json
import traceback
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

# Load environment variables
load_dotenv()

# Initialize Hugging Face client
client = InferenceClient(
    provider="auto",
    api_key=os.getenv("HF_TOKEN"),
)

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
        
        # Extract the response content
        response_text = completion.choices[0].message.content
        
        # Try to find JSON in the response (handles cases where model adds extra text)
        try:
            # Look for JSON start/end markers
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            json_str = response_text[json_start:json_end]
            
            result = json.loads(json_str)
            
            # Validate required fields
            required_fields = ["awarded_marks", "feedback", "key_points_missed"]
            if not all(field in result for field in required_fields):
                print(f"Warning: Incomplete evaluation result for answer.")
                print(f"Raw response: {response_text}")
                return {
                    "awarded_marks": 0,
                    "feedback": "Evaluation failed - incomplete response",
                    "key_points_missed": []
                }
                
            return result
            
        except json.JSONDecodeError as e:
            print(f"JSON decode error for answer evaluation:")
            print(f"Error: {str(e)}")
            print(f"Raw response: {response_text}")
            return {
                "awarded_marks": 0,
                "feedback": "Evaluation failed - invalid response format",
                "key_points_missed": []
            }
            
    except Exception as e:
        print(f"Error evaluating answer:")
        print(f"Question: {question}")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        return {
            "awarded_marks": 0,
            "feedback": "Evaluation failed - API error occurred",
            "key_points_missed": []
        }
        
def process_answers(json_file):
    """Process all answers in the JSON file"""
    try:
        with open(json_file) as f:
            answers = json.load(f)
    except Exception as e:
        print(f"Error loading JSON file {json_file}:")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        return []
    
    results = []
    for index, item in enumerate(answers, 1):
        print(f"\nProcessing answer {index}/{len(answers)} (ID: {item['answer_id']})...")
        try:
            evaluation = evaluate_answer(
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
            
            print(f"Evaluation completed. Awarded marks: {evaluation['awarded_marks']}/{item['total_marks']}")
            
        except Exception as e:
            print(f"Fatal error processing answer {item['answer_id']}:")
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {str(e)}")
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

# Main execution

if __name__ == "__main__":
    # Request input file path
    input_file = input("Enter path to answers JSON file (e.g., answer_db.json): ").strip()
    
    # Validate file exists
    while not os.path.exists(input_file):
        print(f"Error: File '{input_file}' not found.")
        input_file = input("Please enter a valid file path: ").strip()
    
    # Generate output filename
    base_name = os.path.splitext(os.path.basename(input_file))[0]
    output_file = f"evaluated_{base_name}.json"
    
    print(f"\nStarting answer evaluation process for {input_file}...")
    evaluated_answers = process_answers(input_file)
    
    try:
        with open(output_file, "w") as f:
            json.dump(evaluated_answers, f, indent=2)
        print(f"\nEvaluation complete. Results saved to {output_file}")
    except Exception as e:
        print(f"\nError saving results to {output_file}:")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print("Partial results:")
        print(json.dumps(evaluated_answers, indent=2)[:1000] + "...")