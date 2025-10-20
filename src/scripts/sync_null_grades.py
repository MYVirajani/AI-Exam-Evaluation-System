# #!/usr/bin/env python3
# """
# Standalone script to sync null answer grades
# This script directly connects to the database and gets max marks from question definitions
# """

# import psycopg2
# import json
# import os
# from dotenv import load_dotenv

# def main():
#     print("Starting null grade sync...")
#     print("=" * 50)
    
#     # Load environment variables from .env file
#     load_dotenv()
    
#     # Database connection parameters - directly from .env
#     db_params = {
#         'host': os.getenv('POSTGRES_HOST'),
#         'database': os.getenv('POSTGRES_DB'),
#         'user': os.getenv('POSTGRES_USER'),
#         'password': os.getenv('POSTGRES_PASSWORD'),
#         'port': os.getenv('POSTGRES_PORT')
#     }
    
#     # Check if all required env vars are loaded
#     missing_vars = [key for key, value in db_params.items() if value is None]
#     if missing_vars:
#         print(f"❌ Error: Missing environment variables: {missing_vars}")
#         print("Please check your .env file contains: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_PORT")
#         return 1
    
#     print(f"Connecting to database: {db_params['database']} on {db_params['host']}:{db_params['port']}")
#     print(f"Using user: {db_params['user']}")
    
#     try:
#         # Connect to database
#         conn = psycopg2.connect(**db_params)
#         cursor = conn.cursor()
        
#         # Get ALL student answers from all modules/years/months
#         print("Syncing for: ALL modules, years, and months")
        
#         cursor.execute("""
#             SELECT student_index, module_code, exam_year, exam_month, answers 
#             FROM student_answers
#         """)
        
#         student_records = cursor.fetchall()
#         print(f"Found {len(student_records)} student records")
        
#         synced_count = 0
        
#         for student_index, mod_code, yr, mon, answers_json in student_records:
#             print(f"Processing: {student_index} - {mod_code} ({yr} {mon})")
            
#             # answers_json is a dict like {"Q1_a": "answer text", "Q1_b": null, ...}
#             for full_question_id, answer_text in answers_json.items():
                
#                 # Check if grade already exists
#                 cursor.execute("""
#                     SELECT id FROM graded_student_answers 
#                     WHERE student_index=%s AND module_code=%s AND exam_year=%s 
#                     AND exam_month=%s AND full_question_id=%s
#                 """, (student_index, mod_code, yr, mon, full_question_id))
                
#                 existing_grade = cursor.fetchone()
                
#                 # Check if answer is null/empty
#                 is_null_answer = (
#                     answer_text is None or 
#                     str(answer_text).strip() == "" or
#                     str(answer_text).lower().strip() in ["null", "none", ""]
#                 )
                
#                 # If no grade exists and answer is null, add grade 0
#                 if not existing_grade and is_null_answer:
#                     print(f"  Adding null grade for: {mod_code} - {full_question_id}")
                    
#                     # Get max marks from the database (following the same pattern as GradingService)
#                     max_marks = get_max_marks_from_db(cursor, mod_code, yr, mon, full_question_id)
                    
#                     cursor.execute("""
#                         INSERT INTO graded_student_answers
#                         (student_index, module_code, exam_year, exam_month,
#                          full_question_id, mark, max_marks, feedback, graded_at, is_null_answer)
#                         VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW(),%s)
#                     """, (
#                         student_index, mod_code, yr, mon,
#                         full_question_id, 0.0, max_marks, "No answer provided", True
#                     ))
#                     synced_count += 1
        
#         # Commit changes
#         conn.commit()
        
#         print(f"✅ Successfully synced {synced_count} null answer grades across all modules")
        
#         # Show summary by module
#         cursor.execute("""
#             SELECT module_code, COUNT(*) as null_count
#             FROM graded_student_answers 
#             WHERE is_null_answer = TRUE
#             GROUP BY module_code
#             ORDER BY module_code
#         """)
        
#         summary = cursor.fetchall()
#         if summary:
#             print("\n📊 Summary by module:")
#             for mod_code, count in summary:
#                 print(f"  {mod_code}: {count} null answer grades")
        
#     except psycopg2.OperationalError as e:
#         print(f"❌ Database connection error: {e}")
#         print("Please check your database credentials and ensure PostgreSQL is running")
#         return 1
#     except Exception as e:
#         print(f"❌ Error: {e}")
#         if 'conn' in locals():
#             conn.rollback()
#         return 1
    
#     finally:
#         if 'cursor' in locals():
#             cursor.close()
#         if 'conn' in locals():
#             conn.close()
    
#     print("=" * 50)
#     print("Null grade sync completed!")
#     return 0

# def get_max_marks_from_db(cursor, module_code: str, exam_year: int, exam_month: str, full_question_id: str) -> float:
#     """
#     Get max marks for a question from the database following the same pattern as GradingService.
#     Tries multiple sources in order of preference.
#     """
#     try:
#         # Option 1: Get from existing graded_student_answers (most reliable)
#         cursor.execute("""
#             SELECT max_marks 
#             FROM graded_student_answers 
#             WHERE module_code = %s AND exam_year = %s AND exam_month = %s 
#             AND full_question_id = %s
#             AND max_marks IS NOT NULL
#             LIMIT 1
#         """, (module_code, exam_year, exam_month, full_question_id))
        
#         result = cursor.fetchone()
#         if result and result[0] is not None:
#             return float(result[0])
        
#         # Option 2: Try to get from questions table (if it exists)
#         try:
#             cursor.execute("""
#                 SELECT total_marks, marks 
#                 FROM questions 
#                 WHERE module_code = %s AND exam_year = %s AND exam_month = %s 
#                 AND (id = %s OR full_question_id = %s)
#                 LIMIT 1
#             """, (module_code, exam_year, exam_month, full_question_id, full_question_id))
            
#             result = cursor.fetchone()
#             if result:
#                 # Use marks if available (for sub-questions), otherwise total_marks
#                 marks = result[1] if result[1] is not None else result[0]
#                 if marks is not None:
#                     return float(marks)
#         except Exception:
#             pass
        
#         # Option 3: Try to get from sub_questions table (if it exists)
#         try:
#             cursor.execute("""
#                 SELECT marks 
#                 FROM sub_questions 
#                 WHERE module_code = %s AND exam_year = %s AND exam_month = %s 
#                 AND (id = %s OR full_question_id = %s)
#                 LIMIT 1
#             """, (module_code, exam_year, exam_month, full_question_id, full_question_id))
            
#             result = cursor.fetchone()
#             if result and result[0] is not None:
#                 return float(result[0])
#         except Exception:
#             pass
        
#         # Option 4: Try pattern matching on question structure
#         try:
#             # Parse question structure to determine marks
#             parts = full_question_id.upper().split('_')
#             base_question = parts[0]  # e.g., "Q1"
            
#             # Try to find marks for the base question
#             cursor.execute("""
#                 SELECT total_marks 
#                 FROM questions 
#                 WHERE module_code = %s AND exam_year = %s AND exam_month = %s 
#                 AND id = %s
#                 LIMIT 1
#             """, (module_code, exam_year, exam_month, base_question))
            
#             result = cursor.fetchone()
#             if result and result[0] is not None:
#                 total_marks = float(result[0])
#                 # If it's a sub-question, assume equal distribution
#                 if len(parts) > 1:
#                     # Count how many sub-questions this base question has
#                     cursor.execute("""
#                         SELECT COUNT(DISTINCT full_question_id)
#                         FROM student_answers sa
#                         CROSS JOIN LATERAL jsonb_each_text(sa.answers) AS answer(full_question_id, answer_text)
#                         WHERE sa.module_code = %s AND sa.exam_year = %s AND sa.exam_month = %s
#                         AND answer.full_question_id LIKE %s
#                     """, (module_code, exam_year, exam_month, f"{base_question}_%"))
                    
#                     sub_count_result = cursor.fetchone()
#                     if sub_count_result and sub_count_result[0] > 0:
#                         return total_marks / sub_count_result[0]
                
#                 return total_marks
#         except Exception:
#             pass
        
#         # Fallback: Use intelligent generic calculation based on question structure
#         print(f"    Warning: Max marks not found in database for {full_question_id}, using intelligent fallback")
#         return get_intelligent_max_marks(full_question_id)
        
#     except Exception as e:
#         print(f"    Warning: Error fetching max marks from database: {e}")
#         return get_intelligent_max_marks(full_question_id)

# def get_intelligent_max_marks(full_question_id: str) -> float:
#     """
#     Get max marks for a question based on intelligent question ID pattern analysis.
#     This follows common exam marking patterns.
#     """
#     question_id = full_question_id.upper()
    
#     # Split into parts
#     parts = question_id.split('_')
    
#     if len(parts) == 1:
#         # Main questions (Q1, Q2, etc.) - usually highest marks
#         return 25.0
#     elif len(parts) == 2:
#         # First level sub-questions (Q1_A, Q1_I, etc.)
#         sub_part = parts[1]
        
#         # Roman numerals (I, II, III, IV, V) often have higher marks
#         if sub_part in ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']:
#             return 15.0
        
#         # Letters (A, B, C, D, E) typically medium marks
#         elif sub_part in ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']:
#             return 12.0
        
#         # Small letters (a, b, c, d, e) typically lower marks
#         elif sub_part.lower() in ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']:
#             return 10.0
        
#         # Numbers (1, 2, 3, etc.) typically small marks
#         else:
#             return 8.0
            
#     elif len(parts) == 3:
#         # Second level sub-questions (Q1_A_I, Q2_B_II, etc.)
#         return 8.0
        
#     elif len(parts) >= 4:
#         # Very specific sub-parts (Q1_A_I_1, etc.)
#         return 5.0
    
#     # Default fallback
#     return 10.0

# if __name__ == "__main__":
#     exit(main())

#!/usr/bin/env python3
"""
Standalone script to sync null answer grades for both OpenAI and Gemini providers
This script directly connects to the database and gets max marks from question definitions
"""

import psycopg2
import json
import os
from dotenv import load_dotenv
import argparse

def main():
    parser = argparse.ArgumentParser(description='Sync null answer grades for AI providers')
    parser.add_argument('--provider', choices=['openai', 'gemini', 'all'], default='all',
                       help='AI provider to sync (default: all)')
    parser.add_argument('--module', help='Specific module code to sync')
    parser.add_argument('--year', type=int, help='Specific exam year to sync')
    parser.add_argument('--month', help='Specific exam month to sync')
    
    args = parser.parse_args()
    
    print("Starting null grade sync...")
    print("=" * 50)
    
    # Load environment variables from .env file
    load_dotenv()
    
    # Database connection parameters - directly from .env
    db_params = {
        'host': os.getenv('POSTGRES_HOST'),
        'database': os.getenv('POSTGRES_DB'),
        'user': os.getenv('POSTGRES_USER'),
        'password': os.getenv('POSTGRES_PASSWORD'),
        'port': os.getenv('POSTGRES_PORT')
    }
    
    # Check if all required env vars are loaded
    missing_vars = [key for key, value in db_params.items() if value is None]
    if missing_vars:
        print(f"❌ Error: Missing environment variables: {missing_vars}")
        print("Please check your .env file contains: POSTGRES_HOST, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_PORT")
        return 1
    
    print(f"Connecting to database: {db_params['database']} on {db_params['host']}:{db_params['port']}")
    print(f"Using user: {db_params['user']}")
    print(f"Provider(s): {args.provider}")
    
    if args.module:
        print(f"Module filter: {args.module}")
    if args.year:
        print(f"Year filter: {args.year}")
    if args.month:
        print(f"Month filter: {args.month}")
    
    try:
        # Connect to database
        conn = psycopg2.connect(**db_params)
        cursor = conn.cursor()
        
        # Determine which providers to process
        providers_to_process = []
        if args.provider == 'all':
            providers_to_process = ['openai', 'gemini']
        else:
            providers_to_process = [args.provider]
        
        total_synced = 0
        
        for provider in providers_to_process:
            print(f"\n🔄 Processing provider: {provider.upper()}")
            print("-" * 30)
            
            synced_count = sync_provider_null_grades(
                cursor, provider, args.module, args.year, args.month
            )
            total_synced += synced_count
            
            print(f"✅ {provider.upper()}: {synced_count} null answer grades synced")
        
        # Commit all changes
        conn.commit()
        
        print(f"\n🎉 Total synced across all providers: {total_synced}")
        
        # Show summary by provider and module
        show_summary(cursor, providers_to_process)
        
    except psycopg2.OperationalError as e:
        print(f"❌ Database connection error: {e}")
        print("Please check your database credentials and ensure PostgreSQL is running")
        return 1
    except Exception as e:
        print(f"❌ Error: {e}")
        if 'conn' in locals():
            conn.rollback()
        return 1
    
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
    
    print("=" * 50)
    print("Null grade sync completed!")
    return 0

def sync_provider_null_grades(cursor, provider: str, module_filter=None, year_filter=None, month_filter=None):
    """Sync null grades for a specific provider"""
    
    # Determine table names based on provider
    if provider == 'openai':
        answers_table = 'student_answers_openai'
        grades_table = 'graded_student_answers_openai'
    elif provider == 'gemini':
        answers_table = 'student_answers_gemini'
        grades_table = 'graded_student_answers_gemini'
    else:
        raise ValueError(f"Unknown provider: {provider}")
    
    # Build query with optional filters
    where_conditions = []
    params = []
    
    if module_filter:
        where_conditions.append("module_code = %s")
        params.append(module_filter)
    if year_filter:
        where_conditions.append("exam_year = %s")
        params.append(year_filter)
    if month_filter:
        where_conditions.append("exam_month = %s")
        params.append(month_filter)
    
    where_clause = ""
    if where_conditions:
        where_clause = "WHERE " + " AND ".join(where_conditions)
    
    # Check if tables exist
    cursor.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = %s
        )
    """, (answers_table,))
    
    if not cursor.fetchone()[0]:
        print(f"  ⚠️  Table {answers_table} does not exist, skipping {provider}")
        return 0
    
    cursor.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = %s
        )
    """, (grades_table,))
    
    if not cursor.fetchone()[0]:
        print(f"  ⚠️  Table {grades_table} does not exist, skipping {provider}")
        return 0
    
    # Get student answers
    query = f"""
        SELECT student_index, module_code, exam_year, exam_month, answers 
        FROM {answers_table}
        {where_clause}
    """
    
    cursor.execute(query, params)
    student_records = cursor.fetchall()
    
    print(f"  Found {len(student_records)} student records in {answers_table}")
    
    synced_count = 0
    
    for student_index, mod_code, yr, mon, answers_json in student_records:
        print(f"  Processing: {student_index} - {mod_code} ({yr} {mon})")
        
        # answers_json is a dict like {"Q1_a": "answer text", "Q1_b": null, ...}
        if not answers_json:
            continue
            
        for full_question_id, answer_text in answers_json.items():
            
            # Check if grade already exists
            cursor.execute(f"""
                SELECT id FROM {grades_table}
                WHERE student_index=%s AND module_code=%s AND exam_year=%s 
                AND exam_month=%s AND full_question_id=%s
            """, (student_index, mod_code, yr, mon, full_question_id))
            
            existing_grade = cursor.fetchone()
            
            # Check if answer is null/empty
            is_null_answer = (
                answer_text is None or 
                str(answer_text).strip() == "" or
                str(answer_text).lower().strip() in ["null", "none", ""]
            )
            
            # If no grade exists and answer is null, add grade 0
            if not existing_grade and is_null_answer:
                print(f"    Adding null grade for: {mod_code} - {full_question_id}")
                
                # Get max marks from the database
                max_marks = get_max_marks_from_db(cursor, mod_code, yr, mon, full_question_id, provider)
                
                cursor.execute(f"""
                    INSERT INTO {grades_table}
                    (student_index, module_code, exam_year, exam_month,
                     full_question_id, mark, max_marks, reason, graded_at, is_null_answer)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW(),%s)
                """, (
                    student_index, mod_code, yr, mon,
                    full_question_id, 0.0, max_marks, "No answer provided", True
                ))
                synced_count += 1
    
    return synced_count

def get_max_marks_from_db(cursor, module_code: str, exam_year: int, exam_month: str, 
                         full_question_id: str, provider: str) -> float:
    """
    Get max marks for a question from the database following the same pattern as GradingService.
    Tries multiple sources in order of preference for the specific provider.
    """
    
    # Determine grades table based on provider
    if provider == 'openai':
        grades_table = 'graded_student_answers_openai'
    elif provider == 'gemini':
        grades_table = 'graded_student_answers_gemini'
    else:
        grades_table = 'graded_student_answers_openai'  # fallback
    
    try:
        # Option 1: Get from existing graded answers for this provider (most reliable)
        cursor.execute(f"""
            SELECT max_marks 
            FROM {grades_table}
            WHERE module_code = %s AND exam_year = %s AND exam_month = %s 
            AND full_question_id = %s
            AND max_marks IS NOT NULL
            LIMIT 1
        """, (module_code, exam_year, exam_month, full_question_id))
        
        result = cursor.fetchone()
        if result and result[0] is not None:
            return float(result[0])
        
        # Option 2: Try to get from other provider's grades table
        other_grades_table = 'graded_student_answers_gemini' if provider == 'openai' else 'graded_student_answers_openai'
        
        cursor.execute(f"""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = %s
            )
        """, (other_grades_table,))
        
        if cursor.fetchone()[0]:  # Table exists
            cursor.execute(f"""
                SELECT max_marks 
                FROM {other_grades_table}
                WHERE module_code = %s AND exam_year = %s AND exam_month = %s 
                AND full_question_id = %s
                AND max_marks IS NOT NULL
                LIMIT 1
            """, (module_code, exam_year, exam_month, full_question_id))
            
            result = cursor.fetchone()
            if result and result[0] is not None:
                return float(result[0])
        
        # Option 3: Try to get from questions table (if it exists)
        try:
            cursor.execute("""
                SELECT total_marks, marks 
                FROM questions 
                WHERE module_code = %s AND exam_year = %s AND exam_month = %s 
                AND (id = %s OR full_question_id = %s)
                LIMIT 1
            """, (module_code, exam_year, exam_month, full_question_id, full_question_id))
            
            result = cursor.fetchone()
            if result:
                # Use marks if available (for sub-questions), otherwise total_marks
                marks = result[1] if result[1] is not None else result[0]
                if marks is not None:
                    return float(marks)
        except Exception:
            pass
        
        # Option 4: Try to get from sub_questions table (if it exists)
        try:
            cursor.execute("""
                SELECT marks 
                FROM sub_questions 
                WHERE module_code = %s AND exam_year = %s AND exam_month = %s 
                AND (id = %s OR full_question_id = %s)
                LIMIT 1
            """, (module_code, exam_year, exam_month, full_question_id, full_question_id))
            
            result = cursor.fetchone()
            if result and result[0] is not None:
                return float(result[0])
        except Exception:
            pass
        
        # Option 5: Try pattern matching on question structure
        try:
            # Parse question structure to determine marks
            parts = full_question_id.upper().split('_')
            base_question = parts[0]  # e.g., "Q1"
            
            # Try to find marks for the base question
            cursor.execute("""
                SELECT total_marks 
                FROM questions 
                WHERE module_code = %s AND exam_year = %s AND exam_month = %s 
                AND id = %s
                LIMIT 1
            """, (module_code, exam_year, exam_month, base_question))
            
            result = cursor.fetchone()
            if result and result[0] is not None:
                total_marks = float(result[0])
                # If it's a sub-question, assume equal distribution
                if len(parts) > 1:
                    # Count how many sub-questions this base question has
                    answers_table = f'student_answers_{provider}'
                    cursor.execute(f"""
                        SELECT COUNT(DISTINCT answer.full_question_id)
                        FROM {answers_table} sa
                        CROSS JOIN LATERAL jsonb_each_text(sa.answers) AS answer(full_question_id, answer_text)
                        WHERE sa.module_code = %s AND sa.exam_year = %s AND sa.exam_month = %s
                        AND answer.full_question_id LIKE %s
                    """, (module_code, exam_year, exam_month, f"{base_question}_%"))
                    
                    sub_count_result = cursor.fetchone()
                    if sub_count_result and sub_count_result[0] > 0:
                        return total_marks / sub_count_result[0]
                
                return total_marks
        except Exception:
            pass
        
        # Fallback: Use intelligent generic calculation based on question structure
        print(f"    Warning: Max marks not found in database for {full_question_id}, using intelligent fallback")
        return get_intelligent_max_marks(full_question_id)
        
    except Exception as e:
        print(f"    Warning: Error fetching max marks from database: {e}")
        return get_intelligent_max_marks(full_question_id)

def get_intelligent_max_marks(full_question_id: str) -> float:
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

def show_summary(cursor, providers):
    """Show summary of null answer grades by provider and module"""
    print("\n📊 Summary by provider and module:")
    
    for provider in providers:
        if provider == 'openai':
            grades_table = 'graded_student_answers_openai'
        elif provider == 'gemini':
            grades_table = 'graded_student_answers_gemini'
        else:
            continue
        
        # Check if table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = %s
            )
        """, (grades_table,))
        
        if not cursor.fetchone()[0]:
            continue
        
        cursor.execute(f"""
            SELECT module_code, COUNT(*) as null_count
            FROM {grades_table}
            WHERE is_null_answer = TRUE
            GROUP BY module_code
            ORDER BY module_code
        """)
        
        summary = cursor.fetchall()
        if summary:
            print(f"\n  {provider.upper()}:")
            for mod_code, count in summary:
                print(f"    {mod_code}: {count} null answer grades")
        else:
            print(f"\n  {provider.upper()}: No null answer grades found")

if __name__ == "__main__":
    exit(main())