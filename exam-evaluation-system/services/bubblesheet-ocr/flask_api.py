# # # # services/bubblesheet-ocr/flask_api.py
# # # """
# # # Flask API for Bubble Sheet Processing
# # # Provides endpoints for student answer extraction and answer key extraction
# # # """

# # # from flask import Flask, request, jsonify
# # # from flask_cors import CORS
# # # import os
# # # import sys
# # # from pathlib import Path
# # # import json

# # # # Import the bubble sheet detector
# # # sys.path.append(os.path.dirname(__file__))
# # # from bubble_sheet_detector import extract_student_answers
# # # from extract_answer_key import AnswerKeyExtractor

# # # app = Flask(__name__)
# # # CORS(app)  # Enable CORS for Next.js frontend

# # # # Base directories
# # # BASE_DIR = Path(__file__).parent.parent.parent
# # # DATA_DIR = BASE_DIR / "data"
# # # BUBBLE_SHEETS_DIR = DATA_DIR / "Bubble_Sheets"
# # # ANSWER_KEYS_DIR = DATA_DIR / "Answer_Keys"

# # # # Ensure directories exist
# # # BUBBLE_SHEETS_DIR.mkdir(parents=True, exist_ok=True)
# # # ANSWER_KEYS_DIR.mkdir(parents=True, exist_ok=True)


# # # @app.route('/api/health', methods=['GET'])
# # # def health_check():
# # #     """Health check endpoint"""
# # #     return jsonify({
# # #         'status': 'healthy',
# # #         'service': 'Bubble Sheet OCR API',
# # #         'version': '1.0.0'
# # #     }), 200


# # # @app.route('/api/process-bubble-sheet', methods=['POST'])
# # # def process_bubble_sheet():
# # #     """
# # #     Process uploaded bubble sheet image and extract student answers
    
# # #     Expected form data:
# # #     - file: Image file (PNG, JPG, JPEG)
# # #     - assessmentId: Assessment ID
# # #     - studentId: Student ID
# # #     - moduleId: Module ID
# # #     """
# # #     try:
# # #         # Validate file upload
# # #         if 'file' not in request.files:
# # #             return jsonify({'error': 'No file uploaded'}), 400
        
# # #         file = request.files['file']
# # #         if file.filename == '':
# # #             return jsonify({'error': 'No file selected'}), 400
        
# # #         # Get form data
# # #         assessment_id = request.form.get('assessmentId')
# # #         student_id = request.form.get('studentId')
# # #         module_id = request.form.get('moduleId')
        
# # #         if not all([assessment_id, student_id, module_id]):
# # #             return jsonify({'error': 'Missing required parameters'}), 400
        
# # #         # Create assessment directory
# # #         assessment_dir = BUBBLE_SHEETS_DIR / assessment_id
# # #         assessment_dir.mkdir(parents=True, exist_ok=True)
        
# # #         # Save the uploaded file
# # #         file_extension = Path(file.filename).suffix.lower()
# # #         if file_extension not in ['.png', '.jpg', '.jpeg']:
# # #             return jsonify({'error': 'Invalid file type. Only PNG, JPG, JPEG allowed'}), 400
        
# # #         # Generate filename with student ID
# # #         filename = f"{student_id}{file_extension}"
# # #         filepath = assessment_dir / filename
# # #         file.save(str(filepath))
        
# # #         print(f"Processing bubble sheet: {filepath}", file=sys.stderr)
        
# # #         # Process the bubble sheet
# # #         answers = extract_student_answers(
# # #             str(filepath),
# # #             fill_threshold=0.35,
# # #             expected_options=4,
# # #             debug=False
# # #         )
        
# # #         if not answers:
# # #             return jsonify({
# # #                 'error': 'No answers detected in bubble sheet',
# # #                 'details': 'Please ensure the image is clear and bubbles are properly filled'
# # #             }), 400
        
# # #         # Prepare response
# # #         response_data = {
# # #             'success': True,
# # #             'answers': answers,
# # #             'answers_count': len(answers),
# # #             'file_path': f"data/Bubble_Sheets/{assessment_id}/{filename}",
# # #             'assessment_id': assessment_id,
# # #             'student_id': student_id,
# # #             'module_id': module_id
# # #         }
        
# # #         print(f"✅ Successfully extracted {len(answers)} answers", file=sys.stderr)
# # #         return jsonify(response_data), 200
        
# # #     except Exception as e:
# # #         print(f"❌ Error processing bubble sheet: {e}", file=sys.stderr)
# # #         import traceback
# # #         traceback.print_exc(file=sys.stderr)
# # #         return jsonify({
# # #             'error': 'Failed to process bubble sheet',
# # #             'details': str(e)
# # #         }), 500


# # # @app.route('/api/extract-answer-key', methods=['POST'])
# # # def extract_answer_key():
# # #     """
# # #     Extract answer key from uploaded document (PDF, Word, or Excel)
    
# # #     Expected form data:
# # #     - file: Document file (PDF, DOCX, DOC, XLSX, XLS)
# # #     - assessmentId: Assessment ID
# # #     - moduleId: Module ID
# # #     - educatorId: Educator ID
# # #     """
# # #     try:
# # #         # Validate file upload
# # #         if 'file' not in request.files:
# # #             return jsonify({'error': 'No file uploaded'}), 400
        
# # #         file = request.files['file']
# # #         if file.filename == '':
# # #             return jsonify({'error': 'No file selected'}), 400
        
# # #         # Get form data
# # #         assessment_id = request.form.get('assessmentId')
# # #         module_id = request.form.get('moduleId')
# # #         educator_id = request.form.get('educatorId')
        
# # #         if not all([assessment_id, module_id, educator_id]):
# # #             return jsonify({'error': 'Missing required parameters'}), 400
        
# # #         # Create assessment directory
# # #         assessment_dir = ANSWER_KEYS_DIR / assessment_id
# # #         assessment_dir.mkdir(parents=True, exist_ok=True)
        
# # #         # Save the uploaded file
# # #         file_extension = Path(file.filename).suffix.lower()
# # #         allowed_extensions = ['.pdf', '.docx', '.doc', '.xlsx', '.xls']
# # #         if file_extension not in allowed_extensions:
# # #             return jsonify({
# # #                 'error': f'Invalid file type. Allowed: {", ".join(allowed_extensions)}'
# # #             }), 400
        
# # #         # Generate filename
# # #         filename = f"answer_key_{assessment_id}{file_extension}"
# # #         filepath = assessment_dir / filename
# # #         file.save(str(filepath))
        
# # #         print(f"Extracting answer key from: {filepath}", file=sys.stderr)
        
# # #         # Extract answer key
# # #         extractor = AnswerKeyExtractor()
# # #         answers = extractor.extract_answer_key(str(filepath))
        
# # #         if not answers:
# # #             return jsonify({
# # #                 'error': 'No answers found in document',
# # #                 'details': 'Please ensure the document contains answers in format like Q1: A, Q2: B, etc.'
# # #             }), 400
        
# # #         # Validate answer key
# # #         is_valid = extractor.validate_answer_key(answers)
        
# # #         # Prepare response
# # #         response_data = {
# # #             'success': True,
# # #             'answers': answers,
# # #             'answer_count': len(answers),
# # #             'file_path': f"data/Answer_Keys/{assessment_id}/{filename}",
# # #             'assessment_id': assessment_id,
# # #             'module_id': module_id,
# # #             'educator_id': educator_id,
# # #             'is_valid': is_valid
# # #         }
        
# # #         print(f"✅ Successfully extracted {len(answers)} answers from answer key", file=sys.stderr)
# # #         return jsonify(response_data), 200
        
# # #     except Exception as e:
# # #         print(f"❌ Error extracting answer key: {e}", file=sys.stderr)
# # #         import traceback
# # #         traceback.print_exc(file=sys.stderr)
# # #         return jsonify({
# # #             'error': 'Failed to extract answer key',
# # #             'details': str(e)
# # #         }), 500


# # # @app.route('/api/test-bubble-detection', methods=['POST'])
# # # def test_bubble_detection():
# # #     """
# # #     Test endpoint for bubble sheet detection
# # #     Useful for testing without database integration
# # #     """
# # #     try:
# # #         if 'file' not in request.files:
# # #             return jsonify({'error': 'No file uploaded'}), 400
        
# # #         file = request.files['file']
# # #         if file.filename == '':
# # #             return jsonify({'error': 'No file selected'}), 400
        
# # #         # Save to temp location
# # #         temp_dir = Path("/tmp/bubble_sheets")
# # #         temp_dir.mkdir(parents=True, exist_ok=True)
# # #         filepath = temp_dir / file.filename
# # #         file.save(str(filepath))
        
# # #         # Process
# # #         answers = extract_student_answers(str(filepath), debug=False)
        
# # #         # Clean up
# # #         filepath.unlink()
        
# # #         return jsonify({
# # #             'success': True,
# # #             'answers': answers,
# # #             'count': len(answers)
# # #         }), 200
        
# # #     except Exception as e:
# # #         return jsonify({
# # #             'error': 'Test failed',
# # #             'details': str(e)
# # #         }), 500


# # # @app.route('/api/test-answer-key', methods=['POST'])
# # # def test_answer_key():
# # #     """
# # #     Test endpoint for answer key extraction
# # #     Useful for testing without database integration
# # #     """
# # #     try:
# # #         if 'file' not in request.files:
# # #             return jsonify({'error': 'No file uploaded'}), 400
        
# # #         file = request.files['file']
# # #         if file.filename == '':
# # #             return jsonify({'error': 'No file selected'}), 400
        
# # #         # Save to temp location
# # #         temp_dir = Path("/tmp/answer_keys")
# # #         temp_dir.mkdir(parents=True, exist_ok=True)
# # #         filepath = temp_dir / file.filename
# # #         file.save(str(filepath))
        
# # #         # Extract
# # #         extractor = AnswerKeyExtractor()
# # #         answers = extractor.extract_answer_key(str(filepath))
        
# # #         # Clean up
# # #         filepath.unlink()
        
# # #         return jsonify({
# # #             'success': True,
# # #             'answers': answers,
# # #             'count': len(answers) if answers else 0
# # #         }), 200
        
# # #     except Exception as e:
# # #         return jsonify({
# # #             'error': 'Test failed',
# # #             'details': str(e)
# # #         }), 500


# # # if __name__ == '__main__':
# # #     print("🚀 Starting Bubble Sheet OCR API...")
# # #     print(f"📁 Bubble Sheets Directory: {BUBBLE_SHEETS_DIR}")
# # #     print(f"📁 Answer Keys Directory: {ANSWER_KEYS_DIR}")
# # #     print("🌐 API running on http://localhost:7000")
    
# # #     app.run(host='0.0.0.0', port=7000, debug=True)

# # # services/bubblesheet-ocr/flask_api.py
# # """
# # Flask API for Bubble Sheet Processing - IMPROVED VERSION
# # Provides endpoints for student answer extraction and answer key extraction
# # """

# # from flask import Flask, request, jsonify
# # from flask_cors import CORS
# # import os
# # import sys
# # from pathlib import Path
# # import json
# # import traceback

# # # Import the bubble sheet detector
# # sys.path.append(os.path.dirname(__file__))
# # from bubble_sheet_detector import extract_student_answers
# # from extract_answer_key import AnswerKeyExtractor

# # app = Flask(__name__)
# # CORS(app)

# # # Base directories
# # BASE_DIR = Path(__file__).parent.parent.parent
# # DATA_DIR = BASE_DIR / "data"
# # BUBBLE_SHEETS_DIR = DATA_DIR / "Bubble_Sheets"
# # ANSWER_KEYS_DIR = DATA_DIR / "Answer_Keys"

# # # Ensure directories exist
# # BUBBLE_SHEETS_DIR.mkdir(parents=True, exist_ok=True)
# # ANSWER_KEYS_DIR.mkdir(parents=True, exist_ok=True)


# # @app.route('/api/health', methods=['GET'])
# # def health_check():
# #     """Health check endpoint"""
# #     return jsonify({
# #         'status': 'healthy',
# #         'service': 'Bubble Sheet OCR API',
# #         'version': '1.0.0'
# #     }), 200


# # @app.route('/api/process-bubble-sheet', methods=['POST'])
# # def process_bubble_sheet():
# #     """
# #     Process uploaded bubble sheet image and extract student answers
    
# #     Expected form data:
# #     - file: Image file (PNG, JPG, JPEG)
# #     - assessmentId: Assessment ID
# #     - studentId: Student ID
# #     - moduleId: Module ID
# #     """
# #     try:
# #         print("\n" + "="*60)
# #         print("📝 PROCESSING BUBBLE SHEET REQUEST")
# #         print("="*60)
        
# #         # Validate file upload
# #         if 'file' not in request.files:
# #             print("❌ No file in request")
# #             return jsonify({'error': 'No file uploaded'}), 400
        
# #         file = request.files['file']
# #         if file.filename == '':
# #             print("❌ Empty filename")
# #             return jsonify({'error': 'No file selected'}), 400
        
# #         # Get form data
# #         assessment_id = request.form.get('assessmentId')
# #         student_id = request.form.get('studentId')
# #         module_id = request.form.get('moduleId')
        
# #         print(f"Assessment ID: {assessment_id}")
# #         print(f"Student ID: {student_id}")
# #         print(f"Module ID: {module_id}")
# #         print(f"File: {file.filename}")
        
# #         if not all([assessment_id, student_id, module_id]):
# #             print("❌ Missing required parameters")
# #             return jsonify({'error': 'Missing required parameters'}), 400
        
# #         # Create assessment directory
# #         assessment_dir = BUBBLE_SHEETS_DIR / assessment_id
# #         assessment_dir.mkdir(parents=True, exist_ok=True)
        
# #         # Save the uploaded file
# #         file_extension = Path(file.filename).suffix.lower()
# #         if file_extension not in ['.png', '.jpg', '.jpeg']:
# #             print(f"❌ Invalid file type: {file_extension}")
# #             return jsonify({'error': 'Invalid file type. Only PNG, JPG, JPEG allowed'}), 400
        
# #         # Generate filename with student ID
# #         filename = f"{student_id}{file_extension}"
# #         filepath = assessment_dir / filename
        
# #         print(f"💾 Saving file to: {filepath}")
# #         file.save(str(filepath))
        
# #         # Get file size
# #         file_size = filepath.stat().st_size
# #         print(f"📏 File size: {file_size:,} bytes ({file_size / (1024*1024):.2f} MB)")
        
# #         # Process the bubble sheet with error handling
# #         print(f"🔍 Processing bubble sheet...")
        
# #         try:
# #             answers = extract_student_answers(
# #                 str(filepath),
# #                 fill_threshold=0.35,
# #                 expected_options=4,
# #                 debug=False
# #             )
# #         except Exception as detection_error:
# #             print(f"❌ Bubble detection error: {detection_error}")
# #             print(traceback.format_exc())
            
# #             # Return specific error message
# #             return jsonify({
# #                 'error': 'Failed to detect bubbles in image',
# #                 'details': str(detection_error),
# #                 'suggestions': [
# #                     'Ensure the image is clear and well-lit',
# #                     'Make sure bubbles are properly filled',
# #                     'Try a higher quality scan or photo',
# #                     'Check that the image is not rotated'
# #                 ]
# #             }), 400
        
# #         if not answers:
# #             print("⚠️ No answers detected")
# #             return jsonify({
# #                 'error': 'No answers detected in bubble sheet',
# #                 'details': 'Please ensure the image is clear and bubbles are properly filled',
# #                 'suggestions': [
# #                     'Use a well-lit, clear photo',
# #                     'Ensure bubbles are filled darkly',
# #                     'Make sure the entire sheet is visible',
# #                     'Avoid shadows and glare'
# #                 ]
# #             }), 400
        
# #         # Prepare response
# #         response_data = {
# #             'success': True,
# #             'answers': answers,
# #             'answers_count': len(answers),
# #             'file_path': f"data/Bubble_Sheets/{assessment_id}/{filename}",
# #             'assessment_id': assessment_id,
# #             'student_id': student_id,
# #             'module_id': module_id
# #         }
        
# #         print(f"✅ Successfully extracted {len(answers)} answers")
# #         print("="*60 + "\n")
        
# #         return jsonify(response_data), 200
        
# #     except Exception as e:
# #         print(f"\n❌ ERROR PROCESSING BUBBLE SHEET")
# #         print("="*60)
# #         print(f"Error: {e}")
# #         print(traceback.format_exc())
# #         print("="*60 + "\n")
        
# #         return jsonify({
# #             'error': 'Failed to process bubble sheet',
# #             'details': str(e),
# #             'type': type(e).__name__
# #         }), 500


# # @app.route('/api/extract-answer-key', methods=['POST'])
# # def extract_answer_key():
# #     """
# #     Extract answer key from uploaded document (PDF, Word, or Excel)
    
# #     Expected form data:
# #     - file: Document file (PDF, DOCX, DOC, XLSX, XLS)
# #     - assessmentId: Assessment ID
# #     - moduleId: Module ID
# #     - educatorId: Educator ID
# #     """
# #     try:
# #         print("\n" + "="*60)
# #         print("🔑 EXTRACTING ANSWER KEY")
# #         print("="*60)
        
# #         # Validate file upload
# #         if 'file' not in request.files:
# #             return jsonify({'error': 'No file uploaded'}), 400
        
# #         file = request.files['file']
# #         if file.filename == '':
# #             return jsonify({'error': 'No file selected'}), 400
        
# #         # Get form data
# #         assessment_id = request.form.get('assessmentId')
# #         module_id = request.form.get('moduleId')
# #         educator_id = request.form.get('educatorId')
        
# #         print(f"Assessment ID: {assessment_id}")
# #         print(f"Module ID: {module_id}")
# #         print(f"Educator ID: {educator_id}")
# #         print(f"File: {file.filename}")
        
# #         if not all([assessment_id, module_id, educator_id]):
# #             return jsonify({'error': 'Missing required parameters'}), 400
        
# #         # Create assessment directory
# #         assessment_dir = ANSWER_KEYS_DIR / assessment_id
# #         assessment_dir.mkdir(parents=True, exist_ok=True)
        
# #         # Save the uploaded file
# #         file_extension = Path(file.filename).suffix.lower()
# #         allowed_extensions = ['.pdf', '.docx', '.doc', '.xlsx', '.xls']
# #         if file_extension not in allowed_extensions:
# #             return jsonify({
# #                 'error': f'Invalid file type. Allowed: {", ".join(allowed_extensions)}'
# #             }), 400
        
# #         # Generate filename
# #         filename = f"answer_key_{assessment_id}{file_extension}"
# #         filepath = assessment_dir / filename
# #         file.save(str(filepath))
        
# #         print(f"💾 File saved to: {filepath}")
        
# #         # Extract answer key
# #         print(f"🔍 Extracting answers...")
# #         extractor = AnswerKeyExtractor()
        
# #         try:
# #             answers = extractor.extract_answer_key(str(filepath))
# #         except Exception as extraction_error:
# #             print(f"❌ Extraction error: {extraction_error}")
# #             print(traceback.format_exc())
            
# #             return jsonify({
# #                 'error': 'Failed to extract answer key',
# #                 'details': str(extraction_error)
# #             }), 400
        
# #         if not answers:
# #             return jsonify({
# #                 'error': 'No answers found in document',
# #                 'details': 'Please ensure the document contains answers in format like Q1: A, Q2: B, etc.'
# #             }), 400
        
# #         # Validate answer key
# #         is_valid = extractor.validate_answer_key(answers)
        
# #         # Prepare response
# #         response_data = {
# #             'success': True,
# #             'answers': answers,
# #             'answer_count': len(answers),
# #             'file_path': f"data/Answer_Keys/{assessment_id}/{filename}",
# #             'assessment_id': assessment_id,
# #             'module_id': module_id,
# #             'educator_id': educator_id,
# #             'is_valid': is_valid
# #         }
        
# #         print(f"✅ Successfully extracted {len(answers)} answers")
# #         print("="*60 + "\n")
        
# #         return jsonify(response_data), 200
        
# #     except Exception as e:
# #         print(f"\n❌ ERROR EXTRACTING ANSWER KEY")
# #         print("="*60)
# #         print(f"Error: {e}")
# #         print(traceback.format_exc())
# #         print("="*60 + "\n")
        
# #         return jsonify({
# #             'error': 'Failed to extract answer key',
# #             'details': str(e)
# #         }), 500


# # @app.route('/api/test-bubble-detection', methods=['POST'])
# # def test_bubble_detection():
# #     """
# #     Test endpoint for bubble sheet detection
# #     """
# #     try:
# #         if 'file' not in request.files:
# #             return jsonify({'error': 'No file uploaded'}), 400
        
# #         file = request.files['file']
# #         if file.filename == '':
# #             return jsonify({'error': 'No file selected'}), 400
        
# #         # Save to temp location
# #         temp_dir = Path("/tmp/bubble_sheets")
# #         temp_dir.mkdir(parents=True, exist_ok=True)
# #         filepath = temp_dir / file.filename
# #         file.save(str(filepath))
        
# #         # Process
# #         answers = extract_student_answers(str(filepath), debug=False)
        
# #         # Clean up
# #         filepath.unlink()
        
# #         return jsonify({
# #             'success': True,
# #             'answers': answers,
# #             'count': len(answers)
# #         }), 200
        
# #     except Exception as e:
# #         return jsonify({
# #             'error': 'Test failed',
# #             'details': str(e)
# #         }), 500


# # if __name__ == '__main__':
# #     print("🚀 Starting Bubble Sheet OCR API...")
# #     print(f"📁 Bubble Sheets Directory: {BUBBLE_SHEETS_DIR}")
# #     print(f"📁 Answer Keys Directory: {ANSWER_KEYS_DIR}")
# #     print("🌐 API running on http://localhost:7000")
# #     print("⏱️  Timeout: 60 seconds for image processing")
# #     print("-" * 60)
    
# #     app.run(host='0.0.0.0', port=7000, debug=True, threaded=True)

# # services/bubblesheet-ocr/flask_api.py
# """
# Flask API for Bubble Sheet Processing - IMPROVED WITH DEBUGGING
# """

# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import os
# import sys
# from pathlib import Path
# import json
# import traceback
# import time

# # Import the bubble sheet detector
# sys.path.append(os.path.dirname(__file__))
# from bubble_sheet_detector import extract_student_answers
# from extract_answer_key import AnswerKeyExtractor

# app = Flask(__name__)
# CORS(app)

# # Base directories
# BASE_DIR = Path(__file__).parent.parent.parent
# DATA_DIR = BASE_DIR / "data"
# BUBBLE_SHEETS_DIR = DATA_DIR / "Bubble_Sheets"
# ANSWER_KEYS_DIR = DATA_DIR / "Answer_Keys"

# # Ensure directories exist
# BUBBLE_SHEETS_DIR.mkdir(parents=True, exist_ok=True)
# ANSWER_KEYS_DIR.mkdir(parents=True, exist_ok=True)


# @app.route('/api/health', methods=['GET'])
# def health_check():
#     """Health check endpoint"""
#     return jsonify({
#         'status': 'healthy',
#         'service': 'Bubble Sheet OCR API',
#         'version': '1.0.0'
#     }), 200


# @app.route('/api/process-bubble-sheet', methods=['POST'])
# def process_bubble_sheet():
#     """
#     Process uploaded bubble sheet image and extract student answers
#     """
#     start_time = time.time()
    
#     try:
#         print("\n" + "="*80)
#         print("📝 FLASK: PROCESSING BUBBLE SHEET REQUEST")
#         print("="*80)
#         print(f"⏰ Started at: {time.strftime('%H:%M:%S')}")
        
#         # Step 1: Validate file upload
#         print("\n1️⃣ Validating file upload...")
#         if 'file' not in request.files:
#             print("   ❌ No file in request.files")
#             print("   Available keys:", list(request.files.keys()))
#             print("   Form data keys:", list(request.form.keys()))
#             return jsonify({'error': 'No file uploaded'}), 400
        
#         file = request.files['file']
#         if file.filename == '':
#             print("   ❌ Empty filename")
#             return jsonify({'error': 'No file selected'}), 400
        
#         print(f"   ✅ File received: {file.filename}")
#         print(f"      Content type: {file.content_type}")
        
#         # Step 2: Get form data
#         print("\n2️⃣ Extracting form data...")
#         assessment_id = request.form.get('assessmentId')
#         student_id = request.form.get('studentId')
#         module_id = request.form.get('moduleId')
        
#         print(f"   Assessment ID: {assessment_id}")
#         print(f"   Student ID: {student_id}")
#         print(f"   Module ID: {module_id}")
        
#         if not all([assessment_id, student_id, module_id]):
#             missing = []
#             if not assessment_id: missing.append('assessmentId')
#             if not student_id: missing.append('studentId')
#             if not module_id: missing.append('moduleId')
#             print(f"   ❌ Missing parameters: {', '.join(missing)}")
#             return jsonify({'error': f'Missing required parameters: {", ".join(missing)}'}), 400
        
#         print("   ✅ All parameters present")
        
#         # Step 3: Create directory and save file
#         print("\n3️⃣ Saving file...")
#         assessment_dir = BUBBLE_SHEETS_DIR / assessment_id
#         assessment_dir.mkdir(parents=True, exist_ok=True)
#         print(f"   Directory: {assessment_dir}")
        
#         file_extension = Path(file.filename).suffix.lower()
#         if file_extension not in ['.png', '.jpg', '.jpeg']:
#             print(f"   ❌ Invalid extension: {file_extension}")
#             return jsonify({
#                 'error': 'Invalid file type',
#                 'details': f'Only PNG, JPG, JPEG allowed. Got: {file_extension}'
#             }), 400
        
#         filename = f"{student_id}{file_extension}"
#         filepath = assessment_dir / filename
        
#         print(f"   Saving to: {filepath}")
#         file.save(str(filepath))
        
#         file_size = filepath.stat().st_size
#         print(f"   ✅ File saved: {file_size:,} bytes ({file_size / (1024*1024):.2f} MB)")
        
#         # Step 4: Process the bubble sheet
#         print("\n4️⃣ Processing bubble sheet with OpenCV...")
#         print("   This may take 10-30 seconds for large images...")
        
#         process_start = time.time()
        
#         try:
#             answers = extract_student_answers(
#                 str(filepath),
#                 fill_threshold=0.35,
#                 expected_options=4,
#                 debug=False  # Set to True to see debug images
#             )
            
#             process_time = time.time() - process_start
#             print(f"   ⏱️ Processing completed in {process_time:.2f}s")
            
#         except Exception as detection_error:
#             process_time = time.time() - process_start
#             print(f"\n   ❌ BUBBLE DETECTION ERROR (after {process_time:.2f}s)")
#             print(f"   Error type: {type(detection_error).__name__}")
#             print(f"   Error message: {str(detection_error)}")
#             print("\n   Stack trace:")
#             traceback.print_exc()
            
#             return jsonify({
#                 'error': 'Failed to detect bubbles in image',
#                 'details': str(detection_error),
#                 'type': type(detection_error).__name__,
#                 'processing_time': f"{process_time:.2f}s",
#                 'suggestions': [
#                     'Ensure the image is clear and well-lit',
#                     'Make sure bubbles are properly filled',
#                     'Try a higher quality scan or photo',
#                     'Check that the image is not rotated or skewed',
#                     'Verify the image shows the complete bubble sheet'
#                 ]
#             }), 400
        
#         # Step 5: Validate results
#         print("\n5️⃣ Validating results...")
#         if not answers:
#             print("   ⚠️ No answers detected")
#             return jsonify({
#                 'error': 'No answers detected in bubble sheet',
#                 'details': 'The image processing completed but no filled bubbles were found',
#                 'suggestions': [
#                     'Use a well-lit, clear photo',
#                     'Ensure bubbles are filled darkly (not lightly marked)',
#                     'Make sure the entire sheet is visible',
#                     'Avoid shadows and glare',
#                     'Try scanning at higher resolution'
#                 ]
#             }), 400
        
#         print(f"   ✅ Detected {len(answers)} answers")
#         print(f"   Sample: {answers[:5]}...")  # Show first 5
        
#         # Step 6: Prepare response
#         response_data = {
#             'success': True,
#             'answers': answers,
#             'answers_count': len(answers),
#             'file_path': f"data/Bubble_Sheets/{assessment_id}/{filename}",
#             'assessment_id': assessment_id,
#             'student_id': student_id,
#             'module_id': module_id,
#             'processing_time': f"{time.time() - start_time:.2f}s"
#         }
        
#         total_time = time.time() - start_time
#         print(f"\n✅ SUCCESS!")
#         print(f"   Total time: {total_time:.2f}s")
#         print(f"   Answers: {len(answers)}")
#         print("="*80 + "\n")
        
#         return jsonify(response_data), 200
        
#     except Exception as e:
#         total_time = time.time() - start_time
        
#         print(f"\n❌ UNEXPECTED ERROR (after {total_time:.2f}s)")
#         print("="*80)
#         print(f"Error type: {type(e).__name__}")
#         print(f"Error message: {str(e)}")
#         print("\nFull traceback:")
#         traceback.print_exc()
#         print("="*80 + "\n")
        
#         return jsonify({
#             'error': 'Failed to process bubble sheet',
#             'details': str(e),
#             'type': type(e).__name__,
#             'processing_time': f"{total_time:.2f}s"
#         }), 500


# @app.route('/api/extract-answer-key', methods=['POST'])
# def extract_answer_key():
#     """Extract answer key from uploaded document"""
#     start_time = time.time()
    
#     try:
#         print("\n" + "="*80)
#         print("🔑 FLASK: EXTRACTING ANSWER KEY")
#         print("="*80)
        
#         # Validate file upload
#         if 'file' not in request.files:
#             return jsonify({'error': 'No file uploaded'}), 400
        
#         file = request.files['file']
#         if file.filename == '':
#             return jsonify({'error': 'No file selected'}), 400
        
#         print(f"File: {file.filename}")
        
#         # Get form data
#         assessment_id = request.form.get('assessmentId')
#         module_id = request.form.get('moduleId')
#         educator_id = request.form.get('educatorId')
        
#         print(f"Assessment ID: {assessment_id}")
#         print(f"Module ID: {module_id}")
#         print(f"Educator ID: {educator_id}")
        
#         if not all([assessment_id, module_id, educator_id]):
#             return jsonify({'error': 'Missing required parameters'}), 400
        
#         # Create directory
#         assessment_dir = ANSWER_KEYS_DIR / assessment_id
#         assessment_dir.mkdir(parents=True, exist_ok=True)
        
#         # Save file
#         file_extension = Path(file.filename).suffix.lower()
#         allowed_extensions = ['.pdf', '.docx', '.doc', '.xlsx', '.xls']
#         if file_extension not in allowed_extensions:
#             return jsonify({
#                 'error': f'Invalid file type. Allowed: {", ".join(allowed_extensions)}'
#             }), 400
        
#         filename = f"answer_key_{assessment_id}{file_extension}"
#         filepath = assessment_dir / filename
#         file.save(str(filepath))
        
#         print(f"Saved to: {filepath}")
        
#         # Extract answer key
#         print("Extracting answers...")
#         extractor = AnswerKeyExtractor()
        
#         try:
#             answers = extractor.extract_answer_key(str(filepath))
#         except Exception as extraction_error:
#             print(f"Extraction error: {extraction_error}")
#             traceback.print_exc()
            
#             return jsonify({
#                 'error': 'Failed to extract answer key',
#                 'details': str(extraction_error)
#             }), 400
        
#         if not answers:
#             return jsonify({
#                 'error': 'No answers found in document',
#                 'details': 'Format should be: Q1: A, Q2: B, etc.'
#             }), 400
        
#         # Validate
#         is_valid = extractor.validate_answer_key(answers)
        
#         response_data = {
#             'success': True,
#             'answers': answers,
#             'answer_count': len(answers),
#             'file_path': f"data/Answer_Keys/{assessment_id}/{filename}",
#             'assessment_id': assessment_id,
#             'module_id': module_id,
#             'educator_id': educator_id,
#             'is_valid': is_valid,
#             'processing_time': f"{time.time() - start_time:.2f}s"
#         }
        
#         print(f"✅ Extracted {len(answers)} answers")
#         print("="*80 + "\n")
        
#         return jsonify(response_data), 200
        
#     except Exception as e:
#         print(f"❌ Error: {e}")
#         traceback.print_exc()
#         print("="*80 + "\n")
        
#         return jsonify({
#             'error': 'Failed to extract answer key',
#             'details': str(e)
#         }), 500


# @app.route('/api/test-bubble-detection', methods=['POST'])
# def test_bubble_detection():
#     """Test endpoint for bubble detection without database"""
#     try:
#         if 'file' not in request.files:
#             return jsonify({'error': 'No file uploaded'}), 400
        
#         file = request.files['file']
#         if file.filename == '':
#             return jsonify({'error': 'No file selected'}), 400
        
#         # Save to temp
#         temp_dir = Path("/tmp/bubble_sheets")
#         temp_dir.mkdir(parents=True, exist_ok=True)
#         filepath = temp_dir / file.filename
#         file.save(str(filepath))
        
#         print(f"Testing with: {filepath}")
        
#         # Process
#         answers = extract_student_answers(str(filepath), debug=True)
        
#         # Clean up
#         filepath.unlink()
        
#         return jsonify({
#             'success': True,
#             'answers': answers,
#             'count': len(answers)
#         }), 200
        
#     except Exception as e:
#         print(f"Test failed: {e}")
#         traceback.print_exc()
#         return jsonify({
#             'error': 'Test failed',
#             'details': str(e)
#         }), 500


# if __name__ == '__main__':
#     print("\n" + "="*80)
#     print("🚀 STARTING BUBBLE SHEET OCR API")
#     print("="*80)
#     print(f"📁 Bubble Sheets Dir: {BUBBLE_SHEETS_DIR}")
#     print(f"📁 Answer Keys Dir:   {ANSWER_KEYS_DIR}")
#     print(f"🌐 Server:            http://localhost:7000")
#     print(f"⏱️  Request timeout:   90 seconds")
#     print("="*80 + "\n")
    
#     # Run with threading enabled for better performance
#     app.run(
#         host='0.0.0.0',
#         port=7000,
#         debug=True,
#         threaded=True,
#         use_reloader=True
#     )

# services/bubblesheet-ocr/flask_api.py
"""
Flask API for Bubble Sheet Processing - IMPROVED WITH DEBUGGING
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
from pathlib import Path
import json
import traceback
import time

# Import the bubble sheet detector
sys.path.append(os.path.dirname(__file__))
from bubble_sheet_detector import extract_student_answers
from extract_answer_key import AnswerKeyExtractor

app = Flask(__name__)
CORS(app)

# Base directories
BASE_DIR = Path(__file__).parent.parent.parent
DATA_DIR = BASE_DIR / "data"
BUBBLE_SHEETS_DIR = DATA_DIR / "Bubble_Sheets"
ANSWER_KEYS_DIR = DATA_DIR / "Answer_Keys"

# Ensure directories exist
BUBBLE_SHEETS_DIR.mkdir(parents=True, exist_ok=True)
ANSWER_KEYS_DIR.mkdir(parents=True, exist_ok=True)


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Bubble Sheet OCR API',
        'version': '1.0.0'
    }), 200


@app.route('/api/process-bubble-sheet', methods=['POST'])
def process_bubble_sheet():
    """
    Process uploaded bubble sheet image and extract student answers
    """
    start_time = time.time()
    
    try:
        print("\n" + "="*80)
        print("📝 FLASK: PROCESSING BUBBLE SHEET REQUEST")
        print("="*80)
        print(f"⏰ Started at: {time.strftime('%H:%M:%S')}")
        
        # Step 1: Validate file upload
        print("\n1️⃣ Validating file upload...")
        if 'file' not in request.files:
            print("   ❌ No file in request.files")
            print("   Available keys:", list(request.files.keys()))
            print("   Form data keys:", list(request.form.keys()))
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            print("   ❌ Empty filename")
            return jsonify({'error': 'No file selected'}), 400
        
        print(f"   ✅ File received: {file.filename}")
        print(f"      Content type: {file.content_type}")
        
        # Step 2: Get form data
        print("\n2️⃣ Extracting form data...")
        assessment_id = request.form.get('assessmentId')
        student_id = request.form.get('studentId')
        module_id = request.form.get('moduleId')
        
        print(f"   Assessment ID: {assessment_id}")
        print(f"   Student ID: {student_id}")
        print(f"   Module ID: {module_id}")
        
        if not all([assessment_id, student_id, module_id]):
            missing = []
            if not assessment_id: missing.append('assessmentId')
            if not student_id: missing.append('studentId')
            if not module_id: missing.append('moduleId')
            print(f"   ❌ Missing parameters: {', '.join(missing)}")
            return jsonify({'error': f'Missing required parameters: {", ".join(missing)}'}), 400
        
        print("   ✅ All parameters present")
        
        # Step 3: Create directory and save file
        print("\n3️⃣ Saving file...")
        assessment_dir = BUBBLE_SHEETS_DIR / assessment_id
        assessment_dir.mkdir(parents=True, exist_ok=True)
        print(f"   Directory: {assessment_dir}")
        
        file_extension = Path(file.filename).suffix.lower()
        if file_extension not in ['.png', '.jpg', '.jpeg']:
            print(f"   ❌ Invalid extension: {file_extension}")
            return jsonify({
                'error': 'Invalid file type',
                'details': f'Only PNG, JPG, JPEG allowed. Got: {file_extension}'
            }), 400
        
        filename = f"{student_id}{file_extension}"
        filepath = assessment_dir / filename
        
        print(f"   Saving to: {filepath}")
        file.save(str(filepath))
        
        file_size = filepath.stat().st_size
        print(f"   ✅ File saved: {file_size:,} bytes ({file_size / (1024*1024):.2f} MB)")
        
        # Step 4: Process the bubble sheet
        print("\n4️⃣ Processing bubble sheet with OpenCV...")
        print("   This may take 10-30 seconds for large images...")
        
        process_start = time.time()
        
        try:
            answers = extract_student_answers(
                str(filepath),
                fill_threshold=0.35,
                expected_options=4,
                debug=False  # Set to True to see debug images
            )
            
            process_time = time.time() - process_start
            print(f"   ⏱️ Processing completed in {process_time:.2f}s")
            
        except Exception as detection_error:
            process_time = time.time() - process_start
            print(f"\n   ❌ BUBBLE DETECTION ERROR (after {process_time:.2f}s)")
            print(f"   Error type: {type(detection_error).__name__}")
            print(f"   Error message: {str(detection_error)}")
            print("\n   Stack trace:")
            traceback.print_exc()
            
            return jsonify({
                'error': 'Failed to detect bubbles in image',
                'details': str(detection_error),
                'type': type(detection_error).__name__,
                'processing_time': f"{process_time:.2f}s",
                'suggestions': [
                    'Ensure the image is clear and well-lit',
                    'Make sure bubbles are properly filled',
                    'Try a higher quality scan or photo',
                    'Check that the image is not rotated or skewed',
                    'Verify the image shows the complete bubble sheet'
                ]
            }), 400
        
        # Step 5: Validate and deduplicate results
        print("\n5️⃣ Validating and deduplicating results...")
        if not answers:
            print("   ⚠️ No answers detected")
            return jsonify({
                'error': 'No answers detected in bubble sheet',
                'details': 'The image processing completed but no filled bubbles were found',
                'suggestions': [
                    'Use a well-lit, clear photo',
                    'Ensure bubbles are filled darkly (not lightly marked)',
                    'Make sure the entire sheet is visible',
                    'Avoid shadows and glare',
                    'Try scanning at higher resolution'
                ]
            }), 400
        
        print(f"   Initial answers: {len(answers)}")
        
        # Deduplicate answers - keep last occurrence (usually more accurate)
        answer_dict = {}
        duplicates = []
        
        for answer in answers:
            q_num = answer['question_number']
            if q_num in answer_dict:
                duplicates.append(q_num)
                print(f"   ⚠️ Duplicate Q{q_num}: {answer_dict[q_num]} -> {answer['selected_option']}")
            answer_dict[q_num] = answer['selected_option']
        
        # Rebuild unique answers list
        unique_answers = [
            {'question_number': q_num, 'selected_option': opt}
            for q_num, opt in sorted(answer_dict.items())
        ]
        
        if duplicates:
            print(f"   ⚠️ Removed {len(duplicates)} duplicates: {duplicates}")
        
        print(f"   ✅ Final unique answers: {len(unique_answers)}")
        print(f"   Sample: {unique_answers[:5]}...")  # Show first 5
        
        # Step 6: Prepare response
        response_data = {
            'success': True,
            'answers': unique_answers,
            'answers_count': len(unique_answers),
            'original_count': len(answers),
            'duplicates_removed': len(answers) - len(unique_answers),
            'file_path': f"data/Bubble_Sheets/{assessment_id}/{filename}",
            'assessment_id': assessment_id,
            'student_id': student_id,
            'module_id': module_id,
            'processing_time': f"{time.time() - start_time:.2f}s"
        }
        
        total_time = time.time() - start_time
        print(f"\n✅ SUCCESS!")
        print(f"   Total time: {total_time:.2f}s")
        print(f"   Unique answers: {len(unique_answers)}")
        if len(answers) != len(unique_answers):
            print(f"   (Removed {len(answers) - len(unique_answers)} duplicates)")
        print("="*80 + "\n")
        
        return jsonify(response_data), 200
        
    except Exception as e:
        total_time = time.time() - start_time
        
        print(f"\n❌ UNEXPECTED ERROR (after {total_time:.2f}s)")
        print("="*80)
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print("\nFull traceback:")
        traceback.print_exc()
        print("="*80 + "\n")
        
        return jsonify({
            'error': 'Failed to process bubble sheet',
            'details': str(e),
            'type': type(e).__name__,
            'processing_time': f"{total_time:.2f}s"
        }), 500


@app.route('/api/extract-answer-key', methods=['POST'])
def extract_answer_key():
    """Extract answer key from uploaded document"""
    start_time = time.time()
    
    try:
        print("\n" + "="*80)
        print("🔑 FLASK: EXTRACTING ANSWER KEY")
        print("="*80)
        
        # Validate file upload
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        print(f"File: {file.filename}")
        
        # Get form data
        assessment_id = request.form.get('assessmentId')
        module_id = request.form.get('moduleId')
        educator_id = request.form.get('educatorId')
        
        print(f"Assessment ID: {assessment_id}")
        print(f"Module ID: {module_id}")
        print(f"Educator ID: {educator_id}")
        
        if not all([assessment_id, module_id, educator_id]):
            return jsonify({'error': 'Missing required parameters'}), 400
        
        # Create directory
        assessment_dir = ANSWER_KEYS_DIR / assessment_id
        assessment_dir.mkdir(parents=True, exist_ok=True)
        
        # Save file
        file_extension = Path(file.filename).suffix.lower()
        allowed_extensions = ['.pdf', '.docx', '.doc', '.xlsx', '.xls']
        if file_extension not in allowed_extensions:
            return jsonify({
                'error': f'Invalid file type. Allowed: {", ".join(allowed_extensions)}'
            }), 400
        
        filename = f"answer_key_{assessment_id}{file_extension}"
        filepath = assessment_dir / filename
        file.save(str(filepath))
        
        print(f"Saved to: {filepath}")
        
        # Extract answer key
        print("Extracting answers...")
        extractor = AnswerKeyExtractor()
        
        try:
            answers = extractor.extract_answer_key(str(filepath))
        except Exception as extraction_error:
            print(f"Extraction error: {extraction_error}")
            traceback.print_exc()
            
            return jsonify({
                'error': 'Failed to extract answer key',
                'details': str(extraction_error)
            }), 400
        
        if not answers:
            return jsonify({
                'error': 'No answers found in document',
                'details': 'Format should be: Q1: A, Q2: B, etc.'
            }), 400
        
        # Validate
        is_valid = extractor.validate_answer_key(answers)
        
        response_data = {
            'success': True,
            'answers': answers,
            'answer_count': len(answers),
            'file_path': f"data/Answer_Keys/{assessment_id}/{filename}",
            'assessment_id': assessment_id,
            'module_id': module_id,
            'educator_id': educator_id,
            'is_valid': is_valid,
            'processing_time': f"{time.time() - start_time:.2f}s"
        }
        
        print(f"✅ Extracted {len(answers)} answers")
        print("="*80 + "\n")
        
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"❌ Error: {e}")
        traceback.print_exc()
        print("="*80 + "\n")
        
        return jsonify({
            'error': 'Failed to extract answer key',
            'details': str(e)
        }), 500


@app.route('/api/test-bubble-detection', methods=['POST'])
def test_bubble_detection():
    """Test endpoint for bubble detection without database"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save to temp
        temp_dir = Path("/tmp/bubble_sheets")
        temp_dir.mkdir(parents=True, exist_ok=True)
        filepath = temp_dir / file.filename
        file.save(str(filepath))
        
        print(f"Testing with: {filepath}")
        
        # Process
        answers = extract_student_answers(str(filepath), debug=True)
        
        # Clean up
        filepath.unlink()
        
        return jsonify({
            'success': True,
            'answers': answers,
            'count': len(answers)
        }), 200
        
    except Exception as e:
        print(f"Test failed: {e}")
        traceback.print_exc()
        return jsonify({
            'error': 'Test failed',
            'details': str(e)
        }), 500


if __name__ == '__main__':
    print("\n" + "="*80)
    print("🚀 STARTING BUBBLE SHEET OCR API")
    print("="*80)
    print(f"📁 Bubble Sheets Dir: {BUBBLE_SHEETS_DIR}")
    print(f"📁 Answer Keys Dir:   {ANSWER_KEYS_DIR}")
    print(f"🌐 Server:            http://localhost:7000")
    print(f"⏱️  Request timeout:   90 seconds")
    print("="*80 + "\n")
    
    # Run with threading enabled for better performance
    app.run(
        host='0.0.0.0',
        port=7000,
        debug=True,
        threaded=True,
        use_reloader=True
    )