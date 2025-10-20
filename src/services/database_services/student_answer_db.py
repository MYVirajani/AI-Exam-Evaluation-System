from .base_relational_db import BaseRelationalDB
from ...models.student_answer import StudentAnswer
from typing import Dict, Tuple, List
import json
import logging


class StudentAnswerService(BaseRelationalDB):
    def __init__(self, provider_suffix: str = ""):
        super().__init__()

        provider_table_map = {
            "openai": "student_answers_openai",
            "google_gemini": "student_answers_gemini",
            "googlegemini": "student_answers_gemini",
            "gemini": "student_answers_gemini",
            "deepseek": "student_answers_deepseek"
        }

        normalized = provider_suffix.strip().lower()
        self.table_name = provider_table_map.get(normalized)

        if not self.table_name:
            raise ValueError(f"Invalid provider_suffix: {provider_suffix}")

        logging.info(f"[DB] Using table: {self.table_name}")
        print(f"⚙️ Using table: {self.table_name}")

    # --------------------------------------------------------------------------
    # CREATE TABLE IF NOT EXISTS
    # --------------------------------------------------------------------------
    def initialize_table(self):
        """Initialize table with enhanced schema including submission and assessment tracking."""
        
        # First, check if table exists and get its current structure
        self.cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS {self.table_name} (
            student_index VARCHAR,
            module_code VARCHAR,
            exam_year INT,
            exam_month VARCHAR,
            answers JSONB,
            PRIMARY KEY (student_index, module_code, exam_year, exam_month)
        );

        """)
        self.commit()

    # --------------------------------------------------------------------------
    # SAVE ANSWERS (supports text + media_urls)
    # --------------------------------------------------------------------------
    def save_answers(self, student_index: str, module_code: str, year: int, month: int, answers: List[StudentAnswer]):
        # Convert all StudentAnswer objects into structured JSON
        answer_dict = {
            ans.full_question_id: {
                "answer_text": ans.answer_text,
                "media_urls": ans.media_urls or []
            }
            for ans in answers
        }

        self.cursor.execute(f"""
        INSERT INTO {self.table_name} (student_index, module_code, exam_year, exam_month, answers)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (student_index, module_code, exam_year, exam_month)
        DO UPDATE SET answers = EXCLUDED.answers;
        """, (student_index, module_code, year, month, json.dumps(answer_dict)))
        self.commit()

    # --------------------------------------------------------------------------
    # GET A SINGLE STUDENT'S ANSWERS
    # --------------------------------------------------------------------------
    def get_answers(self, student_index: str, module_code: str, year: int, month: int) -> dict:
        self.cursor.execute(f"""
        SELECT answers FROM {self.table_name}
        WHERE student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s
        """, (student_index, module_code, year, month))
        result = self.cursor.fetchone()
        return result[0] if result else {}

    # --------------------------------------------------------------------------
    # GET ALL ANSWERS FOR EMBEDDING (flattened)
    # --------------------------------------------------------------------------
    def get_all_answers_for_embedding(self, student_index: str, module_code: str, year: int, month: str) -> List[StudentAnswer]:
        self.cursor.execute(f"""
        SELECT student_index, module_code, exam_year, exam_month, answers, submission_id
        FROM {self.table_name}
        WHERE assessment_id = %s
        """, (assessment_id,))
        
        results = []
        for row in self.cursor.fetchall():
            results.append({
                'student_index': row[0],
                'module_code': row[1],
                'exam_year': row[2],
                'exam_month': row[3],
                'answers': row[4],
                'submission_id': row[5]
            })
        
        return results

    def get_answers_by_submission(self, submission_id: str) -> dict:
        """Get answers for a specific submission."""
        self.cursor.execute(f"""
        SELECT student_index, module_code, exam_year, exam_month, answers, assessment_id
        FROM {self.table_name}
        WHERE submission_id = %s
        """, (submission_id,))
        
        result = self.cursor.fetchone()
        if result:
            return {
                'student_index': result[0],
                'module_code': result[1],
                'exam_year': result[2],
                'exam_month': result[3],
                'answers': result[4],
                'assessment_id': result[5]
            }
        return {}

    def get_all_answers_for_embedding(self, student_index: str, module_code: str, year: int, month: str, 
                                    assessment_id: str = None, submission_id: str = None) -> List[StudentAnswer]:
        """Get all answers structured for embedding purposes with optional assessment context."""
        if assessment_id:
            self.cursor.execute(f"""
                SELECT answers, assessment_id, submission_id FROM {self.table_name}
                WHERE assessment_id = %s AND student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s
            """, (assessment_id, student_index, module_code, year, month))
        else:
            self.cursor.execute(f"""
                SELECT answers, assessment_id, submission_id FROM {self.table_name}
                WHERE student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s
                ORDER BY created_at DESC LIMIT 1
            """, (student_index, module_code, year, month))

        result = self.cursor.fetchone()
        if not result:
            return []

        raw_answers = result[0]
        db_assessment_id = result[1] if len(result) > 1 else assessment_id
        db_submission_id = result[2] if len(result) > 2 else submission_id
        
        structured_answers = []

        for full_qid, content in raw_answers.items():
            parts = full_qid.split("_")

            # New structure includes both text and media
            if isinstance(content, dict):
                answer_text = content.get("answer_text", "")
                media_urls = content.get("media_urls", [])
            else:
                # Backward compatibility: old schema only had plain string
                answer_text = str(content)
                media_urls = []

            structured_answers.append(
                StudentAnswer(
                    question_id=parts[0],
                    sub_question_id=parts[1] if len(parts) > 1 else None,
                    sub_sub_question_id=parts[2] if len(parts) > 2 else None,
                    answer_text=answer_text,
                    media_urls=media_urls,
                    student_index=student_index,
                    module_code=module_code,
                    exam_year=year,
                    exam_month=month,
                    assessment_id=db_assessment_id,
                    submission_id=db_submission_id
                )
            )
        return structured_answers

    # --------------------------------------------------------------------------
    # GROUPED FETCH (by student)
    # --------------------------------------------------------------------------
    def get_all_answers_grouped(self, module_code: str, year: int, month: str) -> Dict[Tuple[str, str, int, str], List[StudentAnswer]]:
        self.cursor.execute(f"""
            SELECT student_index, module_code, exam_year, exam_month, answers
            FROM {self.table_name}
            WHERE LOWER(module_code) = LOWER(%s) AND exam_year = %s AND LOWER(exam_month) = LOWER(%s)
        """, (module_code, year, month))

        rows = self.cursor.fetchall()
        grouped = {}

        for student_index, module_code, year, month, answers_json in rows:
            structured_answers = []
            for full_qid, content in answers_json.items():
                parts = full_qid.split("_")

                if isinstance(content, dict):
                    answer_text = content.get("answer_text", "")
                    media_urls = content.get("media_urls", [])
                else:
                    answer_text = str(content)
                    media_urls = []

                structured_answers.append(StudentAnswer(
                    question_id=parts[0],
                    sub_question_id=parts[1] if len(parts) > 1 else None,
                    sub_sub_question_id=parts[2] if len(parts) > 2 else None,
                    answer_text=answer_text,
                    media_urls=media_urls,
                    student_index=student_index,
                    module_code=module_code,
                    exam_year=year,
                    exam_month=month
                ))

            grouped[(student_index, module_code, year, month)] = structured_answers

        return grouped
