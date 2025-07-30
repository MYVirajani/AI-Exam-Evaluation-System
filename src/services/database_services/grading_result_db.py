
# import logging
# from .base_relational_db import BaseRelationalDB
# from ...models.grading_result import GradingResult

# log = logging.getLogger(__name__)

# class GradingResultDB(BaseRelationalDB):
#     """
#     Inserts / queries per-question marks and paper-level totals.
#     """

#     def __init__(self, provider_suffix: str = ""):
#         super().__init__()

#         suffix_map = {
#             "openai": "_openai",
#             "googlegemini": "_gemini"
#         }

#         normalized = provider_suffix.strip().lower()
#         suffix = suffix_map.get(normalized, "")

#         self.answers_table = f"graded_student_answers_openai{suffix}"
#         self.paper_table = f"student_paper_results{suffix}"

#         log.info(f"[DB] Using grading tables: {self.answers_table}, {self.paper_table}")
#         print(f"⚙️ Grading Tables: {self.answers_table}, {self.paper_table}")  # Optional DEBUG

#         self._create_tables()

#     # ───────────────────────────────────────────────────────────
#     def _create_tables(self):
#         self.cursor.execute(f"""
#         CREATE TABLE IF NOT EXISTS {self.answers_table} (
#             id                 SERIAL PRIMARY KEY,
#             student_index      TEXT,
#             module_code        TEXT,
#             exam_year          INT,
#             exam_month         TEXT,
#             full_question_id   TEXT,
#             mark               FLOAT,
#             max_marks          FLOAT,
#             reason             TEXT,
#             graded_at          TIMESTAMP DEFAULT NOW(),
#             is_null_answer     BOOLEAN DEFAULT FALSE,  -- Added for null answers
#             UNIQUE (student_index,module_code,exam_year,exam_month,full_question_id)
#         );

#         CREATE TABLE IF NOT EXISTS {self.paper_table} (
#             id             SERIAL PRIMARY KEY,
#             student_index  TEXT,
#             module_code    TEXT,
#             exam_year      INT,
#             exam_month     TEXT,
#             total_marks    FLOAT,
#             total_possible FLOAT,
#             graded_at      TIMESTAMP DEFAULT NOW(),
#             UNIQUE (student_index,module_code,exam_year,exam_month)
#         );
#         """)
#         self.commit()

#     # ───────────────────────────────────────────────────────────
#     def save_question_mark(self, row: GradingResult):
#         self.cursor.execute(f"""
#         INSERT INTO {self.answers_table}
#           (student_index,module_code,exam_year,exam_month,
#            full_question_id,mark,max_marks,reason,graded_at,is_null_answer)
#         VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW(),%s)
#         ON CONFLICT
#           (student_index,module_code,exam_year,exam_month,full_question_id)
#         DO UPDATE SET mark=EXCLUDED.mark, reason=EXCLUDED.reason,
#                       graded_at=NOW(), is_null_answer=EXCLUDED.is_null_answer;
#         """, (
#             row.student_index, row.module_code, row.exam_year, row.exam_month,
#             row.full_question_id, row.score, row.max_marks, row.feedback,
#             getattr(row, 'is_null_answer', False)
#         ))

#     # ───────────────────────────────────────────────────────────
#     def save_paper_total(self,
#                          student_index: str, module: str,
#                          year: int, month: str,
#                          total: float, possible: float):
#         self.cursor.execute(f"""
#         INSERT INTO {self.paper_table}
#           (student_index,module_code,exam_year,exam_month,
#            total_marks,total_possible,graded_at)
#         VALUES (%s,%s,%s,%s,%s,%s,NOW())
#         ON CONFLICT
#           (student_index,module_code,exam_year,exam_month)
#         DO UPDATE SET total_marks=EXCLUDED.total_marks,
#                       total_possible=EXCLUDED.total_possible,
#                       graded_at=NOW();
#         """, (student_index, module, year, month, total, possible))

#     # ───────────────────────────────────────────────────────────
#     # NEW METHODS FOR NULL ANSWER HANDLING
#     # ───────────────────────────────────────────────────────────
    
#     def get_grade_by_ids(self, student_index: str, module_code: str, exam_year: int, 
#                          exam_month: str, full_question_id: str):
#         """Check if grade exists for given IDs"""
#         self.cursor.execute("""
#         SELECT id FROM graded_student_answers_openai 
#         WHERE student_index=%s AND module_code=%s AND exam_year=%s 
#         AND exam_month=%s AND full_question_id=%s
#         """, (student_index, module_code, exam_year, exam_month, full_question_id))
#         return self.cursor.fetchone()

#     def insert_null_answer_grade(self, student_index: str, module_code: str, 
#                                 exam_year: int, exam_month: str, 
#                                 full_question_id: str, max_marks: float):
#         """Insert grade for null answer"""
#         self.cursor.execute("""
#         INSERT INTO graded_student_answers_openai
#           (student_index, module_code, exam_year, exam_month,
#            full_question_id, mark, max_marks, reason, graded_at, is_null_answer)
#         VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW(),%s)
#         ON CONFLICT
#           (student_index,module_code,exam_year,exam_month,full_question_id)
#         DO UPDATE SET mark=0, reason='No answer provided', 
#                       graded_at=NOW(), is_null_answer=TRUE;
#         """, (
#             student_index, module_code, exam_year, exam_month,
#             full_question_id, 0.0, max_marks, "No answer provided", True
#         ))

#     def sync_null_answer_grades(self, module_code: str = None, year: int = None, month: str = None):
#         """
#         Find student answers that don't have grades (null answers) and add them with grade 0
#         """
#         from .student_answer_db import StudentAnswerService
        
#         student_service = StudentAnswerService()
#         student_service.initialize_table()
        
#         # Get all student answers grouped by student
#         all_grouped_answers = student_service.get_all_answers_grouped(module_code, year, month)
        
#         synced_count = 0
        
#         for (student_index, mod_code, yr, mon), answers_list in all_grouped_answers.items():
#             for answer_record in answers_list:
#                 # Check if grade already exists for this answer
#                 existing_grade = self.get_grade_by_ids(
#                     answer_record.student_index,
#                     answer_record.module_code, 
#                     answer_record.exam_year,
#                     answer_record.exam_month,
#                     answer_record.full_question_id
#                 )
                
#                 # If no grade exists and answer is null/empty, add grade 0
#                 if not existing_grade and (
#                     answer_record.answer_text is None or 
#                     answer_record.answer_text.strip() == "" or
#                     answer_record.answer_text.lower().strip() in ["", "null", "none"]
#                 ):
#                     # Get max_marks for this question
#                     max_marks = self._get_max_marks_for_question(answer_record.full_question_id)
                    
#                     self.insert_null_answer_grade(
#                         student_index=answer_record.student_index,
#                         module_code=answer_record.module_code,
#                         exam_year=answer_record.exam_year,
#                         exam_month=answer_record.exam_month,
#                         full_question_id=answer_record.full_question_id,
#                         max_marks=max_marks
#                     )
#                     synced_count += 1
        
#         self.commit()
#         return synced_count

#     def _get_max_marks_for_question(self, full_question_id: str) -> float:
#         """
#         Get max marks for a question. You'll need to implement this based on 
#         how you store question marks in your system.
#         For now, returning a default value.
#         """
#         # TODO: Implement based on your question bank structure
#         # This might query a questions table or use a default mapping
#         return 10.0  # Default max marks - adjust based on your needs


import logging
from .base_relational_db import BaseRelationalDB
from ...models.grading_result import GradingResult

log = logging.getLogger(__name__)

class GradingResultDB(BaseRelationalDB):
    """
    Inserts / queries per-question marks and paper-level totals.
    Supports both OpenAI and Gemini providers.
    """

    def __init__(self, provider_suffix: str = ""):
        super().__init__()

        suffix_map = {
            "openai": "_openai",
            "googlegemini": "_gemini",
            "gemini": "_gemini"  # Added alias for gemini
        }

        normalized = provider_suffix.strip().lower()
        suffix = suffix_map.get(normalized, "")

        self.provider = normalized if normalized in suffix_map else "openai"
        self.answers_table = f"graded_student_answers{suffix}"
        self.paper_table = f"student_paper_results{suffix}"
        
        # Also store the source answers table for null grade syncing
        self.source_answers_table = f"student_answers{suffix}"

        log.info(f"[DB] Using grading tables: {self.answers_table}, {self.paper_table}")
        log.info(f"[DB] Source answers table: {self.source_answers_table}")
        print(f"⚙️ Provider: {self.provider.upper()}")
        print(f"⚙️ Grading Tables: {self.answers_table}, {self.paper_table}")
        print(f"⚙️ Source Table: {self.source_answers_table}")

        self._create_tables()

    # ───────────────────────────────────────────────────────────
    def _create_tables(self):
        self.cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS {self.answers_table} (
            id                 SERIAL PRIMARY KEY,
            student_index      TEXT,
            module_code        TEXT,
            exam_year          INT,
            exam_month         TEXT,
            full_question_id   TEXT,
            mark               FLOAT,
            max_marks          FLOAT,
            reason             TEXT,
            graded_at          TIMESTAMP DEFAULT NOW(),
            is_null_answer     BOOLEAN DEFAULT FALSE,  -- Added for null answers
            provider           TEXT DEFAULT '{self.provider}',  -- Track which AI provider
            UNIQUE (student_index,module_code,exam_year,exam_month,full_question_id)
        );

        CREATE TABLE IF NOT EXISTS {self.paper_table} (
            id             SERIAL PRIMARY KEY,
            student_index  TEXT,
            module_code    TEXT,
            exam_year      INT,
            exam_month     TEXT,
            total_marks    FLOAT,
            total_possible FLOAT,
            graded_at      TIMESTAMP DEFAULT NOW(),
            provider       TEXT DEFAULT '{self.provider}',  -- Track which AI provider
            UNIQUE (student_index,module_code,exam_year,exam_month)
        );
        """)
        self.commit()

    # ───────────────────────────────────────────────────────────
    def save_question_mark(self, row: GradingResult):
        self.cursor.execute(f"""
        INSERT INTO {self.answers_table}
          (student_index,module_code,exam_year,exam_month,
           full_question_id,mark,max_marks,reason,graded_at,is_null_answer,provider)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW(),%s,%s)
        ON CONFLICT
          (student_index,module_code,exam_year,exam_month,full_question_id)
        DO UPDATE SET mark=EXCLUDED.mark, reason=EXCLUDED.reason,
                      graded_at=NOW(), is_null_answer=EXCLUDED.is_null_answer,
                      provider=EXCLUDED.provider;
        """, (
            row.student_index, row.module_code, row.exam_year, row.exam_month,
            row.full_question_id, row.score, row.max_marks, row.feedback,
            getattr(row, 'is_null_answer', False), self.provider
        ))

    # ───────────────────────────────────────────────────────────
    def save_paper_total(self,
                         student_index: str, module: str,
                         year: int, month: str,
                         total: float, possible: float):
        self.cursor.execute(f"""
        INSERT INTO {self.paper_table}
          (student_index,module_code,exam_year,exam_month,
           total_marks,total_possible,graded_at,provider)
        VALUES (%s,%s,%s,%s,%s,%s,NOW(),%s)
        ON CONFLICT
          (student_index,module_code,exam_year,exam_month)
        DO UPDATE SET total_marks=EXCLUDED.total_marks,
                      total_possible=EXCLUDED.total_possible,
                      graded_at=NOW(), provider=EXCLUDED.provider;
        """, (student_index, module, year, month, total, possible, self.provider))

    # ───────────────────────────────────────────────────────────
    # ENHANCED METHODS FOR NULL ANSWER HANDLING - MULTI-PROVIDER
    # ───────────────────────────────────────────────────────────
    
    def get_grade_by_ids(self, student_index: str, module_code: str, exam_year: int, 
                         exam_month: str, full_question_id: str):
        """Check if grade exists for given IDs"""
        self.cursor.execute(f"""
        SELECT id FROM {self.answers_table}
        WHERE student_index=%s AND module_code=%s AND exam_year=%s 
        AND exam_month=%s AND full_question_id=%s
        """, (student_index, module_code, exam_year, exam_month, full_question_id))
        return self.cursor.fetchone()

    def insert_null_answer_grade(self, student_index: str, module_code: str, 
                                exam_year: int, exam_month: str, 
                                full_question_id: str, max_marks: float):
        """Insert grade for null answer"""
        self.cursor.execute(f"""
        INSERT INTO {self.answers_table}
          (student_index, module_code, exam_year, exam_month,
           full_question_id, mark, max_marks, reason, graded_at, is_null_answer, provider)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW(),%s,%s)
        ON CONFLICT
          (student_index,module_code,exam_year,exam_month,full_question_id)
        DO UPDATE SET mark=0, reason='No answer provided', 
                      graded_at=NOW(), is_null_answer=TRUE, provider=EXCLUDED.provider;
        """, (
            student_index, module_code, exam_year, exam_month,
            full_question_id, 0.0, max_marks, "No answer provided", True, self.provider
        ))

    def sync_null_answer_grades(self, module_code: str = None, year: int = None, month: str = None):
        """
        Find student answers that don't have grades (null answers) and add them with grade 0
        Works with the current provider's tables
        """
        
        # Check if source answers table exists
        self.cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = %s
            )
        """, (self.source_answers_table,))
        
        if not self.cursor.fetchone()[0]:
            log.warning(f"Source answers table {self.source_answers_table} does not exist")
            return 0
        
        # Build query with optional filters
        where_conditions = []
        params = []
        
        if module_code:
            where_conditions.append("module_code = %s")
            params.append(module_code)
        if year:
            where_conditions.append("exam_year = %s")
            params.append(year)
        if month:
            where_conditions.append("exam_month = %s")
            params.append(month)
        
        where_clause = ""
        if where_conditions:
            where_clause = "WHERE " + " AND ".join(where_conditions)
        
        # Get all student answers for this provider
        query = f"""
            SELECT student_index, module_code, exam_year, exam_month, answers 
            FROM {self.source_answers_table}
            {where_clause}
        """
        
        self.cursor.execute(query, params)
        student_records = self.cursor.fetchall()
        
        log.info(f"Found {len(student_records)} student records to process for {self.provider}")
        
        synced_count = 0
        
        for student_index, mod_code, yr, mon, answers_json in student_records:
            if not answers_json:
                continue
                
            for full_question_id, answer_text in answers_json.items():
                # Check if grade already exists for this answer
                existing_grade = self.get_grade_by_ids(
                    student_index, mod_code, yr, mon, full_question_id
                )
                
                # Check if answer is null/empty
                is_null_answer = (
                    answer_text is None or 
                    str(answer_text).strip() == "" or
                    str(answer_text).lower().strip() in ["", "null", "none"]
                )
                
                # If no grade exists and answer is null/empty, add grade 0
                if not existing_grade and is_null_answer:
                    # Get max_marks for this question
                    max_marks = self._get_max_marks_for_question(
                        mod_code, yr, mon, full_question_id
                    )
                    
                    self.insert_null_answer_grade(
                        student_index=student_index,
                        module_code=mod_code,
                        exam_year=yr,
                        exam_month=mon,
                        full_question_id=full_question_id,
                        max_marks=max_marks
                    )
                    synced_count += 1
                    
                    log.debug(f"Added null grade for {student_index} - {mod_code} - {full_question_id}")
        
        self.commit()
        log.info(f"Synced {synced_count} null answer grades for {self.provider}")
        return synced_count

    def _get_max_marks_for_question(self, module_code: str, exam_year: int, 
                                   exam_month: str, full_question_id: str) -> float:
        """
        Get max marks for a question from multiple sources.
        Enhanced to check both provider tables and question definitions.
        """
        try:
            # Option 1: Get from existing graded answers for current provider
            self.cursor.execute(f"""
                SELECT max_marks 
                FROM {self.answers_table}
                WHERE module_code = %s AND exam_year = %s AND exam_month = %s 
                AND full_question_id = %s
                AND max_marks IS NOT NULL
                LIMIT 1
            """, (module_code, exam_year, exam_month, full_question_id))
            
            result = self.cursor.fetchone()
            if result and result[0] is not None:
                return float(result[0])
            
            # Option 2: Try to get from other provider's grades table
            other_provider_tables = []
            if self.provider == 'openai':
                other_provider_tables = ['graded_student_answers_gemini']
            elif self.provider == 'gemini':
                other_provider_tables = ['graded_student_answers_openai']
            else:
                other_provider_tables = ['graded_student_answers_openai', 'graded_student_answers_gemini']
            
            for other_table in other_provider_tables:
                # Check if table exists
                self.cursor.execute("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = %s
                    )
                """, (other_table,))
                
                if self.cursor.fetchone()[0]:  # Table exists
                    self.cursor.execute(f"""
                        SELECT max_marks 
                        FROM {other_table}
                        WHERE module_code = %s AND exam_year = %s AND exam_month = %s 
                        AND full_question_id = %s
                        AND max_marks IS NOT NULL
                        LIMIT 1
                    """, (module_code, exam_year, exam_month, full_question_id))
                    
                    result = self.cursor.fetchone()
                    if result and result[0] is not None:
                        return float(result[0])
            
            # Option 3: Try to get from questions table (if it exists)
            try:
                self.cursor.execute("""
                    SELECT total_marks, marks 
                    FROM questions 
                    WHERE module_code = %s AND exam_year = %s AND exam_month = %s 
                    AND (id = %s OR full_question_id = %s)
                    LIMIT 1
                """, (module_code, exam_year, exam_month, full_question_id, full_question_id))
                
                result = self.cursor.fetchone()
                if result:
                    # Use marks if available (for sub-questions), otherwise total_marks
                    marks = result[1] if result[1] is not None else result[0]
                    if marks is not None:
                        return float(marks)
            except Exception as e:
                log.debug(f"Questions table query failed: {e}")
            
            # Option 4: Try to get from sub_questions table (if it exists)
            try:
                self.cursor.execute("""
                    SELECT marks 
                    FROM sub_questions 
                    WHERE module_code = %s AND exam_year = %s AND exam_month = %s 
                    AND (id = %s OR full_question_id = %s)
                    LIMIT 1
                """, (module_code, exam_year, exam_month, full_question_id, full_question_id))
                
                result = self.cursor.fetchone()
                if result and result[0] is not None:
                    return float(result[0])
            except Exception as e:
                log.debug(f"Sub_questions table query failed: {e}")
            
            # Option 5: Try pattern matching on question structure
            try:
                # Parse question structure to determine marks
                parts = full_question_id.upper().split('_')
                base_question = parts[0]  # e.g., "Q1"
                
                # Try to find marks for the base question
                self.cursor.execute("""
                    SELECT total_marks 
                    FROM questions 
                    WHERE module_code = %s AND exam_year = %s AND exam_month = %s 
                    AND id = %s
                    LIMIT 1
                """, (module_code, exam_year, exam_month, base_question))
                
                result = self.cursor.fetchone()
                if result and result[0] is not None:
                    total_marks = float(result[0])
                    # If it's a sub-question, assume equal distribution
                    if len(parts) > 1:
                        # Count how many sub-questions this base question has
                        self.cursor.execute(f"""
                            SELECT COUNT(DISTINCT answer.full_question_id)
                            FROM {self.source_answers_table} sa
                            CROSS JOIN LATERAL jsonb_each_text(sa.answers) AS answer(full_question_id, answer_text)
                            WHERE sa.module_code = %s AND sa.exam_year = %s AND sa.exam_month = %s
                            AND answer.full_question_id LIKE %s
                        """, (module_code, exam_year, exam_month, f"{base_question}_%"))
                        
                        sub_count_result = self.cursor.fetchone()
                        if sub_count_result and sub_count_result[0] > 0:
                            return total_marks / sub_count_result[0]
                    
                    return total_marks
            except Exception as e:
                log.debug(f"Pattern matching query failed: {e}")
            
            # Fallback: Use intelligent generic calculation based on question structure
            log.warning(f"Max marks not found in database for {full_question_id}, using intelligent fallback")
            return self._get_intelligent_max_marks(full_question_id)
            
        except Exception as e:
            log.error(f"Error fetching max marks from database: {e}")
            return self._get_intelligent_max_marks(full_question_id)

    def _get_intelligent_max_marks(self, full_question_id: str) -> float:
        """
        Get max marks for a question based on intelligent question ID pattern analysis.
        This follows common exam marking patterns.
        """
        question_id = full_question_id.upper()
        
        # Split into parts
        parts = question_id.split('_')
        
        if len(parts) == 1:
            # Main questions (Q1, Q2, etc.) - usually highest marks
            return 25.0
        elif len(parts) == 2:
            # First level sub-questions (Q1_A, Q1_I, etc.)
            sub_part = parts[1]
            
            # Roman numerals (I, II, III, IV, V) often have higher marks
            if sub_part in ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']:
                return 15.0
            
            # Letters (A, B, C, D, E) typically medium marks
            elif sub_part in ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']:
                return 12.0
            
            # Small letters (a, b, c, d, e) typically lower marks
            elif sub_part.lower() in ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']:
                return 10.0
            
            # Numbers (1, 2, 3, etc.) typically small marks
            else:
                return 8.0
                
        elif len(parts) == 3:
            # Second level sub-questions (Q1_A_I, Q2_B_II, etc.)
            return 8.0
            
        elif len(parts) >= 4:
            # Very specific sub-parts (Q1_A_I_1, etc.)
            return 5.0
        
        # Default fallback
        return 10.0

    # ───────────────────────────────────────────────────────────
    # ADDITIONAL UTILITY METHODS
    # ───────────────────────────────────────────────────────────
    
    def get_null_answer_statistics(self, module_code: str = None, 
                                  year: int = None, month: str = None):
        """Get statistics about null answer grades for this provider"""
        where_conditions = ["is_null_answer = TRUE"]
        params = []
        
        if module_code:
            where_conditions.append("module_code = %s")
            params.append(module_code)
        if year:
            where_conditions.append("exam_year = %s")
            params.append(year)
        if month:
            where_conditions.append("exam_month = %s")
            params.append(month)
        
        where_clause = "WHERE " + " AND ".join(where_conditions)
        
        # Get count by module
        self.cursor.execute(f"""
            SELECT module_code, COUNT(*) as null_count
            FROM {self.answers_table}
            {where_clause}
            GROUP BY module_code
            ORDER BY module_code
        """, params)
        
        return self.cursor.fetchall()

    def get_provider_comparison_stats(self):
        """Compare null answer statistics between providers"""
        stats = {}
        
        for provider in ['openai', 'gemini']:
            table_name = f"graded_student_answers_{provider}"
            
            # Check if table exists
            self.cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = %s
                )
            """, (table_name,))
            
            if self.cursor.fetchone()[0]:
                self.cursor.execute(f"""
                    SELECT 
                        COUNT(*) as total_grades,
                        COUNT(CASE WHEN is_null_answer = TRUE THEN 1 END) as null_grades,
                        ROUND(
                            COUNT(CASE WHEN is_null_answer = TRUE THEN 1 END) * 100.0 / COUNT(*), 2
                        ) as null_percentage
                    FROM {table_name}
                """)
                
                result = self.cursor.fetchone()
                if result:
                    stats[provider] = {
                        'total_grades': result[0],
                        'null_grades': result[1],
                        'null_percentage': result[2] or 0.0
                    }
        
        return stats

    def cleanup_duplicate_null_grades(self):
        """Remove duplicate null answer grades, keeping the most recent"""
        self.cursor.execute(f"""
            DELETE FROM {self.answers_table} a1
            USING {self.answers_table} a2
            WHERE a1.id < a2.id
            AND a1.student_index = a2.student_index
            AND a1.module_code = a2.module_code
            AND a1.exam_year = a2.exam_year
            AND a1.exam_month = a2.exam_month
            AND a1.full_question_id = a2.full_question_id
            AND a1.is_null_answer = TRUE
            AND a2.is_null_answer = TRUE
        """)
        
        deleted_count = self.cursor.rowcount
        self.commit()
        
        log.info(f"Cleaned up {deleted_count} duplicate null answer grades for {self.provider}")
        return deleted_count

    def validate_null_answer_consistency(self):
        """
        Validate that null answer grades are consistent with actual answer data
        Returns list of inconsistencies found
        """
        # Check if source answers table exists
        self.cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = %s
            )
        """, (self.source_answers_table,))
        
        if not self.cursor.fetchone()[0]:
            log.warning(f"Source answers table {self.source_answers_table} does not exist")
            return []
        
        inconsistencies = []
        
        # Find grades marked as null but have actual answers
        self.cursor.execute(f"""
            SELECT g.student_index, g.module_code, g.exam_year, g.exam_month, 
                   g.full_question_id, sa.answers->g.full_question_id as actual_answer
            FROM {self.answers_table} g
            JOIN {self.source_answers_table} sa ON (
                g.student_index = sa.student_index AND
                g.module_code = sa.module_code AND
                g.exam_year = sa.exam_year AND
                g.exam_month = sa.exam_month
            )
            WHERE g.is_null_answer = TRUE
            AND sa.answers ? g.full_question_id
            AND COALESCE(TRIM(sa.answers->>g.full_question_id), '') != ''
            AND LOWER(TRIM(sa.answers->>g.full_question_id)) NOT IN ('null', 'none', '')
        """)
        
        false_nulls = self.cursor.fetchall()
        for row in false_nulls:
            inconsistencies.append({
                'type': 'false_null',
                'student_index': row[0],
                'module_code': row[1],
                'exam_year': row[2],
                'exam_month': row[3],
                'full_question_id': row[4],
                'actual_answer': row[5],
                'issue': 'Marked as null but has actual answer'
            })
        
        # Find grades not marked as null but have no actual answers
        self.cursor.execute(f"""
            SELECT g.student_index, g.module_code, g.exam_year, g.exam_month, 
                   g.full_question_id, g.mark
            FROM {self.answers_table} g
            JOIN {self.source_answers_table} sa ON (
                g.student_index = sa.student_index AND
                g.module_code = sa.module_code AND
                g.exam_year = sa.exam_year AND
                g.exam_month = sa.exam_month
            )
            WHERE g.is_null_answer = FALSE
            AND g.mark > 0
            AND (
                NOT sa.answers ? g.full_question_id OR
                COALESCE(TRIM(sa.answers->>g.full_question_id), '') = '' OR
                LOWER(TRIM(sa.answers->>g.full_question_id)) IN ('null', 'none', '')
            )
        """)
        
        false_non_nulls = self.cursor.fetchall()
        for row in false_non_nulls:
            inconsistencies.append({
                'type': 'false_non_null',
                'student_index': row[0],
                'module_code': row[1],
                'exam_year': row[2],
                'exam_month': row[3],
                'full_question_id': row[4],
                'mark': row[5],
                'issue': 'Has grade but no actual answer'
            })
        
        log.info(f"Found {len(inconsistencies)} inconsistencies in null answer grades for {self.provider}")
        return inconsistencies