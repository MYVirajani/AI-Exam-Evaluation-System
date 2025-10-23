import os
import json
from evaluator.utils import process_answers

def main():
    input_file = input("Enter path to answers JSON file (e.g., answer_db.json): ").strip()
    
    while not os.path.exists(input_file):
        print(f"Error: File '{input_file}' not found.")
        input_file = input("Please enter a valid file path: ").strip()
    
    base_name = os.path.splitext(os.path.basename(input_file))[0]
    output_file = f"evaluated_{base_name}.json"

    print(f"\nStarting evaluation for {input_file}...")
    evaluated_answers = process_answers(input_file)

    try:
        with open(output_file, "w") as f:
            json.dump(evaluated_answers, f, indent=2)
        print(f"\nEvaluation complete. Results saved to {output_file}")
    except Exception as e:
        print(f"\nError saving results to {output_file}: {e}")
        print("Partial results:\n", json.dumps(evaluated_answers, indent=2)[:1000], "...")

if __name__ == "__main__":
    main()
