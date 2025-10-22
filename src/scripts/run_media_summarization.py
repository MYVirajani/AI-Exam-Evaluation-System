# src/scripts/run_media_summarization.py
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from src.services.database_services.student_answer_service_with_media import StudentAnswerServiceWithMedia
from src.services.summary.image_summarizer import ImageSummarizerLLM

def summarize_submission(submission_id: str):
    db_service = StudentAnswerServiceWithMedia()
    llm = ImageSummarizerLLM()

    media_records = db_service.get_media_by_submission(submission_id)
    print(f"📸 Found {len(media_records)} media records for submission {submission_id}")

    for media in media_records:
        image_url = media["media_url"]
        media_id = media["id"]

        print(f"🖼️ Processing {image_url}")
        summary = llm.summarize_image(image_url)

        if summary:
            db_service.update_media_summary(media_id, summary)
        else:
            print(f"⚠️ Skipped {media_id} due to summarization error.")

    db_service.close()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Run LLM image summarization for student answers.")
    parser.add_argument("--submission_id", required=True, help="Submission ID to process.")
    args = parser.parse_args()

    summarize_submission(args.submission_id)
