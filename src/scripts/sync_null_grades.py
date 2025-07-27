#!/usr/bin/env python3
"""
Standalone script to sync null answer grades
This script directly connects to the database and gets max marks from question definitions
"""

import psycopg2
import json
import os
from dotenv import load_dotenv

def main():
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
        print("Please check your .env file contains: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_PORT")
        return 1
    
    print(f"Connecting to database: {db_params['database']} on {db_params['host']}:{db_params['port']}")
    print(f"Using user: {db_params['user']}")
    
    try:
        # Connect to database
        conn = psycopg2.connect(**db_params)
        cursor = conn.cursor()
        
        # Get ALL student answers from all modules/years/months
        print("Syncing for: ALL modules, years, and months")
        
        cursor.execute("""
            SELECT student_index, module_code, exam_year, exam_month, answers 
            FROM student_answers
        """)
        
        student_records = cursor.fetchall()
        print(f"Found {len(student_records)} student records")
        
        synced_count = 0
        
        for student_index, mod_code, yr, mon, answers_json in student_records:
            print(f"Processing: {student_index} - {mod_code} ({yr} {mon})")
            
            # answers_json is a dict like {"Q1_a": "answer text", "Q1_b": null, ...}
            for full_question_id, answer_text in answers_json.items():
                
                # Check if grade already exists
                cursor.execute("""
                    SELECT id FROM graded_student_answers 
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
                    print(f"  Adding null grade for: {mod_code} - {full_question_id}")
                    
                    # Get max marks from the database (following the same pattern as GradingService)
                    max_marks = get_max_marks_from_db(cursor, mod_code, yr, mon, full_question_id)
                    
                    cursor.execute("""
                        INSERT INTO graded_student_answers
                        (student_index, module_code, exam_year, exam_month,
                         full_question_id, mark, max_marks, reason, graded_at, is_null_answer)
                        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW(),%s)
                    """, (
                        student_index, mod_code, yr, mon,
                        full_question_id, 0.0, max_marks, "No answer provided", True
                    ))
                    synced_count += 1
        
        # Commit changes
        conn.commit()
        
        print(f"✅ Successfully synced {synced_count} null answer grades across all modules")
        
        # Show summary by module
        cursor.execute("""
            SELECT module_code, COUNT(*) as null_count
            FROM graded_student_answers 
            WHERE is_null_answer = TRUE
            GROUP BY module_code
            ORDER BY module_code
        """)
        
        summary = cursor.fetchall()
        if summary:
            print("\n📊 Summary by module:")
            for mod_code, count in summary:
                print(f"  {mod_code}: {count} null answer grades")
        
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

def get_max_marks_from_db(cursor, module_code: str, exam_year: int, exam_month: str, full_question_id: str) -> float:
    """
    Get max marks for a question from the database following the same pattern as GradingService.
    Tries multiple sources in order of preference.
    """
    try:
        # Option 1: Get from existing graded_student_answers (most reliable)
        cursor.execute("""
            SELECT max_marks 
            FROM graded_student_answers 
            WHERE module_code = %s AND exam_year = %s AND exam_month = %s 
            AND full_question_id = %s
            AND max_marks IS NOT NULL
            LIMIT 1
        """, (module_code, exam_year, exam_month, full_question_id))
        
        result = cursor.fetchone()
        if result and result[0] is not None:
            return float(result[0])
        
        # Option 2: Try to get from questions table (if it exists)
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
        
        # Option 3: Try to get from sub_questions table (if it exists)
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
        
        # Option 4: Try pattern matching on question structure
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
                    cursor.execute("""
                        SELECT COUNT(DISTINCT full_question_id)
                        FROM student_answers sa
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

if __name__ == "__main__":
    exit(main())