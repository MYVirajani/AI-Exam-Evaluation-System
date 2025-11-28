# # # # """
# # # # Simple Flask API Server for AI Exam Evaluation System
# # # # Provides direct REST endpoints for each evaluation step without task tracking.
# # # # """

# # # # from flask import Flask, request, jsonify
# # # # from flask_cors import CORS
# # # # import logging
# # # # import os
# # # # import sys

# # # # # Add project root to path for imports
# # # # sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# # # # from src.scripts.embed_lecture_materials import main as embed_lecture_materials_main
# # # # from src.scripts.run_extract_and_save import main as extract_and_save_main  
# # # # from src.scripts.embed_from_db import main as embed_from_db_main
# # # # from src.scripts.embed_model_answers import main as embed_model_answers_main
# # # # from src.scripts.mark_all_papers import main as mark_all_papers_main

# # # # app = Flask(__name__)
# # # # CORS(app)

# # # # # Configure logging
# # # # logging.basicConfig(level=logging.INFO)
# # # # logger = logging.getLogger(__name__)


# # # # def execute_script(script_func, args):
# # # #     """Execute a script with given arguments."""
# # # #     try:
# # # #         # Override sys.argv for the script
# # # #         original_argv = sys.argv.copy()
# # # #         sys.argv = args
        
# # # #         # Run the script
# # # #         result = script_func()
        
# # # #         # Restore original argv
# # # #         sys.argv = original_argv
        
# # # #         return {'success': True, 'message': 'Script executed successfully'}
        
# # # #     except Exception as e:
# # # #         logger.error(f"Script execution failed: {str(e)}")
# # # #         # Restore original argv even on error
# # # #         sys.argv = original_argv
# # # #         return {'success': False, 'error': str(e)}


# # # # @app.route('/api/health', methods=['GET'])
# # # # def health_check():
# # # #     """Health check endpoint."""
# # # #     return jsonify({'status': 'healthy'})


# # # # @app.route('/api/embed-lecture-materials', methods=['POST'])
# # # # def embed_lecture_materials():
# # # #     """Embed lecture materials from database."""
# # # #     try:
# # # #         data = request.get_json() or {}
# # # #         provider = data.get('provider', 'OpenAI')
# # # #         model = data.get('model', 'gpt-4o')
# # # #         embedder = data.get('embedder')
# # # #         module_code = data.get('module_code')
        
# # # #         # Set default embedders based on provider
# # # #         if not embedder:
# # # #             embedder = 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001'
        
# # # #         # Prepare arguments for the script
# # # #         args = ['embed_lecture_materials.py', '--provider', provider, '--model', model, '--embedder', embedder]
# # # #         if module_code:
# # # #             args.extend(['--module', module_code])
        
# # # #         logger.info(f"Embedding lecture materials with args: {args}")
# # # #         result = execute_script(embed_lecture_materials_main, args)
        
# # # #         if result['success']:
# # # #             return jsonify({
# # # #                 'success': True,
# # # #                 'message': 'Lecture materials embedded successfully',
# # # #                 'parameters': {
# # # #                     'provider': provider,
# # # #                     'model': model,
# # # #                     'embedder': embedder,
# # # #                     'module_code': module_code
# # # #                 }
# # # #             })
# # # #         else:
# # # #             return jsonify({'success': False, 'error': result['error']}), 500
            
# # # #     except Exception as e:
# # # #         logger.error(f"Error in embed lecture materials: {str(e)}")
# # # #         return jsonify({'success': False, 'error': str(e)}), 500


# # # # @app.route('/api/extract-and-save', methods=['POST'])
# # # # def extract_and_save():
# # # #     """Extract and save student answers."""
# # # #     try:
# # # #         data = request.get_json() or {}
# # # #         provider = data.get('provider', 'OpenAI')
# # # #         model = data.get('model', 'gpt-4o' if provider == 'OpenAI' else 'gemini-2.0-flash')
        
# # # #         # Prepare arguments for the script
# # # #         args = ['run_extract_and_save.py', '--provider', provider, '--model', model, '--from-db']
        
# # # #         logger.info(f"Extracting and saving answers with args: {args}")
# # # #         result = execute_script(extract_and_save_main, args)
        
# # # #         if result['success']:
# # # #             return jsonify({
# # # #                 'success': True,
# # # #                 'message': 'Student answers extracted and saved successfully',
# # # #                 'parameters': {
# # # #                     'provider': provider,
# # # #                     'model': model
# # # #                 }
# # # #             })
# # # #         else:
# # # #             return jsonify({'success': False, 'error': result['error']}), 500
            
# # # #     except Exception as e:
# # # #         logger.error(f"Error in extract and save: {str(e)}")
# # # #         return jsonify({'success': False, 'error': str(e)}), 500


# # # # @app.route('/api/embed-from-db', methods=['POST'])
# # # # def embed_from_db():
# # # #     """Embed student answers from database."""
# # # #     try:
# # # #         data = request.get_json() or {}
# # # #         provider = data.get('provider', 'OpenAI')
# # # #         model = data.get('model', 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001')
# # # #         module_code = data.get('module_code', 'EE3350')
# # # #         year = data.get('year', '2025')
# # # #         month = data.get('month', 'June')
        
# # # #         # Prepare arguments for the script
# # # #         args = [
# # # #             'embed_from_db.py', '--provider', provider, '--model', model,
# # # #             '--module_code', module_code, '--year', year, '--month', month
# # # #         ]
        
# # # #         logger.info(f"Embedding from database with args: {args}")
# # # #         result = execute_script(embed_from_db_main, args)
        
# # # #         if result['success']:
# # # #             return jsonify({
# # # #                 'success': True,
# # # #                 'message': 'Student answers embedded successfully',
# # # #                 'parameters': {
# # # #                     'provider': provider,
# # # #                     'model': model,
# # # #                     'module_code': module_code,
# # # #                     'year': year,
# # # #                     'month': month
# # # #                 }
# # # #             })
# # # #         else:
# # # #             return jsonify({'success': False, 'error': result['error']}), 500
            
# # # #     except Exception as e:
# # # #         logger.error(f"Error in embed from db: {str(e)}")
# # # #         return jsonify({'success': False, 'error': str(e)}), 500


# # # # @app.route('/api/embed-model-answers', methods=['POST'])
# # # # def embed_model_answers():
# # # #     """Embed model answers."""
# # # #     try:
# # # #         data = request.get_json() or {}
# # # #         provider = data.get('provider', 'OpenAI')
# # # #         model = data.get('model', 'gpt-4o' if provider == 'OpenAI' else 'gemini-2.0-flash')
# # # #         embedder = data.get('embedder', 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001')
        
# # # #         # Prepare arguments for the script
# # # #         args = ['embed_model_answers.py', '--provider', provider, '--model', model, '--embedder', embedder]
        
# # # #         logger.info(f"Embedding model answers with args: {args}")
# # # #         result = execute_script(embed_model_answers_main, args)
        
# # # #         if result['success']:
# # # #             return jsonify({
# # # #                 'success': True,
# # # #                 'message': 'Model answers embedded successfully',
# # # #                 'parameters': {
# # # #                     'provider': provider,
# # # #                     'model': model,
# # # #                     'embedder': embedder
# # # #                 }
# # # #             })
# # # #         else:
# # # #             return jsonify({'success': False, 'error': result['error']}), 500
            
# # # #     except Exception as e:
# # # #         logger.error(f"Error in embed model answers: {str(e)}")
# # # #         return jsonify({'success': False, 'error': str(e)}), 500


# # # # @app.route('/api/mark-papers', methods=['POST'])
# # # # def mark_papers():
# # # #     """Mark all papers."""
# # # #     try:
# # # #         data = request.get_json() or {}
# # # #         provider = data.get('provider', 'OpenAI')
# # # #         llm = data.get('llm', 'gpt-4o' if provider == 'OpenAI' else 'gemini-2.0-flash')
# # # #         embedder = data.get('embedder', 'text-embedding-3-small' if provider == 'OpenAI' else 'embedding-001')
# # # #         module = data.get('module', 'EE3350')
# # # #         year = data.get('year', '2025')
# # # #         month = data.get('month', 'June')
        
# # # #         # Prepare arguments for the script
# # # #         args = [
# # # #             'mark_all_papers.py', '--provider', provider, '--llm', llm,
# # # #             '--embedder', embedder, '--module', module, '--year', year, '--month', month
# # # #         ]
        
# # # #         logger.info(f"Marking papers with args: {args}")
# # # #         result = execute_script(mark_all_papers_main, args)
        
# # # #         if result['success']:
# # # #             return jsonify({
# # # #                 'success': True,
# # # #                 'message': 'Papers marked successfully',
# # # #                 'parameters': {
# # # #                     'provider': provider,
# # # #                     'llm': llm,
# # # #                     'embedder': embedder,
# # # #                     'module': module,
# # # #                     'year': year,
# # # #                     'month': month
# # # #                 }
# # # #             })
# # # #         else:
# # # #             return jsonify({'success': False, 'error': result['error']}), 500
            
# # # #     except Exception as e:
# # # #         logger.error(f"Error in mark papers: {str(e)}")
# # # #         return jsonify({'success': False, 'error': str(e)}), 500


# # # # @app.route('/api/run-full-evaluation', methods=['POST'])
# # # # def run_full_evaluation():
# # # #     """Run the complete evaluation pipeline."""
# # # #     try:
# # # #         data = request.get_json() or {}
# # # #         provider = data.get('provider', 'OpenAI')
# # # #         module_code = data.get('module_code', 'EE3350')
# # # #         year = data.get('year', '2025')
# # # #         month = data.get('month', 'June')
        
# # # #         logger.info(f"Starting full evaluation pipeline with provider: {provider}")
        
# # # #         # Set default models based on provider
# # # #         if provider == 'OpenAI':
# # # #             llm_model = 'gpt-4o'
# # # #             embed_model = 'text-embedding-3-small'
# # # #         elif provider == 'GoogleGemini':
# # # #             llm_model = 'gemini-2.0-flash'
# # # #             embed_model = 'models/embedding-001'
# # # #         else:
# # # #             llm_model = 'gpt-4o'
# # # #             embed_model = 'text-embedding-3-small'
        
# # # #         steps = [
# # # #             ('embed_lecture_materials', embed_lecture_materials_main),
# # # #             ('extract_and_save', extract_and_save_main),
# # # #             ('embed_from_db', embed_from_db_main),
# # # #             ('embed_model_answers', embed_model_answers_main),
# # # #             ('mark_papers', mark_all_papers_main)
# # # #         ]
        
# # # #         results = []
        
# # # #         for i, (step_name, step_func) in enumerate(steps):
# # # #             logger.info(f"Running step {i+1}/5: {step_name}")
            
# # # #             # Prepare arguments based on step
# # # #             if step_name == 'embed_lecture_materials':
# # # #                 args = ['embed_lecture_materials.py', '--provider', provider, '--model', llm_model, '--embedder', embed_model]
# # # #                 if module_code:
# # # #                     args.extend(['--module', module_code])
# # # #             elif step_name == 'extract_and_save':
# # # #                 args = ['run_extract_and_save.py', '--provider', provider, '--model', llm_model, '--from-db']
# # # #             elif step_name == 'embed_from_db':
# # # #                 args = ['embed_from_db.py', '--provider', provider, '--model', embed_model, '--module_code', module_code, '--year', year, '--month', month]
# # # #             elif step_name == 'embed_model_answers':
# # # #                 args = ['embed_model_answers.py', '--provider', provider, '--model', llm_model, '--embedder', embed_model]
# # # #             elif step_name == 'mark_papers':
# # # #                 embedder_arg = embed_model.replace('models/', '') if 'models/' in embed_model else embed_model
# # # #                 args = ['mark_all_papers.py', '--provider', provider, '--llm', llm_model, '--embedder', embedder_arg, '--module', module_code, '--year', year, '--month', month]
            
# # # #             result = execute_script(step_func, args)
# # # #             results.append({
# # # #                 'step': step_name,
# # # #                 'success': result['success'],
# # # #                 'error': result.get('error')
# # # #             })
            
# # # #             # If a step fails, stop the pipeline
# # # #             if not result['success']:
# # # #                 logger.error(f"Pipeline failed at step {step_name}: {result.get('error')}")
# # # #                 break
        
# # # #         # Check if all steps completed successfully
# # # #         successful_steps = [r for r in results if r['success']]
# # # #         all_successful = len(successful_steps) == len(steps)
        
# # # #         return jsonify({
# # # #             'success': all_successful,
# # # #             'message': f'Pipeline completed: {len(successful_steps)}/{len(steps)} steps successful',
# # # #             'results': results,
# # # #             'parameters': {
# # # #                 'provider': provider,
# # # #                 'module_code': module_code,
# # # #                 'year': year,
# # # #                 'month': month,
# # # #                 'llm_model': llm_model,
# # # #                 'embed_model': embed_model
# # # #             }
# # # #         })
        
# # # #     except Exception as e:
# # # #         logger.error(f"Error in full evaluation: {str(e)}")
# # # #         return jsonify({'success': False, 'error': str(e)}), 500


# # # # if __name__ == '__main__':
# # # #     print("🚀 Starting AI Exam Evaluation Flask API Server...")
# # # #     print("📍 Available endpoints:")
# # # #     print("   GET  /api/health")
# # # #     print("   POST /api/embed-lecture-materials")
# # # #     print("   POST /api/extract-and-save")
# # # #     print("   POST /api/embed-from-db")
# # # #     print("   POST /api/embed-model-answers")
# # # #     print("   POST /api/mark-papers")
# # # #     print("   POST /api/run-full-evaluation")
    
# # # #     app.run(host='0.0.0.0', port=7000, debug=True)

# # # # """
# # # # Simple Flask API Server for AI Exam Evaluation System
# # # # Provides direct REST endpoints for each evaluation step without task tracking.
# # # # """

# # # # from flask import Flask, request, jsonify
# # # # from flask_cors import CORS
# # # # import logging
# # # # import os
# # # # import sys
# # # # import argparse
# # # # from contextlib import contextmanager

# # # # # Add project root to path for imports
# # # # sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# # # # from src.scripts.embed_lecture_materials import main as embed_lecture_materials_main
# # # # from src.scripts.run_extract_and_save import main as extract_and_save_main  
# # # # from src.scripts.embed_from_db import main as embed_from_db_main
# # # # from src.scripts.embed_model_answers import main as embed_model_answers_main
# # # # from src.scripts.mark_all_papers import main as mark_all_papers_main

# # # # app = Flask(__name__)
# # # # CORS(app)

# # # # # Configure logging
# # # # logging.basicConfig(level=logging.INFO)
# # # # logger = logging.getLogger(__name__)


# # # # @contextmanager
# # # # def temp_argv(new_argv):
# # # #     """Context manager to temporarily replace sys.argv."""
# # # #     original_argv = sys.argv.copy()
# # # #     try:
# # # #         sys.argv = new_argv
# # # #         yield
# # # #     finally:
# # # #         sys.argv = original_argv





# # # # def execute_script_with_args(script_func, script_name, **kwargs):
# # # #     """Execute a script with proper argument handling using sys.argv."""
# # # #     try:
# # # #         # Build the command line arguments based on the script
# # # #         script_file = f"{script_name}.py"
# # # #         args = [script_file]
        
# # # #         if script_name == 'embed_lecture_materials':
# # # #             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
# # # #             args.extend(['--model', kwargs.get('model', 'gpt-4o')])
# # # #             args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
# # # #             if kwargs.get('module_code'):
# # # #                 args.extend(['--module', kwargs.get('module_code')])
                
# # # #         elif script_name == 'extract_and_save':
# # # #             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
# # # #             args.extend(['--model', kwargs.get('model', 'gpt-4o')])
# # # #             if kwargs.get('from_db', True):
# # # #                 args.append('--from-db')
                
# # # #         elif script_name == 'embed_from_db':
# # # #             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
# # # #             args.extend(['--model', kwargs.get('model', 'text-embedding-3-small')])
# # # #             args.extend(['--module_code', kwargs.get('module_code', 'EE3350')])
# # # #             args.extend(['--year', kwargs.get('year', '2025')])
# # # #             args.extend(['--month', kwargs.get('month', 'June')])
            
# # # #         elif script_name == 'embed_model_answers':
# # # #             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
# # # #             args.extend(['--model', kwargs.get('model', 'gpt-4o')])
# # # #             args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
            
# # # #         elif script_name == 'mark_papers':
# # # #             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
# # # #             args.extend(['--llm', kwargs.get('llm', 'gpt-4o')])
# # # #             args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
# # # #             args.extend(['--module', kwargs.get('module', 'EE3350')])
# # # #             args.extend(['--year', kwargs.get('year', '2025')])
# # # #             args.extend(['--month', kwargs.get('month', 'June')])
        
# # # #         logger.info(f"Executing {script_name} with args: {args}")
        
# # # #         # Execute with temporary sys.argv
# # # #         with temp_argv(args):
# # # #             result = script_func()
            
# # # #         return {'success': True, 'message': 'Script executed successfully', 'result': result}
        
# # # #     except Exception as e:
# # # #         logger.error(f"Script execution failed: {str(e)}")
# # # #         return {'success': False, 'error': str(e)}


# # # # def execute_script_legacy(script_func, args_dict):
# # # #     """Legacy script execution method using sys.argv manipulation."""
# # # #     try:
# # # #         # Build args list
# # # #         args = [script_func.__name__ + '.py']
# # # #         for key, value in args_dict.items():
# # # #             if value is not None:
# # # #                 if isinstance(value, bool) and value:
# # # #                     args.append(f'--{key.replace("_", "-")}')
# # # #                 else:
# # # #                     args.extend([f'--{key.replace("_", "-")}', str(value)])
        
# # # #         logger.info(f"Legacy execution with args: {args}")
        
# # # #         # Override sys.argv for the script
# # # #         with temp_argv(args):
# # # #             result = script_func()
        
# # # #         return {'success': True, 'message': 'Script executed successfully', 'result': result}
        
# # # #     except Exception as e:
# # # #         logger.error(f"Legacy script execution failed: {str(e)}")
# # # #         return {'success': False, 'error': str(e)}


# # # # @app.route('/api/health', methods=['GET'])
# # # # def health_check():
# # # #     """Health check endpoint."""
# # # #     return jsonify({'status': 'healthy'})


# # # # @app.route('/api/embed-lecture-materials', methods=['POST'])
# # # # def embed_lecture_materials():
# # # #     """Embed lecture materials from database."""
# # # #     try:
# # # #         data = request.get_json() or {}
# # # #         provider = data.get('provider', 'OpenAI')
# # # #         model = data.get('model', 'gpt-4o')
# # # #         embedder = data.get('embedder')
# # # #         module_code = data.get('module_code')
        
# # # #         # Set default embedders based on provider
# # # #         if not embedder:
# # # #             embedder = 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001'
        
# # # #         logger.info(f"Embedding lecture materials with provider: {provider}, model: {model}")
# # # #         result = execute_script_with_args(
# # # #             embed_lecture_materials_main, 
# # # #             'embed_lecture_materials',
# # # #             provider=provider,
# # # #             model=model,
# # # #             embedder=embedder,
# # # #             module_code=module_code
# # # #         )
        
# # # #         if result['success']:
# # # #             return jsonify({
# # # #                 'success': True,
# # # #                 'message': 'Lecture materials embedded successfully',
# # # #                 'parameters': {
# # # #                     'provider': provider,
# # # #                     'model': model,
# # # #                     'embedder': embedder,
# # # #                     'module_code': module_code
# # # #                 }
# # # #             })
# # # #         else:
# # # #             return jsonify({'success': False, 'error': result['error']}), 500
            
# # # #     except Exception as e:
# # # #         logger.error(f"Error in embed lecture materials: {str(e)}")
# # # #         return jsonify({'success': False, 'error': str(e)}), 500


# # # # @app.route('/api/extract-and-save', methods=['POST'])
# # # # def extract_and_save():
# # # #     """Extract and save student answers."""
# # # #     try:
# # # #         data = request.get_json() or {}
# # # #         provider = data.get('provider', 'OpenAI')
# # # #         model = data.get('model', 'gpt-4o' if provider == 'OpenAI' else 'gemini-2.0-flash')
        
# # # #         logger.info(f"Extracting and saving answers with provider: {provider}, model: {model}")
# # # #         result = execute_script_with_args(
# # # #             extract_and_save_main,
# # # #             'extract_and_save',
# # # #             provider=provider,
# # # #             model=model,
# # # #             from_db=True
# # # #         )
        
# # # #         if result['success']:
# # # #             return jsonify({
# # # #                 'success': True,
# # # #                 'message': 'Student answers extracted and saved successfully',
# # # #                 'parameters': {
# # # #                     'provider': provider,
# # # #                     'model': model
# # # #                 }
# # # #             })
# # # #         else:
# # # #             return jsonify({'success': False, 'error': result['error']}), 500
            
# # # #     except Exception as e:
# # # #         logger.error(f"Error in extract and save: {str(e)}")
# # # #         return jsonify({'success': False, 'error': str(e)}), 500


# # # # @app.route('/api/embed-from-db', methods=['POST'])
# # # # def embed_from_db():
# # # #     """Embed student answers from database."""
# # # #     try:
# # # #         data = request.get_json() or {}
# # # #         provider = data.get('provider', 'OpenAI')
# # # #         model = data.get('model', 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001')
# # # #         module_code = data.get('module_code', 'EE3350')
# # # #         year = data.get('year', '2025')
# # # #         month = data.get('month', 'June')
        
# # # #         logger.info(f"Embedding from database with provider: {provider}, model: {model}")
# # # #         result = execute_script_with_args(
# # # #             embed_from_db_main,
# # # #             'embed_from_db',
# # # #             provider=provider,
# # # #             model=model,
# # # #             module_code=module_code,
# # # #             year=year,
# # # #             month=month
# # # #         )
        
# # # #         if result['success']:
# # # #             return jsonify({
# # # #                 'success': True,
# # # #                 'message': 'Student answers embedded successfully',
# # # #                 'parameters': {
# # # #                     'provider': provider,
# # # #                     'model': model,
# # # #                     'module_code': module_code,
# # # #                     'year': year,
# # # #                     'month': month
# # # #                 }
# # # #             })
# # # #         else:
# # # #             return jsonify({'success': False, 'error': result['error']}), 500
            
# # # #     except Exception as e:
# # # #         logger.error(f"Error in embed from db: {str(e)}")
# # # #         return jsonify({'success': False, 'error': str(e)}), 500


# # # # @app.route('/api/embed-model-answers', methods=['POST'])
# # # # def embed_model_answers():
# # # #     """Embed model answers."""
# # # #     try:
# # # #         data = request.get_json() or {}
# # # #         provider = data.get('provider', 'OpenAI')
# # # #         model = data.get('model', 'gpt-4o' if provider == 'OpenAI' else 'gemini-2.0-flash')
# # # #         embedder = data.get('embedder', 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001')
        
# # # #         logger.info(f"Embedding model answers with provider: {provider}, model: {model}")
# # # #         result = execute_script_with_args(
# # # #             embed_model_answers_main,
# # # #             'embed_model_answers',
# # # #             provider=provider,
# # # #             model=model,
# # # #             embedder=embedder
# # # #         )
        
# # # #         if result['success']:
# # # #             return jsonify({
# # # #                 'success': True,
# # # #                 'message': 'Model answers embedded successfully',
# # # #                 'parameters': {
# # # #                     'provider': provider,
# # # #                     'model': model,
# # # #                     'embedder': embedder
# # # #                 }
# # # #             })
# # # #         else:
# # # #             return jsonify({'success': False, 'error': result['error']}), 500
            
# # # #     except Exception as e:
# # # #         logger.error(f"Error in embed model answers: {str(e)}")
# # # #         return jsonify({'success': False, 'error': str(e)}), 500


# # # # @app.route('/api/mark-papers', methods=['POST'])
# # # # def mark_papers():
# # # #     """Mark all papers."""
# # # #     try:
# # # #         data = request.get_json() or {}
# # # #         provider = data.get('provider', 'OpenAI')
# # # #         llm = data.get('llm', 'gpt-4o' if provider == 'OpenAI' else 'gemini-2.0-flash')
# # # #         embedder = data.get('embedder', 'text-embedding-3-small' if provider == 'OpenAI' else 'embedding-001')
# # # #         module = data.get('module', 'EE3350')
# # # #         year = data.get('year', '2025')
# # # #         month = data.get('month', 'June')
        
# # # #         logger.info(f"Marking papers with provider: {provider}, llm: {llm}")
# # # #         result = execute_script_with_args(
# # # #             mark_all_papers_main,
# # # #             'mark_papers',
# # # #             provider=provider,
# # # #             llm=llm,
# # # #             embedder=embedder,
# # # #             module=module,
# # # #             year=year,
# # # #             month=month
# # # #         )
        
# # # #         if result['success']:
# # # #             return jsonify({
# # # #                 'success': True,
# # # #                 'message': 'Papers marked successfully',
# # # #                 'parameters': {
# # # #                     'provider': provider,
# # # #                     'llm': llm,
# # # #                     'embedder': embedder,
# # # #                     'module': module,
# # # #                     'year': year,
# # # #                     'month': month
# # # #                 }
# # # #             })
# # # #         else:
# # # #             return jsonify({'success': False, 'error': result['error']}), 500
            
# # # #     except Exception as e:
# # # #         logger.error(f"Error in mark papers: {str(e)}")
# # # #         return jsonify({'success': False, 'error': str(e)}), 500


# # # # @app.route('/api/run-full-evaluation', methods=['POST'])
# # # # def run_full_evaluation():
# # # #     """Run the complete evaluation pipeline."""
# # # #     try:
# # # #         data = request.get_json() or {}
# # # #         provider = data.get('provider', 'OpenAI')
# # # #         module_code = data.get('module_code', 'EE3350')
# # # #         year = data.get('year', '2025')
# # # #         month = data.get('month', 'June')
        
# # # #         logger.info(f"Starting full evaluation pipeline with provider: {provider}")
        
# # # #         # Set default models based on provider
# # # #         if provider == 'OpenAI':
# # # #             llm_model = 'gpt-4o'
# # # #             embed_model = 'text-embedding-3-small'
# # # #         elif provider == 'GoogleGemini':
# # # #             llm_model = 'gemini-2.0-flash'
# # # #             embed_model = 'models/embedding-001'
# # # #         else:
# # # #             llm_model = 'gpt-4o'
# # # #             embed_model = 'text-embedding-3-small'
        
# # # #         steps = [
# # # #             ('embed_lecture_materials', embed_lecture_materials_main, {
# # # #                 'provider': provider,
# # # #                 'model': llm_model,
# # # #                 'embedder': embed_model,
# # # #                 'module_code': module_code
# # # #             }),
# # # #             ('extract_and_save', extract_and_save_main, {
# # # #                 'provider': provider,
# # # #                 'model': llm_model,
# # # #                 'from_db': True
# # # #             }),
# # # #             ('embed_from_db', embed_from_db_main, {
# # # #                 'provider': provider,
# # # #                 'model': embed_model,
# # # #                 'module_code': module_code,
# # # #                 'year': year,
# # # #                 'month': month
# # # #             }),
# # # #             ('embed_model_answers', embed_model_answers_main, {
# # # #                 'provider': provider,
# # # #                 'model': llm_model,
# # # #                 'embedder': embed_model
# # # #             }),
# # # #             ('mark_papers', mark_all_papers_main, {
# # # #                 'provider': provider,
# # # #                 'llm': llm_model,
# # # #                 'embedder': embed_model.replace('models/', '') if 'models/' in embed_model else embed_model,
# # # #                 'module': module_code,
# # # #                 'year': year,
# # # #                 'month': month
# # # #             })
# # # #         ]
        
# # # #         results = []
        
# # # #         for i, (step_name, step_func, step_kwargs) in enumerate(steps):
# # # #             logger.info(f"Running step {i+1}/5: {step_name}")
            
# # # #             result = execute_script_with_args(step_func, step_name, **step_kwargs)
# # # #             results.append({
# # # #                 'step': step_name,
# # # #                 'success': result['success'],
# # # #                 'error': result.get('error')
# # # #             })
            
# # # #             # If a step fails, stop the pipeline
# # # #             if not result['success']:
# # # #                 logger.error(f"Pipeline failed at step {step_name}: {result.get('error')}")
# # # #                 break
        
# # # #         # Check if all steps completed successfully
# # # #         successful_steps = [r for r in results if r['success']]
# # # #         all_successful = len(successful_steps) == len(steps)
        
# # # #         return jsonify({
# # # #             'success': all_successful,
# # # #             'message': f'Pipeline completed: {len(successful_steps)}/{len(steps)} steps successful',
# # # #             'results': results,
# # # #             'parameters': {
# # # #                 'provider': provider,
# # # #                 'module_code': module_code,
# # # #                 'year': year,
# # # #                 'month': month,
# # # #                 'llm_model': llm_model,
# # # #                 'embed_model': embed_model
# # # #             }
# # # #         })
        
# # # #     except Exception as e:
# # # #         logger.error(f"Error in full evaluation: {str(e)}")
# # # #         return jsonify({'success': False, 'error': str(e)}), 500


# # # # @app.route('/api/status', methods=['GET'])
# # # # def get_status():
# # # #     """Get current API status and available endpoints."""
# # # #     return jsonify({
# # # #         'status': 'running',
# # # #         'version': '1.0.0',
# # # #         'endpoints': {
# # # #             'health': 'GET /api/health',
# # # #             'embed_lecture_materials': 'POST /api/embed-lecture-materials',
# # # #             'extract_and_save': 'POST /api/extract-and-save',
# # # #             'embed_from_db': 'POST /api/embed-from-db',
# # # #             'embed_model_answers': 'POST /api/embed-model-answers',
# # # #             'mark_papers': 'POST /api/mark-papers',
# # # #             'run_full_evaluation': 'POST /api/run-full-evaluation',
# # # #             'status': 'GET /api/status'
# # # #         },
# # # #         'supported_providers': ['OpenAI', 'GoogleGemini'],
# # # #         'default_models': {
# # # #             'OpenAI': {
# # # #                 'llm': 'gpt-4o',
# # # #                 'embedder': 'text-embedding-3-small'
# # # #             },
# # # #             'GoogleGemini': {
# # # #                 'llm': 'gemini-2.0-flash',
# # # #                 'embedder': 'models/embedding-001'
# # # #             }
# # # #         }
# # # #     })


# # # # if __name__ == '__main__':
# # # #     print("🚀 Starting AI Exam Evaluation Flask API Server...")
# # # #     print("📍 Available endpoints:")
# # # #     print("   GET  /api/health")
# # # #     print("   GET  /api/status")
# # # #     print("   POST /api/embed-lecture-materials")
# # # #     print("   POST /api/extract-and-save")
# # # #     print("   POST /api/embed-from-db")
# # # #     print("   POST /api/embed-model-answers")
# # # #     print("   POST /api/mark-papers")
# # # #     print("   POST /api/run-full-evaluation")
    
# # # #     app.run(host='0.0.0.0', port=7000, debug=True)

# # # """
# # # Simple Flask API Server for AI Exam Evaluation System
# # # Provides direct REST endpoints for each evaluation step without task tracking.
# # # """

# # # from flask import Flask, request, jsonify
# # # from flask_cors import CORS
# # # import logging
# # # import os
# # # import sys
# # # import argparse
# # # from contextlib import contextmanager

# # # # Add project root to path for imports
# # # sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# # # from src.scripts.embed_lecture_materials import main as embed_lecture_materials_main
# # # from src.scripts.run_extract_and_save import main as extract_and_save_main  
# # # from src.scripts.embed_from_db import main as embed_from_db_main
# # # from src.scripts.embed_model_answers import main as embed_model_answers_main
# # # from src.scripts.mark_all_papers import main as mark_all_papers_main

# # # app = Flask(__name__)
# # # CORS(app)

# # # # Configure logging
# # # logging.basicConfig(level=logging.INFO)
# # # logger = logging.getLogger(__name__)


# # # @contextmanager
# # # def temp_argv(new_argv):
# # #     """Context manager to temporarily replace sys.argv."""
# # #     original_argv = sys.argv.copy()
# # #     try:
# # #         sys.argv = new_argv
# # #         yield
# # #     finally:
# # #         sys.argv = original_argv


# # # def execute_direct_call(script_func, **kwargs):
# # #     """Execute script function directly with parameters."""
# # #     try:
# # #         logger.info(f"Executing {script_func.__name__} with kwargs: {kwargs}")
# # #         result = script_func(**kwargs)
# # #         return {'success': True, 'message': 'Script executed successfully', 'result': result}
# # #     except Exception as e:
# # #         logger.error(f"Direct execution failed: {str(e)}")
# # #         return {'success': False, 'error': str(e)}


# # # def execute_script_with_args(script_func, script_name, **kwargs):
# # #     """Execute a script with proper argument handling using sys.argv."""
# # #     try:
# # #         # Build the command line arguments based on the script
# # #         script_file = f"{script_name}.py"
# # #         args = [script_file]
        
# # #         if script_name == 'embed_lecture_materials':
# # #             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
# # #             args.extend(['--model', kwargs.get('model', 'gpt-4o')])
# # #             args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
# # #             if kwargs.get('module_code'):
# # #                 args.extend(['--module', kwargs.get('module_code')])
                
# # #         elif script_name == 'extract_and_save':
# # #             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
# # #             args.extend(['--model', kwargs.get('model', 'gpt-4o')])
# # #             if kwargs.get('from_db', True):
# # #                 args.append('--from-db')
                
# # #         elif script_name == 'embed_model_answers':
# # #             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
# # #             args.extend(['--model', kwargs.get('model', 'gpt-4o')])
# # #             args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
            
# # #         elif script_name == 'mark_papers':
# # #             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
# # #             args.extend(['--llm', kwargs.get('llm', 'gpt-4o')])
# # #             args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
# # #             args.extend(['--module', kwargs.get('module', 'EE3350')])
# # #             args.extend(['--year', kwargs.get('year', '2025')])
# # #             args.extend(['--month', kwargs.get('month', 'June')])
        
# # #         logger.info(f"Executing {script_name} with args: {args}")
        
# # #         # Execute with temporary sys.argv
# # #         with temp_argv(args):
# # #             result = script_func()
            
# # #         return {'success': True, 'message': 'Script executed successfully', 'result': result}
        
# # #     except Exception as e:
# # #         logger.error(f"Script execution failed: {str(e)}")
# # #         return {'success': False, 'error': str(e)}


# # # def execute_script_legacy(script_func, args_dict):
# # #     """Legacy script execution method using sys.argv manipulation."""
# # #     try:
# # #         # Build args list
# # #         args = [script_func.__name__ + '.py']
# # #         for key, value in args_dict.items():
# # #             if value is not None:
# # #                 if isinstance(value, bool) and value:
# # #                     args.append(f'--{key.replace("_", "-")}')
# # #                 else:
# # #                     args.extend([f'--{key.replace("_", "-")}', str(value)])
        
# # #         logger.info(f"Legacy execution with args: {args}")
        
# # #         # Override sys.argv for the script
# # #         with temp_argv(args):
# # #             result = script_func()
        
# # #         return {'success': True, 'message': 'Script executed successfully', 'result': result}
        
# # #     except Exception as e:
# # #         logger.error(f"Legacy script execution failed: {str(e)}")
# # #         return {'success': False, 'error': str(e)}


# # # @app.route('/api/health', methods=['GET'])
# # # def health_check():
# # #     """Health check endpoint."""
# # #     return jsonify({'status': 'healthy'})


# # # @app.route('/api/embed-lecture-materials', methods=['POST'])
# # # def embed_lecture_materials():
# # #     """Embed lecture materials from database."""
# # #     try:
# # #         data = request.get_json() or {}
# # #         provider = data.get('provider', 'OpenAI')
# # #         model = data.get('model', 'gpt-4o')
# # #         embedder = data.get('embedder')
# # #         module_code = data.get('module_code')
        
# # #         # Set default embedders based on provider
# # #         if not embedder:
# # #             embedder = 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001'
        
# # #         logger.info(f"Embedding lecture materials with provider: {provider}, model: {model}")
# # #         result = execute_script_with_args(
# # #             embed_lecture_materials_main, 
# # #             'embed_lecture_materials',
# # #             provider=provider,
# # #             model=model,
# # #             embedder=embedder,
# # #             module_code=module_code
# # #         )
        
# # #         if result['success']:
# # #             return jsonify({
# # #                 'success': True,
# # #                 'message': 'Lecture materials embedded successfully',
# # #                 'parameters': {
# # #                     'provider': provider,
# # #                     'model': model,
# # #                     'embedder': embedder,
# # #                     'module_code': module_code
# # #                 }
# # #             })
# # #         else:
# # #             return jsonify({'success': False, 'error': result['error']}), 500
            
# # #     except Exception as e:
# # #         logger.error(f"Error in embed lecture materials: {str(e)}")
# # #         return jsonify({'success': False, 'error': str(e)}), 500


# # # @app.route('/api/extract-and-save', methods=['POST'])
# # # def extract_and_save():
# # #     """Extract and save student answers."""
# # #     try:
# # #         data = request.get_json() or {}
# # #         provider = data.get('provider', 'OpenAI')
# # #         model = data.get('model', 'gpt-4o' if provider == 'OpenAI' else 'gemini-2.0-flash')
        
# # #         logger.info(f"Extracting and saving answers with provider: {provider}, model: {model}")
# # #         result = execute_script_with_args(
# # #             extract_and_save_main,
# # #             'extract_and_save',
# # #             provider=provider,
# # #             model=model,
# # #             from_db=True
# # #         )
        
# # #         if result['success']:
# # #             return jsonify({
# # #                 'success': True,
# # #                 'message': 'Student answers extracted and saved successfully',
# # #                 'parameters': {
# # #                     'provider': provider,
# # #                     'model': model
# # #                 }
# # #             })
# # #         else:
# # #             return jsonify({'success': False, 'error': result['error']}), 500
            
# # #     except Exception as e:
# # #         logger.error(f"Error in extract and save: {str(e)}")
# # #         return jsonify({'success': False, 'error': str(e)}), 500


# # # @app.route('/api/embed-from-db', methods=['POST'])
# # # def embed_from_db():
# # #     """Embed student answers from database."""
# # #     try:
# # #         data = request.get_json() or {}
# # #         provider = data.get('provider', 'OpenAI')
# # #         model = data.get('model', 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001')
# # #         module_code = data.get('module_code', 'EE3350')
# # #         year = data.get('year', '2025')
# # #         month = data.get('month', 'June')
        
# # #         logger.info(f"Embedding from database with provider: {provider}, model: {model}")
        
# # #         # Use direct function call instead of sys.argv manipulation
# # #         result = execute_direct_call(
# # #             embed_from_db_main,
# # #             provider=provider,
# # #             model=model,
# # #             module_code=module_code,
# # #             year=int(year),  # Make sure year is integer
# # #             month=month
# # #         )
        
# # #         if result['success']:
# # #             return jsonify({
# # #                 'success': True,
# # #                 'message': 'Student answers embedded successfully',
# # #                 'parameters': {
# # #                     'provider': provider,
# # #                     'model': model,
# # #                     'module_code': module_code,
# # #                     'year': year,
# # #                     'month': month
# # #                 }
# # #             })
# # #         else:
# # #             return jsonify({'success': False, 'error': result['error']}), 500
            
# # #     except Exception as e:
# # #         logger.error(f"Error in embed from db: {str(e)}")
# # #         return jsonify({'success': False, 'error': str(e)}), 500


# # # @app.route('/api/embed-model-answers', methods=['POST'])
# # # def embed_model_answers():
# # #     """Embed model answers."""
# # #     try:
# # #         data = request.get_json() or {}
# # #         provider = data.get('provider', 'OpenAI')
# # #         model = data.get('model', 'gpt-4o' if provider == 'OpenAI' else 'gemini-2.0-flash')
# # #         embedder = data.get('embedder', 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001')
        
# # #         logger.info(f"Embedding model answers with provider: {provider}, model: {model}")
# # #         result = execute_script_with_args(
# # #             embed_model_answers_main,
# # #             'embed_model_answers',
# # #             provider=provider,
# # #             model=model,
# # #             embedder=embedder
# # #         )
        
# # #         if result['success']:
# # #             return jsonify({
# # #                 'success': True,
# # #                 'message': 'Model answers embedded successfully',
# # #                 'parameters': {
# # #                     'provider': provider,
# # #                     'model': model,
# # #                     'embedder': embedder
# # #                 }
# # #             })
# # #         else:
# # #             return jsonify({'success': False, 'error': result['error']}), 500
            
# # #     except Exception as e:
# # #         logger.error(f"Error in embed model answers: {str(e)}")
# # #         return jsonify({'success': False, 'error': str(e)}), 500


# # # @app.route('/api/mark-papers', methods=['POST'])
# # # def mark_papers():
# # #     """Mark all papers."""
# # #     try:
# # #         data = request.get_json() or {}
# # #         provider = data.get('provider', 'OpenAI')
# # #         llm = data.get('llm', 'gpt-4o' if provider == 'OpenAI' else 'gemini-2.0-flash')
# # #         embedder = data.get('embedder', 'text-embedding-3-small' if provider == 'OpenAI' else 'embedding-001')
# # #         module = data.get('module', 'EE3350')
# # #         year = data.get('year', '2025')
# # #         month = data.get('month', 'June')
        
# # #         logger.info(f"Marking papers with provider: {provider}, llm: {llm}")
# # #         result = execute_script_with_args(
# # #             mark_all_papers_main,
# # #             'mark_papers',
# # #             provider=provider,
# # #             llm=llm,
# # #             embedder=embedder,
# # #             module=module,
# # #             year=year,
# # #             month=month
# # #         )
        
# # #         if result['success']:
# # #             return jsonify({
# # #                 'success': True,
# # #                 'message': 'Papers marked successfully',
# # #                 'parameters': {
# # #                     'provider': provider,
# # #                     'llm': llm,
# # #                     'embedder': embedder,
# # #                     'module': module,
# # #                     'year': year,
# # #                     'month': month
# # #                 }
# # #             })
# # #         else:
# # #             return jsonify({'success': False, 'error': result['error']}), 500
            
# # #     except Exception as e:
# # #         logger.error(f"Error in mark papers: {str(e)}")
# # #         return jsonify({'success': False, 'error': str(e)}), 500


# # # @app.route('/api/run-full-evaluation', methods=['POST'])
# # # def run_full_evaluation():
# # #     """Run the complete evaluation pipeline."""
# # #     try:
# # #         data = request.get_json() or {}
# # #         provider = data.get('provider', 'OpenAI')
# # #         module_code = data.get('module_code', 'EE3350')
# # #         year = data.get('year', '2025')
# # #         month = data.get('month', 'June')
        
# # #         logger.info(f"Starting full evaluation pipeline with provider: {provider}")
        
# # #         # Set default models based on provider
# # #         if provider == 'OpenAI':
# # #             llm_model = 'gpt-4o'
# # #             embed_model = 'text-embedding-3-small'
# # #         elif provider == 'GoogleGemini':
# # #             llm_model = 'gemini-2.0-flash'
# # #             embed_model = 'models/embedding-001'
# # #         else:
# # #             llm_model = 'gpt-4o'
# # #             embed_model = 'text-embedding-3-small'
        
# # #         steps = [
# # #             ('embed_lecture_materials', embed_lecture_materials_main, {
# # #                 'provider': provider,
# # #                 'model': llm_model,
# # #                 'embedder': embed_model,
# # #                 'module_code': module_code
# # #             }),
# # #             ('extract_and_save', extract_and_save_main, {
# # #                 'provider': provider,
# # #                 'model': llm_model,
# # #                 'from_db': True
# # #             }),
# # #             ('embed_from_db', embed_from_db_main, {
# # #                 'provider': provider,
# # #                 'model': embed_model,
# # #                 'module_code': module_code,
# # #                 'year': year,
# # #                 'month': month
# # #             }),
# # #             ('embed_model_answers', embed_model_answers_main, {
# # #                 'provider': provider,
# # #                 'model': llm_model,
# # #                 'embedder': embed_model
# # #             }),
# # #             ('mark_papers', mark_all_papers_main, {
# # #                 'provider': provider,
# # #                 'llm': llm_model,
# # #                 'embedder': embed_model.replace('models/', '') if 'models/' in embed_model else embed_model,
# # #                 'module': module_code,
# # #                 'year': year,
# # #                 'month': month
# # #             })
# # #         ]
        
# # #         results = []
        
# # #         for i, (step_name, step_func, step_kwargs) in enumerate(steps):
# # #             logger.info(f"Running step {i+1}/5: {step_name}")
            
# # #             # Use direct call for embed_from_db, sys.argv manipulation for others
# # #             if step_name == 'embed_from_db':
# # #                 # Convert year to int for direct call
# # #                 direct_kwargs = step_kwargs.copy()
# # #                 direct_kwargs['year'] = int(direct_kwargs['year'])
# # #                 result = execute_direct_call(step_func, **direct_kwargs)
# # #             else:
# # #                 result = execute_script_with_args(step_func, step_name, **step_kwargs)
            
# # #             results.append({
# # #                 'step': step_name,
# # #                 'success': result['success'],
# # #                 'error': result.get('error')
# # #             })
            
# # #             # If a step fails, stop the pipeline
# # #             if not result['success']:
# # #                 logger.error(f"Pipeline failed at step {step_name}: {result.get('error')}")
# # #                 break
        
# # #         # Check if all steps completed successfully
# # #         successful_steps = [r for r in results if r['success']]
# # #         all_successful = len(successful_steps) == len(steps)
        
# # #         return jsonify({
# # #             'success': all_successful,
# # #             'message': f'Pipeline completed: {len(successful_steps)}/{len(steps)} steps successful',
# # #             'results': results,
# # #             'parameters': {
# # #                 'provider': provider,
# # #                 'module_code': module_code,
# # #                 'year': year,
# # #                 'month': month,
# # #                 'llm_model': llm_model,
# # #                 'embed_model': embed_model
# # #             }
# # #         })
        
# # #     except Exception as e:
# # #         logger.error(f"Error in full evaluation: {str(e)}")
# # #         return jsonify({'success': False, 'error': str(e)}), 500


# # # @app.route('/api/status', methods=['GET'])
# # # def get_status():
# # #     """Get current API status and available endpoints."""
# # #     return jsonify({
# # #         'status': 'running',
# # #         'version': '1.0.0',
# # #         'endpoints': {
# # #             'health': 'GET /api/health',
# # #             'embed_lecture_materials': 'POST /api/embed-lecture-materials',
# # #             'extract_and_save': 'POST /api/extract-and-save',
# # #             'embed_from_db': 'POST /api/embed-from-db',
# # #             'embed_model_answers': 'POST /api/embed-model-answers',
# # #             'mark_papers': 'POST /api/mark-papers',
# # #             'run_full_evaluation': 'POST /api/run-full-evaluation',
# # #             'status': 'GET /api/status'
# # #         },
# # #         'supported_providers': ['OpenAI', 'GoogleGemini'],
# # #         'default_models': {
# # #             'OpenAI': {
# # #                 'llm': 'gpt-4o',
# # #                 'embedder': 'text-embedding-3-small'
# # #             },
# # #             'GoogleGemini': {
# # #                 'llm': 'gemini-2.0-flash',
# # #                 'embedder': 'models/embedding-001'
# # #             }
# # #         }
# # #     })


# # # if __name__ == '__main__':
# # #     print("🚀 Starting AI Exam Evaluation Flask API Server...")
# # #     print("📍 Available endpoints:")
# # #     print("   GET  /api/health")
# # #     print("   GET  /api/status")
# # #     print("   POST /api/embed-lecture-materials")
# # #     print("   POST /api/extract-and-save")
# # #     print("   POST /api/embed-from-db")
# # #     print("   POST /api/embed-model-answers")
# # #     print("   POST /api/mark-papers")
# # #     print("   POST /api/run-full-evaluation")
    
# # #     app.run(host='0.0.0.0', port=7000, debug=True)

# # """
# # Simple Flask API Server for AI Exam Evaluation System
# # Provides direct REST endpoints for each evaluation step without task tracking.
# # """

# # from flask import Flask, request, jsonify
# # from flask_cors import CORS
# # import logging
# # import os
# # import sys
# # import argparse
# # from contextlib import contextmanager

# # # Add project root to path for imports
# # sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# # from src.scripts.embed_lecture_materials import main as embed_lecture_materials_main
# # from src.scripts.run_extract_and_save import main as extract_and_save_main  
# # from src.scripts.embed_from_db import main as embed_from_db_main
# # from src.scripts.embed_model_answers import main as embed_model_answers_main
# # from src.scripts.mark_all_papers import main as mark_all_papers_main

# # app = Flask(__name__)
# # CORS(app)

# # # Configure logging
# # logging.basicConfig(level=logging.INFO)
# # logger = logging.getLogger(__name__)


# # def get_actual_module_code(module_identifier):
# #     """
# #     Get the actual module code from module identifier.
# #     If it's already a module code (like EE3350), return as-is.
# #     If it's a UUID, fetch the actual module code from database.
# #     """
# #     try:
# #         # If it looks like a standard module code, return as-is
# #         if len(module_identifier) <= 10 and not '-' in module_identifier:
# #             return module_identifier
        
# #         # If it's a UUID, you should fetch from database
# #         # For now, using a fallback - you should implement database lookup
# #         if len(module_identifier) > 10 and '-' in module_identifier:
# #             logger.warning(f"UUID-like module identifier received: {module_identifier}")
# #             # TODO: Implement database lookup to get actual module code
# #             # Example: SELECT module_code FROM modules WHERE module_id = %s
# #             return 'EE3350'  # Fallback - replace with actual database lookup
        
# #         return module_identifier
        
# #     except Exception as e:
# #         logger.error(f"Error getting module code: {str(e)}")
# #         return 'EE3350'  # Safe fallback


# # @contextmanager
# # def temp_argv(new_argv):
# #     """Context manager to temporarily replace sys.argv."""
# #     original_argv = sys.argv.copy()
# #     try:
# #         sys.argv = new_argv
# #         yield
# #     finally:
# #         sys.argv = original_argv


# # def execute_direct_call(script_func, **kwargs):
# #     """Execute script function directly with parameters."""
# #     try:
# #         logger.info(f"Executing {script_func.__name__} with kwargs: {kwargs}")
# #         result = script_func(**kwargs)
# #         return {'success': True, 'message': 'Script executed successfully', 'result': result}
# #     except Exception as e:
# #         logger.error(f"Direct execution failed: {str(e)}")
# #         return {'success': False, 'error': str(e)}


# # def execute_script_with_args(script_func, script_name, **kwargs):
# #     """Execute a script with proper argument handling using sys.argv."""
# #     try:
# #         # Build the command line arguments based on the script
# #         script_file = f"{script_name}.py"
# #         args = [script_file]
        
# #         if script_name == 'embed_lecture_materials':
# #             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
# #             args.extend(['--model', kwargs.get('model', 'gpt-4o')])
# #             args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
# #             if kwargs.get('module_code'):
# #                 args.extend(['--module', kwargs.get('module_code')])
                
# #         elif script_name == 'extract_and_save':
# #             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
# #             args.extend(['--model', kwargs.get('model', 'gpt-4o')])
# #             if kwargs.get('from_db', True):
# #                 args.append('--from-db')
                
# #         elif script_name == 'embed_model_answers':
# #             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
# #             args.extend(['--model', kwargs.get('model', 'gpt-4o')])
# #             args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
            
# #         elif script_name == 'mark_papers':
# #             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
# #             args.extend(['--llm', kwargs.get('llm', 'gpt-4o')])
# #             args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
# #             args.extend(['--module', kwargs.get('module', 'EE3350')])
# #             args.extend(['--year', kwargs.get('year', '2025')])
# #             args.extend(['--month', kwargs.get('month', 'June')])
        
# #         logger.info(f"Executing {script_name} with args: {args}")
        
# #         # Execute with temporary sys.argv
# #         with temp_argv(args):
# #             result = script_func()
            
# #         return {'success': True, 'message': 'Script executed successfully', 'result': result}
        
# #     except Exception as e:
# #         logger.error(f"Script execution failed: {str(e)}")
# #         return {'success': False, 'error': str(e)}


# # def execute_script_legacy(script_func, args_dict):
# #     """Legacy script execution method using sys.argv manipulation."""
# #     try:
# #         # Build args list
# #         args = [script_func.__name__ + '.py']
# #         for key, value in args_dict.items():
# #             if value is not None:
# #                 if isinstance(value, bool) and value:
# #                     args.append(f'--{key.replace("_", "-")}')
# #                 else:
# #                     args.extend([f'--{key.replace("_", "-")}', str(value)])
        
# #         logger.info(f"Legacy execution with args: {args}")
        
# #         # Override sys.argv for the script
# #         with temp_argv(args):
# #             result = script_func()
        
# #         return {'success': True, 'message': 'Script executed successfully', 'result': result}
        
# #     except Exception as e:
# #         logger.error(f"Legacy script execution failed: {str(e)}")
# #         return {'success': False, 'error': str(e)}


# # @app.route('/api/health', methods=['GET'])
# # def health_check():
# #     """Health check endpoint."""
# #     return jsonify({'status': 'healthy'})


# # @app.route('/api/embed-lecture-materials', methods=['POST'])
# # def embed_lecture_materials():
# #     """Embed lecture materials from database."""
# #     try:
# #         data = request.get_json() or {}
# #         provider = data.get('provider', 'OpenAI')
# #         model = data.get('model', 'gpt-4o')
# #         embedder = data.get('embedder')
# #         module_code = data.get('module_code')
        
# #         # Set default embedders based on provider
# #         if not embedder:
# #             embedder = 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001'
        
# #         logger.info(f"Embedding lecture materials with provider: {provider}, model: {model}")
# #         result = execute_script_with_args(
# #             embed_lecture_materials_main, 
# #             'embed_lecture_materials',
# #             provider=provider,
# #             model=model,
# #             embedder=embedder,
# #             module_code=module_code
# #         )
        
# #         if result['success']:
# #             return jsonify({
# #                 'success': True,
# #                 'message': 'Lecture materials embedded successfully',
# #                 'parameters': {
# #                     'provider': provider,
# #                     'model': model,
# #                     'embedder': embedder,
# #                     'module_code': module_code
# #                 }
# #             })
# #         else:
# #             return jsonify({'success': False, 'error': result['error']}), 500
            
# #     except Exception as e:
# #         logger.error(f"Error in embed lecture materials: {str(e)}")
# #         return jsonify({'success': False, 'error': str(e)}), 500


# # @app.route('/api/extract-and-save', methods=['POST'])
# # def extract_and_save():
# #     """Extract and save student answers."""
# #     try:
# #         data = request.get_json() or {}
# #         provider = data.get('provider', 'OpenAI')
# #         model = data.get('model', 'gpt-4o' if provider == 'OpenAI' else 'gemini-2.0-flash')
        
# #         logger.info(f"Extracting and saving answers with provider: {provider}, model: {model}")
# #         result = execute_script_with_args(
# #             extract_and_save_main,
# #             'extract_and_save',
# #             provider=provider,
# #             model=model,
# #             from_db=True
# #         )
        
# #         if result['success']:
# #             return jsonify({
# #                 'success': True,
# #                 'message': 'Student answers extracted and saved successfully',
# #                 'parameters': {
# #                     'provider': provider,
# #                     'model': model
# #                 }
# #             })
# #         else:
# #             return jsonify({'success': False, 'error': result['error']}), 500
            
# #     except Exception as e:
# #         logger.error(f"Error in extract and save: {str(e)}")
# #         return jsonify({'success': False, 'error': str(e)}), 500


# # @app.route('/api/embed-from-db', methods=['POST'])
# # def embed_from_db():
# #     """Embed student answers from database."""
# #     try:
# #         data = request.get_json() or {}
# #         provider = data.get('provider', 'OpenAI')
# #         model = data.get('model', 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001')
# #         module_code = data.get('module_code', 'EE3350')
# #         year = data.get('year', '2025')
# #         month = data.get('month', 'June')
        
# #         logger.info(f"Embedding from database with provider: {provider}, model: {model}")
        
# #         # Use direct function call instead of sys.argv manipulation
# #         result = execute_direct_call(
# #             embed_from_db_main,
# #             provider=provider,
# #             model=model,
# #             module_code=module_code,
# #             year=int(year),  # Make sure year is integer
# #             month=month
# #         )
        
# #         if result['success']:
# #             return jsonify({
# #                 'success': True,
# #                 'message': 'Student answers embedded successfully',
# #                 'parameters': {
# #                     'provider': provider,
# #                     'model': model,
# #                     'module_code': module_code,
# #                     'year': year,
# #                     'month': month
# #                 }
# #             })
# #         else:
# #             return jsonify({'success': False, 'error': result['error']}), 500
            
# #     except Exception as e:
# #         logger.error(f"Error in embed from db: {str(e)}")
# #         return jsonify({'success': False, 'error': str(e)}), 500


# # @app.route('/api/embed-model-answers', methods=['POST'])
# # def embed_model_answers():
# #     """Embed model answers."""
# #     try:
# #         data = request.get_json() or {}
# #         provider = data.get('provider', 'OpenAI')
# #         model = data.get('model', 'gpt-4o' if provider == 'OpenAI' else 'gemini-2.0-flash')
# #         embedder = data.get('embedder', 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001')
        
# #         logger.info(f"Embedding model answers with provider: {provider}, model: {model}")
# #         result = execute_script_with_args(
# #             embed_model_answers_main,
# #             'embed_model_answers',
# #             provider=provider,
# #             model=model,
# #             embedder=embedder
# #         )
        
# #         if result['success']:
# #             return jsonify({
# #                 'success': True,
# #                 'message': 'Model answers embedded successfully',
# #                 'parameters': {
# #                     'provider': provider,
# #                     'model': model,
# #                     'embedder': embedder
# #                 }
# #             })
# #         else:
# #             return jsonify({'success': False, 'error': result['error']}), 500
            
# #     except Exception as e:
# #         logger.error(f"Error in embed model answers: {str(e)}")
# #         return jsonify({'success': False, 'error': str(e)}), 500


# # @app.route('/api/mark-papers', methods=['POST'])
# # def mark_papers():
# #     """Mark all papers."""
# #     try:
# #         data = request.get_json() or {}
# #         provider = data.get('provider', 'OpenAI')
# #         llm = data.get('llm', 'gpt-4o' if provider == 'OpenAI' else 'gemini-2.0-flash')
# #         embedder = data.get('embedder', 'text-embedding-3-small' if provider == 'OpenAI' else 'embedding-001')
# #         module = data.get('module', 'EE3350')
# #         year = data.get('year', '2025')
# #         month = data.get('month', 'June')
        
# #         logger.info(f"Marking papers with provider: {provider}, llm: {llm}")
# #         result = execute_script_with_args(
# #             mark_all_papers_main,
# #             'mark_papers',
# #             provider=provider,
# #             llm=llm,
# #             embedder=embedder,
# #             module=module,
# #             year=year,
# #             month=month
# #         )
        
# #         if result['success']:
# #             return jsonify({
# #                 'success': True,
# #                 'message': 'Papers marked successfully',
# #                 'parameters': {
# #                     'provider': provider,
# #                     'llm': llm,
# #                     'embedder': embedder,
# #                     'module': module,
# #                     'year': year,
# #                     'month': month
# #                 }
# #             })
# #         else:
# #             return jsonify({'success': False, 'error': result['error']}), 500
            
# #     except Exception as e:
# #         logger.error(f"Error in mark papers: {str(e)}")
# #         return jsonify({'success': False, 'error': str(e)}), 500


# # @app.route('/api/run-full-evaluation', methods=['POST'])
# # def run_full_evaluation():
# #     """Run the complete evaluation pipeline."""
# #     try:
# #         data = request.get_json() or {}
# #         provider = data.get('provider', 'OpenAI')
# #         module_code = data.get('module_code', 'EE3350')
# #         year = data.get('year', '2025')
# #         month = data.get('month', 'June')
        
# #         logger.info(f"Starting full evaluation pipeline with provider: {provider}")
# #         logger.info(f"Module code received: {module_code}")
        
# #         # Set default models based on provider
# #         if provider == 'OpenAI':
# #             llm_model = 'gpt-4o'
# #             embed_model = 'text-embedding-3-small'
# #         elif provider == 'GoogleGemini':
# #             llm_model = 'gemini-2.0-flash'
# #             embed_model = 'models/embedding-001'
# #         else:
# #             llm_model = 'gpt-4o'
# #             embed_model = 'text-embedding-3-small'
        
# #         # Extract actual module code if it's a UUID (for embed_from_db and mark_papers)
# #         # These steps need the actual module code (like EE3350), not the UUID
# #         actual_module_code = get_actual_module_code(module_code)
# #         if actual_module_code != module_code:
# #             logger.info(f"Converted module identifier {module_code} to module code: {actual_module_code}")
        
# #         steps = [
# #             ('embed_lecture_materials', embed_lecture_materials_main, {
# #                 'provider': provider,
# #                 'model': llm_model,
# #                 'embedder': embed_model,
# #                 'module_code': module_code  # Use original for lecture materials
# #             }),
# #             ('extract_and_save', extract_and_save_main, {
# #                 'provider': provider,
# #                 'model': llm_model,
# #                 'from_db': True
# #             }),
# #             ('embed_from_db', embed_from_db_main, {
# #                 'provider': provider,
# #                 'model': embed_model,
# #                 'module_code': actual_module_code,  # Use actual module code
# #                 'year': year,
# #                 'month': month
# #             }),
# #             ('embed_model_answers', embed_model_answers_main, {
# #                 'provider': provider,
# #                 'model': llm_model,
# #                 'embedder': embed_model
# #             }),
# #             ('mark_papers', mark_all_papers_main, {
# #                 'provider': provider,
# #                 'llm': llm_model,
# #                 'embedder': embed_model.replace('models/', '') if 'models/' in embed_model else embed_model,
# #                 'module': actual_module_code,  # Use actual module code
# #                 'year': year,
# #                 'month': month
# #             })
# #         ]
        
# #         results = []
        
# #         for i, (step_name, step_func, step_kwargs) in enumerate(steps):
# #             logger.info(f"Running step {i+1}/5: {step_name}")
            
# #             # Use direct call for embed_from_db, sys.argv manipulation for others
# #             if step_name == 'embed_from_db':
# #                 # Convert year to int for direct call
# #                 direct_kwargs = step_kwargs.copy()
# #                 direct_kwargs['year'] = int(direct_kwargs['year'])
# #                 result = execute_direct_call(step_func, **direct_kwargs)
# #             else:
# #                 result = execute_script_with_args(step_func, step_name, **step_kwargs)
            
# #             results.append({
# #                 'step': step_name,
# #                 'success': result['success'],
# #                 'error': result.get('error')
# #             })
            
# #             # If a step fails, stop the pipeline
# #             if not result['success']:
# #                 logger.error(f"Pipeline failed at step {step_name}: {result.get('error')}")
# #                 break
        
# #         # Check if all steps completed successfully
# #         successful_steps = [r for r in results if r['success']]
# #         all_successful = len(successful_steps) == len(steps)
        
# #         return jsonify({
# #             'success': all_successful,
# #             'message': f'Pipeline completed: {len(successful_steps)}/{len(steps)} steps successful',
# #             'results': results,
# #             'parameters': {
# #                 'provider': provider,
# #                 'module_code': module_code,
# #                 'year': year,
# #                 'month': month,
# #                 'llm_model': llm_model,
# #                 'embed_model': embed_model
# #             }
# #         })
        
# #     except Exception as e:
# #         logger.error(f"Error in full evaluation: {str(e)}")
# #         return jsonify({'success': False, 'error': str(e)}), 500


# # @app.route('/api/status', methods=['GET'])
# # def get_status():
# #     """Get current API status and available endpoints."""
# #     return jsonify({
# #         'status': 'running',
# #         'version': '1.0.0',
# #         'endpoints': {
# #             'health': 'GET /api/health',
# #             'embed_lecture_materials': 'POST /api/embed-lecture-materials',
# #             'extract_and_save': 'POST /api/extract-and-save',
# #             'embed_from_db': 'POST /api/embed-from-db',
# #             'embed_model_answers': 'POST /api/embed-model-answers',
# #             'mark_papers': 'POST /api/mark-papers',
# #             'run_full_evaluation': 'POST /api/run-full-evaluation',
# #             'status': 'GET /api/status'
# #         },
# #         'supported_providers': ['OpenAI', 'GoogleGemini'],
# #         'default_models': {
# #             'OpenAI': {
# #                 'llm': 'gpt-4o',
# #                 'embedder': 'text-embedding-3-small'
# #             },
# #             'GoogleGemini': {
# #                 'llm': 'gemini-2.0-flash',
# #                 'embedder': 'models/embedding-001'
# #             }
# #         }
# #     })


# # if __name__ == '__main__':
# #     print("🚀 Starting AI Exam Evaluation Flask API Server...")
# #     print("📍 Available endpoints:")
# #     print("   GET  /api/health")
# #     print("   GET  /api/status")
# #     print("   POST /api/embed-lecture-materials")
# #     print("   POST /api/extract-and-save")
# #     print("   POST /api/embed-from-db")
# #     print("   POST /api/embed-model-answers")
# #     print("   POST /api/mark-papers")
# #     print("   POST /api/run-full-evaluation")
    
# #     app.run(host='0.0.0.0', port=7000, debug=True)

# # """
# # Simple Flask API Server for AI Exam Evaluation System
# # Provides direct REST endpoints for each evaluation step without task tracking.
# # """

# # from flask import Flask, request, jsonify
# # from flask_cors import CORS
# # import logging
# # import os
# # import sys
# # import argparse
# # from contextlib import contextmanager

# # # Add project root to path for imports
# # sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# # from src.scripts.embed_lecture_materials import main as embed_lecture_materials_main
# # from src.scripts.run_extract_and_save import main as extract_and_save_main  
# # from src.scripts.embed_from_db import main as embed_from_db_main
# # from src.scripts.embed_model_answers import main as embed_model_answers_main
# # from src.scripts.mark_all_papers import main as mark_all_papers_main

# # app = Flask(__name__)
# # CORS(app)

# # # Configure logging
# # logging.basicConfig(level=logging.INFO)
# # logger = logging.getLogger(__name__)


# # def get_actual_module_code(module_identifier):
# #     """
# #     Get the actual module code from module identifier.
# #     If it's already a module code (like EE3350), return as-is.
# #     If it's a UUID, fetch the actual module code from database.
# #     """
# #     try:
# #         # If it looks like a standard module code, return as-is
# #         if len(module_identifier) <= 10 and not '-' in module_identifier:
# #             return module_identifier
        
# #         # If it's a UUID, you should fetch from database
# #         # For now, using a fallback - you should implement database lookup
# #         if len(module_identifier) > 10 and '-' in module_identifier:
# #             logger.warning(f"UUID-like module identifier received: {module_identifier}")
# #             # TODO: Implement database lookup to get actual module code
# #             # Example: SELECT module_code FROM modules WHERE module_id = %s
# #             return 'EE3350'  # Fallback - replace with actual database lookup
        
# #         return module_identifier
        
# #     except Exception as e:
# #         logger.error(f"Error getting module code: {str(e)}")
# #         return 'EE3350'  # Safe fallback


# # @contextmanager
# # def temp_argv(new_argv):
# #     """Context manager to temporarily replace sys.argv."""
# #     original_argv = sys.argv.copy()
# #     try:
# #         sys.argv = new_argv
# #         yield
# #     finally:
# #         sys.argv = original_argv


# # def execute_direct_call(script_func, **kwargs):
# #     """Execute script function directly with parameters."""
# #     try:
# #         logger.info(f"Executing {script_func.__name__} with kwargs: {kwargs}")
# #         result = script_func(**kwargs)
# #         return {'success': True, 'message': 'Script executed successfully', 'result': result}
# #     except Exception as e:
# #         logger.error(f"Direct execution failed: {str(e)}")
# #         return {'success': False, 'error': str(e)}


# # def execute_script_with_args(script_func, script_name, **kwargs):
# #     """Execute a script with proper argument handling using sys.argv."""
# #     try:
# #         # Build the command line arguments based on the script
# #         script_file = f"{script_name}.py"
# #         args = [script_file]
        
# #         if script_name == 'embed_lecture_materials':
# #             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
# #             args.extend(['--model', kwargs.get('model', 'gpt-4o')])
# #             args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
# #             if kwargs.get('module_code'):
# #                 args.extend(['--module', kwargs.get('module_code')])
                
# #         elif script_name == 'extract_and_save':
# #             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
# #             args.extend(['--model', kwargs.get('model', 'gpt-4o')])
# #             if kwargs.get('from_db', True):
# #                 args.append('--from-db')
                
# #         elif script_name == 'embed_model_answers':
# #             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
# #             args.extend(['--model', kwargs.get('model', 'gpt-4o')])
# #             args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
            
# #         elif script_name == 'mark_papers':
# #             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
# #             args.extend(['--llm', kwargs.get('llm', 'gpt-4o')])
# #             args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
# #             args.extend(['--module', kwargs.get('module', 'EE3350')])
# #             args.extend(['--year', kwargs.get('year', '2025')])
# #             args.extend(['--month', kwargs.get('month', 'June')])
        
# #         logger.info(f"Executing {script_name} with args: {args}")
        
# #         # Execute with temporary sys.argv
# #         with temp_argv(args):
# #             result = script_func()
            
# #         return {'success': True, 'message': 'Script executed successfully', 'result': result}
        
# #     except Exception as e:
# #         logger.error(f"Script execution failed: {str(e)}")
# #         return {'success': False, 'error': str(e)}


# # def execute_script_legacy(script_func, args_dict):
# #     """Legacy script execution method using sys.argv manipulation."""
# #     try:
# #         # Build args list
# #         args = [script_func.__name__ + '.py']
# #         for key, value in args_dict.items():
# #             if value is not None:
# #                 if isinstance(value, bool) and value:
# #                     args.append(f'--{key.replace("_", "-")}')
# #                 else:
# #                     args.extend([f'--{key.replace("_", "-")}', str(value)])
        
# #         logger.info(f"Legacy execution with args: {args}")
        
# #         # Override sys.argv for the script
# #         with temp_argv(args):
# #             result = script_func()
        
# #         return {'success': True, 'message': 'Script executed successfully', 'result': result}
        
# #     except Exception as e:
# #         logger.error(f"Legacy script execution failed: {str(e)}")
# #         return {'success': False, 'error': str(e)}


# # @app.route('/api/health', methods=['GET'])
# # def health_check():
# #     """Health check endpoint."""
# #     return jsonify({'status': 'healthy'})


# # @app.route('/api/embed-lecture-materials', methods=['POST'])
# # def embed_lecture_materials():
# #     """Embed lecture materials from database."""
# #     try:
# #         data = request.get_json() or {}
# #         provider = data.get('provider', 'OpenAI')
# #         model = data.get('model', 'gpt-4o')
# #         embedder = data.get('embedder')
# #         module_code = data.get('module_code')
        
# #         # Set default embedders based on provider
# #         if not embedder:
# #             embedder = 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001'
        
# #         logger.info(f"Embedding lecture materials with provider: {provider}, model: {model}")
# #         result = execute_script_with_args(
# #             embed_lecture_materials_main, 
# #             'embed_lecture_materials',
# #             provider=provider,
# #             model=model,
# #             embedder=embedder,
# #             module_code=module_code
# #         )
        
# #         if result['success']:
# #             return jsonify({
# #                 'success': True,
# #                 'message': 'Lecture materials embedded successfully',
# #                 'parameters': {
# #                     'provider': provider,
# #                     'model': model,
# #                     'embedder': embedder,
# #                     'module_code': module_code
# #                 }
# #             })
# #         else:
# #             return jsonify({'success': False, 'error': result['error']}), 500
            
# #     except Exception as e:
# #         logger.error(f"Error in embed lecture materials: {str(e)}")
# #         return jsonify({'success': False, 'error': str(e)}), 500


# # @app.route('/api/extract-and-save', methods=['POST'])
# # def extract_and_save():
# #     """Extract and save student answers."""
# #     try:
# #         data = request.get_json() or {}
# #         provider = data.get('provider', 'OpenAI')
# #         model = data.get('model', 'gpt-4o' if provider == 'OpenAI' else 'gemini-2.0-flash')
        
# #         logger.info(f"Extracting and saving answers with provider: {provider}, model: {model}")
# #         result = execute_script_with_args(
# #             extract_and_save_main,
# #             'extract_and_save',
# #             provider=provider,
# #             model=model,
# #             from_db=True
# #         )
        
# #         if result['success']:
# #             return jsonify({
# #                 'success': True,
# #                 'message': 'Student answers extracted and saved successfully',
# #                 'parameters': {
# #                     'provider': provider,
# #                     'model': model
# #                 }
# #             })
# #         else:
# #             return jsonify({'success': False, 'error': result['error']}), 500
            
# #     except Exception as e:
# #         logger.error(f"Error in extract and save: {str(e)}")
# #         return jsonify({'success': False, 'error': str(e)}), 500


# # @app.route('/api/embed-from-db', methods=['POST'])
# # def embed_from_db():
# #     """Embed student answers from database."""
# #     try:
# #         data = request.get_json() or {}
# #         provider = data.get('provider', 'OpenAI')
# #         model = data.get('model', 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001')
# #         module_code = data.get('module_code', 'EE3350')
# #         year = data.get('year', '2025')
# #         month = data.get('month', 'June')
        
# #         logger.info(f"Embedding from database with provider: {provider}, model: {model}")
        
# #         # Use direct function call instead of sys.argv manipulation
# #         result = execute_direct_call(
# #             embed_from_db_main,
# #             provider=provider,
# #             model=model,
# #             module_code=module_code,
# #             year=int(year),  # Make sure year is integer
# #             month=month
# #         )
        
# #         if result['success']:
# #             return jsonify({
# #                 'success': True,
# #                 'message': 'Student answers embedded successfully',
# #                 'parameters': {
# #                     'provider': provider,
# #                     'model': model,
# #                     'module_code': module_code,
# #                     'year': year,
# #                     'month': month
# #                 }
# #             })
# #         else:
# #             return jsonify({'success': False, 'error': result['error']}), 500
            
# #     except Exception as e:
# #         logger.error(f"Error in embed from db: {str(e)}")
# #         return jsonify({'success': False, 'error': str(e)}), 500


# # @app.route('/api/embed-model-answers', methods=['POST'])
# # def embed_model_answers():
# #     """Embed model answers."""
# #     try:
# #         data = request.get_json() or {}
# #         provider = data.get('provider', 'OpenAI')
# #         model = data.get('model', 'gpt-4o' if provider == 'OpenAI' else 'gemini-2.0-flash')
# #         embedder = data.get('embedder', 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001')
        
# #         logger.info(f"Embedding model answers with provider: {provider}, model: {model}")
# #         result = execute_script_with_args(
# #             embed_model_answers_main,
# #             'embed_model_answers',
# #             provider=provider,
# #             model=model,
# #             embedder=embedder
# #         )
        
# #         if result['success']:
# #             return jsonify({
# #                 'success': True,
# #                 'message': 'Model answers embedded successfully',
# #                 'parameters': {
# #                     'provider': provider,
# #                     'model': model,
# #                     'embedder': embedder
# #                 }
# #             })
# #         else:
# #             return jsonify({'success': False, 'error': result['error']}), 500
            
# #     except Exception as e:
# #         logger.error(f"Error in embed model answers: {str(e)}")
# #         return jsonify({'success': False, 'error': str(e)}), 500


# # @app.route('/api/mark-papers', methods=['POST'])
# # def mark_papers():
# #     """Mark all papers."""
# #     try:
# #         data = request.get_json() or {}
# #         provider = data.get('provider', 'OpenAI')
# #         llm = data.get('llm', 'gpt-4o' if provider == 'OpenAI' else 'gemini-2.0-flash')
# #         embedder = data.get('embedder', 'text-embedding-3-small' if provider == 'OpenAI' else 'embedding-001')
# #         module = data.get('module', 'EE3350')
# #         year = data.get('year', '2025')
# #         month = data.get('month', 'June')
        
# #         logger.info(f"Marking papers with provider: {provider}, llm: {llm}")
# #         result = execute_script_with_args(
# #             mark_all_papers_main,
# #             'mark_papers',
# #             provider=provider,
# #             llm=llm,
# #             embedder=embedder,
# #             module=module,
# #             year=year,
# #             month=month
# #         )
        
# #         if result['success']:
# #             return jsonify({
# #                 'success': True,
# #                 'message': 'Papers marked successfully',
# #                 'parameters': {
# #                     'provider': provider,
# #                     'llm': llm,
# #                     'embedder': embedder,
# #                     'module': module,
# #                     'year': year,
# #                     'month': month
# #                 }
# #             })
# #         else:
# #             return jsonify({'success': False, 'error': result['error']}), 500
            
# #     except Exception as e:
# #         logger.error(f"Error in mark papers: {str(e)}")
# #         return jsonify({'success': False, 'error': str(e)}), 500


# # @app.route('/api/run-full-evaluation', methods=['POST'])
# # def run_full_evaluation():
# #     """Run the complete evaluation pipeline."""
# #     try:
# #         data = request.get_json() or {}
# #         provider = data.get('provider', 'OpenAI')
# #         module_code = data.get('module_code', 'EE3350')
# #         year = data.get('year', '2025')
# #         month = data.get('month', 'June')
        
# #         logger.info(f"Starting full evaluation pipeline with provider: {provider}")
# #         logger.info(f"Module code received: {module_code}")
        
# #         # Set default models based on provider
# #         if provider == 'OpenAI':
# #             llm_model = 'gpt-4o'
# #             embed_model = 'text-embedding-3-small'
# #         elif provider == 'GoogleGemini':
# #             llm_model = 'gemini-2.0-flash'
# #             embed_model = 'models/embedding-001'
# #         else:
# #             llm_model = 'gpt-4o'
# #             embed_model = 'text-embedding-3-small'
        
# #         # Extract actual module code if it's a UUID (for embed_from_db and mark_papers)
# #         # These steps need the actual module code (like EE3350), not the UUID
# #         actual_module_code = get_actual_module_code(module_code)
# #         if actual_module_code != module_code:
# #             logger.info(f"Converted module identifier {module_code} to module code: {actual_module_code}")
        
# #         steps = [
# #             ('embed_lecture_materials', embed_lecture_materials_main, {
# #                 'provider': provider,
# #                 'model': llm_model,
# #                 'embedder': embed_model,
# #                 'module_code': module_code  # Use original for lecture materials
# #             }),
# #             ('extract_and_save', extract_and_save_main, {
# #                 'provider': provider,
# #                 'model': llm_model,
# #                 'from_db': True
# #             }),
# #             ('embed_from_db', embed_from_db_main, {
# #                 'provider': provider,
# #                 'model': embed_model,
# #                 'module_code': actual_module_code,  # Use actual module code
# #                 'year': year,
# #                 'month': month
# #             }),
# #             ('embed_model_answers', embed_model_answers_main, {
# #                 'provider': provider,
# #                 'model': llm_model,
# #                 'embedder': embed_model
# #             }),
# #             ('mark_papers', mark_all_papers_main, {
# #                 'provider': provider,
# #                 'llm': llm_model,
# #                 'embedder': embed_model.replace('models/', '') if 'models/' in embed_model else embed_model,
# #                 'module': actual_module_code,  # Use actual module code
# #                 'year': year,
# #                 'month': month
# #             })
# #         ]
        
# #         results = []
        
# #         for i, (step_name, step_func, step_kwargs) in enumerate(steps):
# #             logger.info(f"Running step {i+1}/5: {step_name}")
            
# #             # Use direct call for embed_from_db, sys.argv manipulation for others
# #             if step_name == 'embed_from_db':
# #                 # Convert year to int for direct call
# #                 direct_kwargs = step_kwargs.copy()
# #                 direct_kwargs['year'] = int(direct_kwargs['year'])
# #                 result = execute_direct_call(step_func, **direct_kwargs)
# #             else:
# #                 result = execute_script_with_args(step_func, step_name, **step_kwargs)
            
# #             results.append({
# #                 'step': step_name,
# #                 'success': result['success'],
# #                 'error': result.get('error')
# #             })
            
# #             # If a step fails, stop the pipeline
# #             if not result['success']:
# #                 logger.error(f"Pipeline failed at step {step_name}: {result.get('error')}")
# #                 break
        
# #         # Check if all steps completed successfully
# #         successful_steps = [r for r in results if r['success']]
# #         all_successful = len(successful_steps) == len(steps)
        
# #         return jsonify({
# #             'success': all_successful,
# #             'message': f'Pipeline completed: {len(successful_steps)}/{len(steps)} steps successful',
# #             'results': results,
# #             'parameters': {
# #                 'provider': provider,
# #                 'module_code': module_code,
# #                 'year': year,
# #                 'month': month,
# #                 'llm_model': llm_model,
# #                 'embed_model': embed_model
# #             }
# #         })
        
# #     except Exception as e:
# #         logger.error(f"Error in full evaluation: {str(e)}")
# #         return jsonify({'success': False, 'error': str(e)}), 500


# # @app.route('/api/status', methods=['GET'])
# # def get_status():
# #     """Get current API status and available endpoints."""
# #     return jsonify({
# #         'status': 'running',
# #         'version': '1.0.0',
# #         'endpoints': {
# #             'health': 'GET /api/health',
# #             'embed_lecture_materials': 'POST /api/embed-lecture-materials',
# #             'extract_and_save': 'POST /api/extract-and-save',
# #             'embed_from_db': 'POST /api/embed-from-db',
# #             'embed_model_answers': 'POST /api/embed-model-answers',
# #             'mark_papers': 'POST /api/mark-papers',
# #             'run_full_evaluation': 'POST /api/run-full-evaluation',
# #             'status': 'GET /api/status'
# #         },
# #         'supported_providers': ['OpenAI', 'GoogleGemini'],
# #         'default_models': {
# #             'OpenAI': {
# #                 'llm': 'gpt-4o',
# #                 'embedder': 'text-embedding-3-small'
# #             },
# #             'GoogleGemini': {
# #                 'llm': 'gemini-2.0-flash',
# #                 'embedder': 'models/embedding-001'
# #             }
# #         }
# #     })


# # if __name__ == '__main__':
# #     print("🚀 Starting AI Exam Evaluation Flask API Server...")
# #     print("📍 Available endpoints:")
# #     print("   GET  /api/health")
# #     print("   GET  /api/status")
# #     print("   POST /api/embed-lecture-materials")
# #     print("   POST /api/extract-and-save")
# #     print("   POST /api/embed-from-db")
# #     print("   POST /api/embed-model-answers")
# #     print("   POST /api/mark-papers")
# #     print("   POST /api/run-full-evaluation")
    
# #     app.run(host='0.0.0.0', port=7000, debug=True)


# """
# Simple Flask API Server for AI Exam Evaluation System
# Provides direct REST endpoints for each evaluation step without task tracking.
# """

# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import logging
# import os
# import sys
# import argparse
# from contextlib import contextmanager

# # Add project root to path for imports
# sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# from src.scripts.embed_lecture_materials import main as embed_lecture_materials_main
# from src.scripts.run_extract_and_save import main as extract_and_save_main  
# from src.scripts.embed_from_db import main as embed_from_db_main
# from src.scripts.embed_model_answers import main as embed_model_answers_main
# from src.scripts.mark_all_papers import main as mark_all_papers_main

# app = Flask(__name__)
# CORS(app)

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)


# def get_actual_module_code(module_identifier):
#     """
#     Get the actual module code from module identifier.
#     If it's already a module code (like EE3350), return as-is.
#     If it's a UUID, fetch the actual module code from database.
#     """
#     try:
#         # If it looks like a standard module code, return as-is
#         if len(module_identifier) <= 10 and not '-' in module_identifier:
#             return module_identifier
        
#         # If it's a UUID, you should fetch from database
#         # For now, using a fallback - you should implement database lookup
#         if len(module_identifier) > 10 and '-' in module_identifier:
#             logger.warning(f"UUID-like module identifier received: {module_identifier}")
#             # TODO: Implement database lookup to get actual module code
#             # Example: SELECT module_code FROM modules WHERE module_id = %s
#             return 'EE3350'  # Fallback - replace with actual database lookup
        
#         return module_identifier
        
#     except Exception as e:
#         logger.error(f"Error getting module code: {str(e)}")
#         return 'EE3350'  # Safe fallback


# @contextmanager
# def temp_argv(new_argv):
#     """Context manager to temporarily replace sys.argv."""
#     original_argv = sys.argv.copy()
#     try:
#         sys.argv = new_argv
#         yield
#     finally:
#         sys.argv = original_argv


# def execute_direct_call(script_func, **kwargs):
#     """Execute script function directly with parameters."""
#     try:
#         logger.info(f"Executing {script_func.__name__} with kwargs: {kwargs}")
#         result = script_func(**kwargs)
#         return {'success': True, 'message': 'Script executed successfully', 'result': result}
#     except Exception as e:
#         logger.error(f"Direct execution failed: {str(e)}")
#         return {'success': False, 'error': str(e)}


# def execute_script_with_args(script_func, script_name, **kwargs):
#     """Execute a script with proper argument handling using sys.argv."""
#     try:
#         # Build the command line arguments based on the script
#         script_file = f"{script_name}.py"
#         args = [script_file]
        
#         if script_name == 'embed_lecture_materials':
#             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
#             args.extend(['--model', kwargs.get('model', 'gpt-4o')])
#             args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
#             if kwargs.get('module_code'):
#                 args.extend(['--module', kwargs.get('module_code')])
                
#         elif script_name == 'extract_and_save':
#             # FIX: Use the passed provider instead of hardcoding or defaulting incorrectly
#             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
#             args.extend(['--model', kwargs.get('model', 'gpt-4o')])
#             if kwargs.get('from_db', True):
#                 args.append('--from-db')
                
#         elif script_name == 'embed_model_answers':
#             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
#             args.extend(['--model', kwargs.get('model', 'gpt-4o')])
#             args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
            
#         elif script_name == 'mark_papers':
#             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
#             args.extend(['--llm', kwargs.get('llm', 'gpt-4o')])
#             args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
#             args.extend(['--module', kwargs.get('module')])
#             args.extend(['--year', kwargs.get('year')])
#             args.extend(['--month', kwargs.get('month')])
        
#         logger.info(f"Executing {script_name} with args: {args}")
        
#         # Execute with temporary sys.argv
#         with temp_argv(args):
#             result = script_func()
            
#         return {'success': True, 'message': 'Script executed successfully', 'result': result}
        
#     except Exception as e:
#         logger.error(f"Script execution failed: {str(e)}")
#         return {'success': False, 'error': str(e)}


# def execute_script_legacy(script_func, args_dict):
#     """Legacy script execution method using sys.argv manipulation."""
#     try:
#         # Build args list
#         args = [script_func.__name__ + '.py']
#         for key, value in args_dict.items():
#             if value is not None:
#                 if isinstance(value, bool) and value:
#                     args.append(f'--{key.replace("_", "-")}')
#                 else:
#                     args.extend([f'--{key.replace("_", "-")}', str(value)])
        
#         logger.info(f"Legacy execution with args: {args}")
        
#         # Override sys.argv for the script
#         with temp_argv(args):
#             result = script_func()
        
#         return {'success': True, 'message': 'Script executed successfully', 'result': result}
        
#     except Exception as e:
#         logger.error(f"Legacy script execution failed: {str(e)}")
#         return {'success': False, 'error': str(e)}


# @app.route('/api/health', methods=['GET'])
# def health_check():
#     """Health check endpoint."""
#     return jsonify({'status': 'healthy'})


# @app.route('/api/embed-lecture-materials', methods=['POST'])
# def embed_lecture_materials():
#     """Embed lecture materials from database."""
#     try:
#         data = request.get_json() or {}
#         provider = data.get('provider', 'OpenAI')
#         model = data.get('model', 'gpt-4o')
#         embedder = data.get('embedder')
#         module_code = data.get('module_code')
        
#         # Set default embedders based on provider
#         if not embedder:
#             embedder = 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001'
        
#         logger.info(f"Embedding lecture materials with provider: {provider}, model: {model}")
#         # result = execute_script_with_args(
#         #     embed_lecture_materials_main, 
#         #     'embed_lecture_materials',
#         #     provider=provider,
#         #     model=model,
#         #     embedder=embedder,
#         #     module_code=module_code
#         # )
#         result = execute_script_with_args(
#             extract_and_save_main,
#             'extract_and_save',
#             provider=provider,
#             model=llm_model,
#             from_db=True,
#             assessment_id=data.get('assessment_id'),
#             selected_submissions=data.get('selected_submissions')
#         )

#         if result['success']:
#             return jsonify({
#                 'success': True,
#                 'message': 'Lecture materials embedded successfully',
#                 'parameters': {
#                     'provider': provider,
#                     'model': model,
#                     'embedder': embedder,
#                     'module_code': module_code
#                 }
#             })
#         else:
#             return jsonify({'success': False, 'error': result['error']}), 500
            
#     except Exception as e:
#         logger.error(f"Error in embed lecture materials: {str(e)}")
#         return jsonify({'success': False, 'error': str(e)}), 500


# @app.route('/api/extract-and-save', methods=['POST'])
# def extract_and_save():
#     """Extract and save student answers."""
#     try:
#         data = request.get_json() or {}
#         provider = data.get('provider', 'OpenAI')
#         model = data.get('model', 'gpt-4o' if provider == 'OpenAI' else 'gemini-2.0-flash')
        
#         logger.info(f"Extracting and saving answers with provider: {provider}, model: {model}")
#         result = execute_script_with_args(
#             extract_and_save_main,
#             'extract_and_save',
#             provider=provider,
#             model=model,
#             from_db=True
#         )
        
#         if result['success']:
#             return jsonify({
#                 'success': True,
#                 'message': 'Student answers extracted and saved successfully',
#                 'parameters': {
#                     'provider': provider,
#                     'model': model
#                 }
#             })
#         else:
#             return jsonify({'success': False, 'error': result['error']}), 500
            
#     except Exception as e:
#         logger.error(f"Error in extract and save: {str(e)}")
#         return jsonify({'success': False, 'error': str(e)}), 500


# @app.route('/api/embed-from-db', methods=['POST'])
# def embed_from_db():
#     """Embed student answers from database."""
#     try:
#         data = request.get_json() or {}
#         provider = data.get('provider', 'OpenAI')
#         model = data.get('model', 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001')
#         module_code = data.get('module_code')
#         year = data.get('year')
#         month = data.get('month')
        
#         logger.info(f"Embedding from database with provider: {provider}, model: {model}")
        
#         # Use direct function call instead of sys.argv manipulation
#         result = execute_direct_call(
#             embed_from_db_main,
#             provider=provider,
#             model=model,
#             module_code=module_code,
#             year=int(year),  # Make sure year is integer
#             month=month
#         )
        
#         if result['success']:
#             return jsonify({
#                 'success': True,
#                 'message': 'Student answers embedded successfully',
#                 'parameters': {
#                     'provider': provider,
#                     'model': model,
#                     'module_code': module_code,
#                     'year': year,
#                     'month': month
#                 }
#             })
#         else:
#             return jsonify({'success': False, 'error': result['error']}), 500
            
#     except Exception as e:
#         logger.error(f"Error in embed from db: {str(e)}")
#         return jsonify({'success': False, 'error': str(e)}), 500


# @app.route('/api/embed-model-answers', methods=['POST'])
# def embed_model_answers():
#     """Embed model answers."""
#     try:
#         data = request.get_json() or {}
#         provider = data.get('provider', 'OpenAI')
#         model = data.get('model', 'gpt-4o' if provider == 'OpenAI' else 'gemini-2.0-flash')
#         embedder = data.get('embedder', 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001')
        
#         logger.info(f"Embedding model answers with provider: {provider}, model: {model}")
#         result = execute_script_with_args(
#             embed_model_answers_main,
#             'embed_model_answers',
#             provider=provider,
#             model=model,
#             embedder=embedder
#         )
        
#         if result['success']:
#             return jsonify({
#                 'success': True,
#                 'message': 'Model answers embedded successfully',
#                 'parameters': {
#                     'provider': provider,
#                     'model': model,
#                     'embedder': embedder
#                 }
#             })
#         else:
#             return jsonify({'success': False, 'error': result['error']}), 500
            
#     except Exception as e:
#         logger.error(f"Error in embed model answers: {str(e)}")
#         return jsonify({'success': False, 'error': str(e)}), 500


# @app.route('/api/mark-papers', methods=['POST'])
# def mark_papers():
#     """Mark all papers."""
#     try:
#         data = request.get_json() or {}
#         provider = data.get('provider', 'OpenAI')
#         llm = data.get('llm', 'gpt-4o' if provider == 'OpenAI' else 'gemini-2.0-flash')
#         embedder = data.get('embedder', 'text-embedding-3-small' if provider == 'OpenAI' else 'embedding-001')
#         module = data.get('module')
#         year = data.get('year')
#         month = data.get('month')
        
#         logger.info(f"Marking papers with provider: {provider}, llm: {llm}")
#         result = execute_script_with_args(
#             mark_all_papers_main,
#             'mark_papers',
#             provider=provider,
#             llm=llm,
#             embedder=embedder,
#             module=module,
#             year=year,
#             month=month
#         )
        
#         if result['success']:
#             return jsonify({
#                 'success': True,
#                 'message': 'Papers marked successfully',
#                 'parameters': {
#                     'provider': provider,
#                     'llm': llm,
#                     'embedder': embedder,
#                     'module': module,
#                     'year': year,
#                     'month': month
#                 }
#             })
#         else:
#             return jsonify({'success': False, 'error': result['error']}), 500
            
#     except Exception as e:
#         logger.error(f"Error in mark papers: {str(e)}")
#         return jsonify({'success': False, 'error': str(e)}), 500


# @app.route('/api/run-full-evaluation', methods=['POST'])
# def run_full_evaluation():
#     """Run the complete evaluation pipeline."""
#     try:
#         data = request.get_json() or {}
#         provider = data.get('provider', 'OpenAI')
#         module_code = data.get('module_code')
#         year = data.get('year')
#         month = data.get('month')
        
#         logger.info(f"Starting full evaluation pipeline with provider: {provider}")
#         logger.info(f"Module code received: {module_code}")
        
#         # Set default models based on provider
#         if provider == 'OpenAI':
#             llm_model = 'gpt-4o'
#             embed_model = 'text-embedding-3-small'
#         elif provider == 'GoogleGemini':
#             llm_model = 'gemini-2.0-flash'
#             embed_model = 'models/embedding-001'
#         else:
#             llm_model = 'gpt-4o'
#             embed_model = 'text-embedding-3-small'
        
#         # Extract actual module code if it's a UUID (for embed_from_db and mark_papers)
#         # These steps need the actual module code (like EE3350), not the UUID
#         actual_module_code = get_actual_module_code(module_code)
#         if actual_module_code != module_code:
#             logger.info(f"Converted module identifier {module_code} to module code: {actual_module_code}")
        
#         steps = [
#             ('embed_lecture_materials', embed_lecture_materials_main, {
#                 'provider': provider,
#                 'model': llm_model,
#                 'embedder': embed_model,
#                 'module_code': module_code  # Use original for lecture materials
#             }),
#             # ('extract_and_save', extract_and_save_main, {
#             #     'provider': provider,  # CRITICAL FIX: Pass the correct provider
#             #     'model': llm_model,    # CRITICAL FIX: Use the correct model for the provider
#             #     'from_db': True
#             # }),
#             ('extract_and_save', extract_and_save_main, {
#                 'provider': provider,
#                 'model': llm_model,
#                 'from_db': True,
#                 'assessment_id': data.get('assessment_id'), # ✅ pass to extraction
#                 'selected_submissions': data.get('selected_submissions')
#             }),
#             ('embed_from_db', embed_from_db_main, {
#                 'provider': provider,
#                 'model': embed_model,
#                 'module_code': actual_module_code,  # Use actual module code
#                 'year': year,
#                 'month': month
#             }),
#             ('embed_model_answers', embed_model_answers_main, {
#                 'provider': provider,
#                 'model': llm_model,
#                 'embedder': embed_model
#             }),
#             ('mark_papers', mark_all_papers_main, {
#                 'provider': provider,
#                 'llm': llm_model,
#                 'embedder': embed_model.replace('models/', '') if 'models/' in embed_model else embed_model,
#                 'module': actual_module_code,  # Use actual module code
#                 'year': year,
#                 'month': month
#             })
#         ]
        
#         results = []
        
#         for i, (step_name, step_func, step_kwargs) in enumerate(steps):
#             logger.info(f"Running step {i+1}/5: {step_name}")
            
#             # Debug: Log what provider is being used for each step
#             logger.info(f"Step {step_name} using provider: {step_kwargs.get('provider', 'NOT_SET')}")
            
#             # Use direct call for embed_from_db, sys.argv manipulation for others
#             if step_name == 'embed_from_db':
#                 # Convert year to int for direct call
#                 direct_kwargs = step_kwargs.copy()
#                 direct_kwargs['year'] = int(direct_kwargs['year'])
#                 result = execute_direct_call(step_func, **direct_kwargs)
#             else:
#                 result = execute_script_with_args(step_func, step_name, **step_kwargs)
            
#             results.append({
#                 'step': step_name,
#                 'success': result['success'],
#                 'error': result.get('error'),
#                 'provider_used': step_kwargs.get('provider', 'UNKNOWN')
#             })
            
#             # If a step fails, stop the pipeline
#             if not result['success']:
#                 logger.error(f"Pipeline failed at step {step_name}: {result.get('error')}")
#                 break
        
#         # Check if all steps completed successfully
#         successful_steps = [r for r in results if r['success']]
#         all_successful = len(successful_steps) == len(steps)
        
#         return jsonify({
#             'success': all_successful,
#             'message': f'Pipeline completed: {len(successful_steps)}/{len(steps)} steps successful',
#             'results': results,
#             'parameters': {
#                 'provider': provider,
#                 'module_code': module_code,
#                 'year': year,
#                 'month': month,
#                 'llm_model': llm_model,
#                 'embed_model': embed_model
#             }
#         })
        
#     except Exception as e:
#         logger.error(f"Error in full evaluation: {str(e)}")
#         return jsonify({'success': False, 'error': str(e)}), 500


# @app.route('/api/status', methods=['GET'])
# def get_status():
#     """Get current API status and available endpoints."""
#     return jsonify({
#         'status': 'running',
#         'version': '1.0.0',
#         'endpoints': {
#             'health': 'GET /api/health',
#             'embed_lecture_materials': 'POST /api/embed-lecture-materials',
#             'extract_and_save': 'POST /api/extract-and-save',
#             'embed_from_db': 'POST /api/embed-from-db',
#             'embed_model_answers': 'POST /api/embed-model-answers',
#             'mark_papers': 'POST /api/mark-papers',
#             'run_full_evaluation': 'POST /api/run-full-evaluation',
#             'status': 'GET /api/status'
#         },
#         'supported_providers': ['OpenAI', 'GoogleGemini'],
#         'default_models': {
#             'OpenAI': {
#                 'llm': 'gpt-4o',
#                 'embedder': 'text-embedding-3-small'
#             },
#             'GoogleGemini': {
#                 'llm': 'gemini-2.0-flash',
#                 'embedder': 'models/embedding-001'
#             }
#         }
#     })


# if __name__ == '__main__':
#     print("🚀 Starting AI Exam Evaluation Flask API Server...")
#     print("📍 Available endpoints:")
#     print("   GET  /api/health")
#     print("   GET  /api/status")
#     print("   POST /api/embed-lecture-materials")
#     print("   POST /api/extract-and-save")
#     print("   POST /api/embed-from-db")
#     print("   POST /api/embed-model-answers")
#     print("   POST /api/mark-papers")
#     print("   POST /api/run-full-evaluation")
    
#     app.run(host='0.0.0.0', port=7000, debug=True)

# """
# Enhanced Flask API Server for AI Exam Evaluation System
# Now supports assessment-specific filtering and database mapping.
# """

# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import logging
# import os
# import sys
# import psycopg2
# from psycopg2.extras import RealDictCursor
# from dotenv import load_dotenv
# from contextlib import contextmanager

# # Add project root to path for imports
# sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# from src.scripts.embed_lecture_materials import main as embed_lecture_materials_main
# from src.scripts.run_extract_and_save import main as extract_and_save_main  
# from src.scripts.embed_from_db import main as embed_from_db_main
# from src.scripts.embed_model_answers import main as embed_model_answers_main
# from src.scripts.mark_all_papers import main as mark_all_papers_main

# load_dotenv()
# app = Flask(__name__)
# CORS(app)

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)


# def get_database_connection():
#     """Get database connection using environment variables."""
#     try:
#         conn = psycopg2.connect(
#             host=os.getenv('POSTGRES_HOST'),
#             port=os.getenv('POSTGRES_PORT'),
#             database=os.getenv('POSTGRES_DB'),
#             user=os.getenv('POSTGRES_USER'),
#             password=os.getenv('POSTGRES_PASSWORD')
#         )
#         return conn
#     except Exception as e:
#         logger.error(f"Failed to connect to database: {e}")
#         raise


# def get_assessment_data(assessment_id):
#     """Get assessment data including module code and creation date."""
#     conn = get_database_connection()
#     try:
#         with conn.cursor(cursor_factory=RealDictCursor) as cur:
#             cur.execute("""
#                 SELECT a.assessment_id, a.created_on, m.module_code, m.module_name
#                 FROM "Assessment" a
#                 JOIN "Module" m ON a.module_id = m.module_id
#                 WHERE a.assessment_id = %s
#             """, (assessment_id,))
            
#             result = cur.fetchone()
#             if result:
#                 return dict(result)
#             return None
#     finally:
#         conn.close()


# def get_selected_submissions_data(selected_submission_ids):
#     """Get submission data for selected submissions."""
#     if not selected_submission_ids:
#         return []
        
#     conn = get_database_connection()
#     try:
#         with conn.cursor(cursor_factory=RealDictCursor) as cur:
#             # Convert list to tuple for SQL IN clause
#             submission_ids_tuple = tuple(selected_submission_ids)
#             placeholders = ','.join(['%s'] * len(submission_ids_tuple))
            
#             cur.execute(f"""
#                 SELECT s.submission_id, s.assessment_id, s.student_id, s.file_url,
#                        st.registration_number, a.assessment_id, m.module_code
#                 FROM "Submission" s
#                 JOIN "Student" st ON s.student_id = st.user_id
#                 JOIN "Assessment" a ON s.assessment_id = a.assessment_id
#                 JOIN "Module" m ON a.module_id = m.module_id
#                 WHERE s.submission_id IN ({placeholders})
#             """, submission_ids_tuple)
            
#             results = cur.fetchall()
#             return [dict(row) for row in results]
#     finally:
#         conn.close()


# def save_assessment_metadata(assessment_id, module_code, year, month, provider_suffix):
#     """Save assessment metadata to tracking tables."""
#     conn = get_database_connection()
#     try:
#         with conn.cursor() as cur:
#             # Update existing tables to include assessment_id
#             answers_table = f"student_answers_{provider_suffix}"
#             results_table = f"student_paper_results_{provider_suffix}"
#             graded_table = f"graded_student_answers_{provider_suffix}"
            
#             # Add assessment_id column if not exists
#             cur.execute(f"""
#                 ALTER TABLE {answers_table} 
#                 ADD COLUMN IF NOT EXISTS assessment_id TEXT;
#             """)
            
#             cur.execute(f"""
#                 ALTER TABLE {results_table} 
#                 ADD COLUMN IF NOT EXISTS assessment_id TEXT;
#             """)
            
#             cur.execute(f"""
#                 ALTER TABLE {graded_table} 
#                 ADD COLUMN IF NOT EXISTS assessment_id TEXT;
#             """)
            
#         conn.commit()
#     except Exception as e:
#         logger.error(f"Error updating database schema: {e}")
#     finally:
#         conn.close()


# def map_submission_to_db_data(submission_data, assessment_data, year, month, provider_suffix):
#     """Map submission data to database records with assessment context."""
#     conn = get_database_connection()
#     try:
#         with conn.cursor(cursor_factory=RealDictCursor) as cur:
#             answers_table = f"student_answers_{provider_suffix}"
            
#             for submission in submission_data:
#                 student_index = submission['registration_number']
#                 module_code = submission['module_code']
                
#                 # Update existing records with assessment_id
#                 cur.execute(f"""
#                     UPDATE {answers_table}
#                     SET assessment_id = %s
#                     WHERE student_index = %s 
#                     AND module_code = %s 
#                     AND exam_year = %s 
#                     AND exam_month = %s
#                     AND (assessment_id IS NULL OR assessment_id = '')
#                 """, (
#                     assessment_data['assessment_id'],
#                     student_index,
#                     module_code,
#                     year,
#                     month
#                 ))
            
#         conn.commit()
#         logger.info(f"Updated {len(submission_data)} records with assessment_id")
#     except Exception as e:
#         logger.error(f"Error mapping submission data: {e}")
#     finally:
#         conn.close()


# @contextmanager
# def temp_argv(new_argv):
#     """Context manager to temporarily replace sys.argv."""
#     original_argv = sys.argv.copy()
#     try:
#         sys.argv = new_argv
#         yield
#     finally:
#         sys.argv = original_argv


# def execute_script_with_args(script_func, script_name, **kwargs):
#     """Execute a script with proper argument handling using sys.argv."""
#     try:
#         script_file = f"{script_name}.py"
#         args = [script_file]
        
#         if script_name == 'embed_lecture_materials':
#             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
#             args.extend(['--model', kwargs.get('model', 'gpt-4o')])
#             args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
#             if kwargs.get('module_id'):
#                 args.extend(['--module', kwargs.get('module_id')])
                
#         elif script_name == 'extract_and_save':
#             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
#             args.extend(['--model', kwargs.get('model', 'gpt-4o')])
#             if kwargs.get('from_db', True):
#                 args.append('--from-db')
                
#         elif script_name == 'embed_model_answers':
#             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
#             args.extend(['--model', kwargs.get('model', 'gpt-4o')])
#             args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
            
#         elif script_name == 'mark_papers':
#             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
#             args.extend(['--llm', kwargs.get('llm', 'gpt-4o')])
#             args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
#             args.extend(['--module', kwargs.get('module_code', 'EE3350')])
#             args.extend(['--year', str(kwargs.get('year', 2025))])
#             args.extend(['--month', kwargs.get('month', 'June')])
        
#         logger.info(f"Executing {script_name} with args: {args}")
        
#         with temp_argv(args):
#             result = script_func()
            
#         return {'success': True, 'message': 'Script executed successfully', 'result': result}
        
#     except Exception as e:
#         logger.error(f"Script execution failed: {str(e)}")
#         return {'success': False, 'error': str(e)}


# def execute_direct_call(script_func, **kwargs):
#     """Execute script function directly with parameters."""
#     try:
#         logger.info(f"Executing {script_func.__name__} with kwargs: {kwargs}")
#         result = script_func(**kwargs)
#         return {'success': True, 'message': 'Script executed successfully', 'result': result}
#     except Exception as e:
#         logger.error(f"Direct execution failed: {str(e)}")
#         return {'success': False, 'error': str(e)}


# @app.route('/api/health', methods=['GET'])
# def health_check():
#     """Health check endpoint."""
#     return jsonify({'status': 'healthy'})


# @app.route('/api/run-full-evaluation', methods=['POST'])
# def run_full_evaluation():
#     """Run the complete evaluation pipeline for specific assessment."""
#     try:
#         data = request.get_json() or {}
#         provider = data.get('provider', 'OpenAI')
#         module_id = data.get('module_id')
#         assessment_id = data.get('assessment_id')
#         selected_submissions = data.get('selected_submissions', [])
#         year = data.get('year')
#         month = data.get('month')
        
#         logger.info(f"Starting full evaluation pipeline with provider: {provider}")
#         logger.info(f"Assessment ID: {assessment_id}, Module ID: {module_id}")
#         logger.info(f"Selected submissions: {len(selected_submissions)} submissions")
        
#         # Get assessment data from database
#         assessment_data = get_assessment_data(assessment_id)
#         if not assessment_data:
#             return jsonify({'success': False, 'error': f'Assessment {assessment_id} not found'}), 404
        
#         # Use assessment creation date for year/month if not provided
#         if not year or not month:
#             created_date = assessment_data['created_on']
#             year = created_date.year
#             month = created_date.strftime('%B')
        
#         module_code = assessment_data['module_code']
#         logger.info(f"Using module code: {module_code}, year: {year}, month: {month}")
        
#         # Get selected submissions data
#         submissions_data = get_selected_submissions_data(selected_submissions)
#         if not submissions_data:
#             return jsonify({'success': False, 'error': 'No valid submissions found'}), 400
        
#         # Set default models based on provider
#         if provider == 'OpenAI':
#             llm_model = 'gpt-4o'
#             embed_model = 'text-embedding-3-small'
#         elif provider == 'GoogleGemini':
#             llm_model = 'gemini-2.0-flash'
#             embed_model = 'models/embedding-001'
#         else:
#             llm_model = 'gpt-4o'
#             embed_model = 'text-embedding-3-small'
        
#         provider_suffix = 'openai' if provider == 'OpenAI' else 'gemini'
        
#         # Save assessment metadata and update schema
#         save_assessment_metadata(assessment_id, module_code, year, month, provider_suffix)
        
#         steps = [
#             ('embed_lecture_materials', embed_lecture_materials_main, {
#                 'provider': provider,
#                 'model': llm_model,
#                 'embedder': embed_model,
#                 'module_id': module_id
#             }),
#             ('extract_and_save', extract_and_save_main, {
#                 'provider': provider,
#                 'model': llm_model,
#                 'from_db': True
#             }),
#             ('embed_from_db', embed_from_db_main, {
#                 'provider': provider,
#                 'model': embed_model,
#                 'module_code': module_code,
#                 'year': year,
#                 'month': month
#             }),
#             ('embed_model_answers', embed_model_answers_main, {
#                 'provider': provider,
#                 'model': llm_model,
#                 'embedder': embed_model
#             }),
#             ('mark_papers', mark_all_papers_main, {
#                 'provider': provider,
#                 'llm': llm_model,
#                 'embedder': embed_model.replace('models/', '') if 'models/' in embed_model else embed_model,
#                 'module_code': module_code,
#                 'year': year,
#                 'month': month
#             })
#         ]
        
#         results = []
        
#         for i, (step_name, step_func, step_kwargs) in enumerate(steps):
#             logger.info(f"Running step {i+1}/5: {step_name}")
            
#             if step_name == 'embed_from_db':
#                 # Convert year to int for direct call
#                 direct_kwargs = step_kwargs.copy()
#                 direct_kwargs['year'] = int(direct_kwargs['year'])
#                 result = execute_direct_call(step_func, **direct_kwargs)
#             else:
#                 result = execute_script_with_args(step_func, step_name, **step_kwargs)
            
#             results.append({
#                 'step': step_name,
#                 'success': result['success'],
#                 'error': result.get('error'),
#                 'provider_used': step_kwargs.get('provider', 'UNKNOWN')
#             })
            
#             if not result['success']:
#                 logger.error(f"Pipeline failed at step {step_name}: {result.get('error')}")
#                 break
        
#         # Map submission data to database records
#         if all(r['success'] for r in results):
#             map_submission_to_db_data(submissions_data, assessment_data, year, month, provider_suffix)
        
#         successful_steps = [r for r in results if r['success']]
#         all_successful = len(successful_steps) == len(steps)
        
#         return jsonify({
#             'success': all_successful,
#             'message': f'Pipeline completed: {len(successful_steps)}/{len(steps)} steps successful',
#             'results': results,
#             'parameters': {
#                 'provider': provider,
#                 'assessment_id': assessment_id,
#                 'module_id': module_id,
#                 'module_code': module_code,
#                 'year': year,
#                 'month': month,
#                 'llm_model': llm_model,
#                 'embed_model': embed_model,
#                 'submissions_processed': len(submissions_data)
#             }
#         })
        
#     except Exception as e:
#         logger.error(f"Error in full evaluation: {str(e)}")
#         return jsonify({'success': False, 'error': str(e)}), 500


# @app.route('/api/embed-lecture-materials', methods=['POST'])
# def embed_lecture_materials():
#     """Embed lecture materials from database."""
#     try:
#         data = request.get_json() or {}
#         provider = data.get('provider', 'OpenAI')
#         model = data.get('model', 'gpt-4o')
#         embedder = data.get('embedder')
#         module_id = data.get('module_id')
        
#         if not embedder:
#             embedder = 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001'
        
#         logger.info(f"Embedding lecture materials with provider: {provider}, model: {model}")
#         result = execute_script_with_args(
#             embed_lecture_materials_main, 
#             'embed_lecture_materials',
#             provider=provider,
#             model=model,
#             embedder=embedder,
#             module_id=module_id
#         )
        
#         if result['success']:
#             return jsonify({
#                 'success': True,
#                 'message': 'Lecture materials embedded successfully',
#                 'parameters': {
#                     'provider': provider,
#                     'model': model,
#                     'embedder': embedder,
#                     'module_id': module_id
#                 }
#             })
#         else:
#             return jsonify({'success': False, 'error': result['error']}), 500
            
#     except Exception as e:
#         logger.error(f"Error in embed lecture materials: {str(e)}")
#         return jsonify({'success': False, 'error': str(e)}), 500


# @app.route('/api/extract-and-save', methods=['POST'])
# def extract_and_save():
#     """Extract and save student answers."""
#     try:
#         data = request.get_json() or {}
#         provider = data.get('provider', 'OpenAI')
#         model = data.get('model', 'gpt-4o' if provider == 'OpenAI' else 'gemini-2.0-flash')
        
#         logger.info(f"Extracting and saving answers with provider: {provider}, model: {model}")
#         result = execute_script_with_args(
#             extract_and_save_main,
#             'extract_and_save',
#             provider=provider,
#             model=model,
#             from_db=True
#         )
        
#         if result['success']:
#             return jsonify({
#                 'success': True,
#                 'message': 'Student answers extracted and saved successfully',
#                 'parameters': {
#                     'provider': provider,
#                     'model': model
#                 }
#             })
#         else:
#             return jsonify({'success': False, 'error': result['error']}), 500
            
#     except Exception as e:
#         logger.error(f"Error in extract and save: {str(e)}")
#         return jsonify({'success': False, 'error': str(e)}), 500


# @app.route('/api/embed-from-db', methods=['POST'])
# def embed_from_db():
#     """Embed student answers from database."""
#     try:
#         data = request.get_json() or {}
#         provider = data.get('provider', 'OpenAI')
#         model = data.get('model', 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001')
#         module_code = data.get('module_code')
#         year = data.get('year')
#         month = data.get('month')
        
#         logger.info(f"Embedding from database with provider: {provider}, model: {model}")
        
#         result = execute_direct_call(
#             embed_from_db_main,
#             provider=provider,
#             model=model,
#             module_code=module_code,
#             year=int(year),
#             month=month
#         )
        
#         if result['success']:
#             return jsonify({
#                 'success': True,
#                 'message': 'Student answers embedded successfully',
#                 'parameters': {
#                     'provider': provider,
#                     'model': model,
#                     'module_code': module_code,
#                     'year': year,
#                     'month': month
#                 }
#             })
#         else:
#             return jsonify({'success': False, 'error': result['error']}), 500
            
#     except Exception as e:
#         logger.error(f"Error in embed from db: {str(e)}")
#         return jsonify({'success': False, 'error': str(e)}), 500


# @app.route('/api/embed-model-answers', methods=['POST'])
# def embed_model_answers():
#     """Embed model answers."""
#     try:
#         data = request.get_json() or {}
#         provider = data.get('provider', 'OpenAI')
#         model = data.get('model', 'gpt-4o' if provider == 'OpenAI' else 'gemini-2.0-flash')
#         embedder = data.get('embedder', 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001')
        
#         logger.info(f"Embedding model answers with provider: {provider}, model: {model}")
#         result = execute_script_with_args(
#             embed_model_answers_main,
#             'embed_model_answers',
#             provider=provider,
#             model=model,
#             embedder=embedder
#         )
        
#         if result['success']:
#             return jsonify({
#                 'success': True,
#                 'message': 'Model answers embedded successfully',
#                 'parameters': {
#                     'provider': provider,
#                     'model': model,
#                     'embedder': embedder
#                 }
#             })
#         else:
#             return jsonify({'success': False, 'error': result['error']}), 500
            
#     except Exception as e:
#         logger.error(f"Error in embed model answers: {str(e)}")
#         return jsonify({'success': False, 'error': str(e)}), 500


# @app.route('/api/mark-papers', methods=['POST'])
# def mark_papers():
#     """Mark all papers."""
#     try:
#         data = request.get_json() or {}
#         provider = data.get('provider', 'OpenAI')
#         llm = data.get('llm', 'gpt-4o' if provider == 'OpenAI' else 'gemini-2.0-flash')
#         embedder = data.get('embedder', 'text-embedding-3-small' if provider == 'OpenAI' else 'embedding-001')
#         module_code = data.get('module_code')
#         year = data.get('year')
#         month = data.get('month')
        
#         logger.info(f"Marking papers with provider: {provider}, llm: {llm}")
#         result = execute_script_with_args(
#             mark_all_papers_main,
#             'mark_papers',
#             provider=provider,
#             llm=llm,
#             embedder=embedder,
#             module_code=module_code,
#             year=year,
#             month=month
#         )
        
#         if result['success']:
#             return jsonify({
#                 'success': True,
#                 'message': 'Papers marked successfully',
#                 'parameters': {
#                     'provider': provider,
#                     'llm': llm,
#                     'embedder': embedder,
#                     'module_code': module_code,
#                     'year': year,
#                     'month': month
#                 }
#             })
#         else:
#             return jsonify({'success': False, 'error': result['error']}), 500
            
#     except Exception as e:
#         logger.error(f"Error in mark papers: {str(e)}")
#         return jsonify({'success': False, 'error': str(e)}), 500


# @app.route('/api/status', methods=['GET'])
# def get_status():
#     """Get current API status and available endpoints."""
#     return jsonify({
#         'status': 'running',
#         'version': '2.0.0',
#         'endpoints': {
#             'health': 'GET /api/health',
#             'embed_lecture_materials': 'POST /api/embed-lecture-materials',
#             'extract_and_save': 'POST /api/extract-and-save',
#             'embed_from_db': 'POST /api/embed-from-db',
#             'embed_model_answers': 'POST /api/embed-model-answers',
#             'mark_papers': 'POST /api/mark-papers',
#             'run_full_evaluation': 'POST /api/run-full-evaluation',
#             'status': 'GET /api/status'
#         },
#         'supported_providers': ['OpenAI', 'GoogleGemini'],
#         'features': [
#             'Assessment-specific evaluation',
#             'Database mapping and filtering',
#             'Submission selection support'
#         ]
#     })


# if __name__ == '__main__':
#     print("🚀 Starting Enhanced AI Exam Evaluation Flask API Server...")
#     print("📍 Available endpoints:")
#     print("   GET  /api/health")
#     print("   GET  /api/status")
#     print("   POST /api/embed-lecture-materials")
#     print("   POST /api/extract-and-save")
#     print("   POST /api/embed-from-db")
#     print("   POST /api/embed-model-answers")
#     print("   POST /api/mark-papers")
#     print("   POST /api/run-full-evaluation")
#     print("🎯 New Features:")
#     print("   • Assessment-specific filtering")
#     print("   • Database relationship mapping")
#     print("   • Selected submissions support")
    
#     app.run(host='0.0.0.0', port=7000, debug=True)

# """
# Enhanced Flask API Server for AI Exam Evaluation System
# Now supports proper assessment-specific filtering and database mapping.
# """

# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import logging
# import os
# import sys
# import psycopg2
# from psycopg2.extras import RealDictCursor
# from dotenv import load_dotenv
# from contextlib import contextmanager
# from datetime import datetime

# # Add project root to path for imports
# sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# from src.scripts.embed_lecture_materials import main as embed_lecture_materials_main
# from src.scripts.run_extract_and_save import main as extract_and_save_main  
# from src.scripts.embed_from_db import main as embed_from_db_main
# from src.scripts.embed_model_answers import main as embed_model_answers_main
# from src.scripts.mark_all_papers import main as mark_all_papers_main

# load_dotenv()
# app = Flask(__name__)
# CORS(app)

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)


# def get_database_connection():
#     """Get database connection using environment variables."""
#     try:
#         conn = psycopg2.connect(
#             host=os.getenv('POSTGRES_HOST'),
#             port=os.getenv('POSTGRES_PORT'),
#             database=os.getenv('POSTGRES_DB'),
#             user=os.getenv('POSTGRES_USER'),
#             password=os.getenv('POSTGRES_PASSWORD')
#         )
#         return conn
#     except Exception as e:
#         logger.error(f"Failed to connect to database: {e}")
#         raise


# def get_assessment_data(assessment_id):
#     """Get comprehensive assessment data including module code and creation date."""
#     conn = get_database_connection()
#     try:
#         with conn.cursor(cursor_factory=RealDictCursor) as cur:
#             cur.execute("""
#                 SELECT a.assessment_id, a.created_on, a.module_id,
#                        m.module_code, m.module_name
#                 FROM "Assessment" a
#                 JOIN "Module" m ON a.module_id = m.module_id
#                 WHERE a.assessment_id = %s
#             """, (assessment_id,))
            
#             result = cur.fetchone()
#             if result:
#                 return dict(result)
#             return None
#     finally:
#         conn.close()


# def get_selected_submissions_data(selected_submission_ids):
#     """Get submission data for selected submissions with proper registration numbers."""
#     if not selected_submission_ids:
#         return []
        
#     conn = get_database_connection()
#     try:
#         with conn.cursor(cursor_factory=RealDictCursor) as cur:
#             # Convert list to tuple for SQL IN clause
#             submission_ids_tuple = tuple(selected_submission_ids)
#             placeholders = ','.join(['%s'] * len(submission_ids_tuple))
            
#             cur.execute(f"""
#                 SELECT s.submission_id, s.assessment_id, s.student_id, s.file_url,
#                        st.registration_number, a.assessment_id, m.module_code
#                 FROM "Submission" s
#                 JOIN "Student" st ON s.student_id = st.user_id
#                 JOIN "Assessment" a ON s.assessment_id = a.assessment_id
#                 JOIN "Module" m ON a.module_id = m.module_id
#                 WHERE s.submission_id IN ({placeholders})
#             """, submission_ids_tuple)
            
#             results = cur.fetchall()
#             return [dict(row) for row in results]
#     finally:
#         conn.close()


# def get_assessment_related_lecture_materials(assessment_id):
#     """Get lecture materials specifically related to this assessment through module and lessons."""
#     conn = get_database_connection()
#     try:
#         with conn.cursor(cursor_factory=RealDictCursor) as cur:
#             cur.execute("""
#                 SELECT DISTINCT lm.material_id, lm.lesson_id, lm.file_name, lm.file_url, 
#                        lm.uploaded_on, lm.description,
#                        l.lesson_id, l.title as lesson_title,
#                        m.module_id, m.module_code, m.module_name
#                 FROM "Assessment" a
#                 JOIN "Module" m ON a.module_id = m.module_id
#                 JOIN "Lesson" l ON m.module_id = l.module_id
#                 JOIN "LectureMaterial" lm ON l.lesson_id = lm.lesson_id
#                 WHERE a.assessment_id = %s
#                 ORDER BY lm.uploaded_on ASC
#             """, (assessment_id,))
            
#             results = cur.fetchall()
#             logger.info(f"Found {len(results)} lecture materials for assessment {assessment_id}")
#             return [dict(row) for row in results]
#     finally:
#         conn.close()


# def map_submissions_to_student_indexes(submissions_data):
#     """Extract registration numbers (student indexes) from submission data."""
#     return [sub['registration_number'] for sub in submissions_data]


# def update_student_tables_with_assessment_context(assessment_data, year, month, provider_suffix, student_indexes):
#     """Update student answer tables to include assessment_id for proper filtering."""
#     conn = get_database_connection()
#     try:
#         with conn.cursor() as cur:
#             answers_table = f"student_answers_{provider_suffix}"
#             results_table = f"student_paper_results_{provider_suffix}"  
#             graded_table = f"graded_student_answers_{provider_suffix}"
            
#             # Ensure assessment_id column exists
#             for table in [answers_table, results_table, graded_table]:
#                 cur.execute(f"""
#                     ALTER TABLE "{table}" 
#                     ADD COLUMN IF NOT EXISTS assessment_id TEXT;
#                 """)
            
#             # Update records for the specific student indexes
#             for student_index in student_indexes:
#                 # Update answers table
#                 cur.execute(f"""
#                     UPDATE "{answers_table}"
#                     SET assessment_id = %s
#                     WHERE student_index = %s 
#                     AND module_code = %s 
#                     AND exam_year = %s 
#                     AND exam_month = %s
#                     AND (assessment_id IS NULL OR assessment_id = '')
#                 """, (
#                     assessment_data['assessment_id'],
#                     student_index,
#                     assessment_data['module_code'],
#                     year,
#                     month
#                 ))
                
#                 # Update results table  
#                 cur.execute(f"""
#                     UPDATE "{results_table}"
#                     SET assessment_id = %s
#                     WHERE student_index = %s 
#                     AND module_code = %s 
#                     AND exam_year = %s 
#                     AND exam_month = %s
#                     AND (assessment_id IS NULL OR assessment_id = '')
#                 """, (
#                     assessment_data['assessment_id'],
#                     student_index,
#                     assessment_data['module_code'],
#                     year,
#                     month
#                 ))
                
#                 # Update graded answers table
#                 cur.execute(f"""
#                     UPDATE "{graded_table}"
#                     SET assessment_id = %s
#                     WHERE student_index = %s 
#                     AND module_code = %s 
#                     AND exam_year = %s 
#                     AND exam_month = %s
#                     AND (assessment_id IS NULL OR assessment_id = '')
#                 """, (
#                     assessment_data['assessment_id'],
#                     student_index,
#                     assessment_data['module_code'],
#                     year,
#                     month
#                 ))
            
#         conn.commit()
#         logger.info(f"Updated student tables for {len(student_indexes)} students with assessment_id")
        
#     except Exception as e:
#         logger.error(f"Error updating student tables: {e}")
#         conn.rollback()
#         raise
#     finally:
#         conn.close()


# @contextmanager
# def temp_argv(new_argv):
#     """Context manager to temporarily replace sys.argv."""
#     original_argv = sys.argv.copy()
#     try:
#         sys.argv = new_argv
#         yield
#     finally:
#         sys.argv = original_argv


# def execute_script_with_args(script_func, script_name, **kwargs):
#     """Execute a script with proper argument handling using sys.argv."""
#     try:
#         script_file = f"{script_name}.py"
#         args = [script_file]
        
#         if script_name == 'embed_lecture_materials':
#             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
#             args.extend(['--model', kwargs.get('model', 'gpt-4o')])
#             args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
#             if kwargs.get('assessment_id'):
#                 args.extend(['--assessment-id', kwargs.get('assessment_id')])
                
#         elif script_name == 'extract_and_save':
#             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
#             args.extend(['--model', kwargs.get('model', 'gpt-4o')])
#             if kwargs.get('from_db', True):
#                 args.append('--from-db')
#             # Pass selected student indexes
#             if kwargs.get('student_indexes'):
#                 args.extend(['--student-indexes'] + kwargs.get('student_indexes'))
                
#         elif script_name == 'embed_model_answers':
#             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
#             args.extend(['--model', kwargs.get('model', 'gpt-4o')])
#             args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
#             if kwargs.get('assessment_id'):
#                 args.extend(['--assessment-id', kwargs.get('assessment_id')])
            
#         elif script_name == 'mark_papers':
#             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
#             args.extend(['--llm', kwargs.get('llm', 'gpt-4o')])
#             args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
#             args.extend(['--module', kwargs.get('module_code', 'EE3350')])
#             args.extend(['--year', str(kwargs.get('year', 2025))])
#             args.extend(['--month', kwargs.get('month', 'June')])
#             if kwargs.get('student_indexes'):
#                 args.extend(['--student-indexes'] + kwargs.get('student_indexes'))
#             if kwargs.get('assessment_id'):
#                 args.extend(['--assessment-id', kwargs.get('assessment_id')])
        
#         logger.info(f"Executing {script_name} with args: {args}")
        
#         with temp_argv(args):
#             result = script_func()
            
#         return {'success': True, 'message': 'Script executed successfully', 'result': result}
        
#     except Exception as e:
#         logger.error(f"Script execution failed: {str(e)}")
#         return {'success': False, 'error': str(e)}


# def execute_direct_call(script_func, **kwargs):
#     """Execute script function directly with parameters."""
#     try:
#         logger.info(f"Executing {script_func.__name__} with kwargs: {kwargs}")
#         result = script_func(**kwargs)
#         return {'success': True, 'message': 'Script executed successfully', 'result': result}
#     except Exception as e:
#         logger.error(f"Direct execution failed: {str(e)}")
#         return {'success': False, 'error': str(e)}


# @app.route('/api/run-full-evaluation', methods=['POST'])
# def run_full_evaluation():
#     """Run the complete evaluation pipeline for specific assessment with proper data mapping."""
#     try:
#         data = request.get_json() or {}
#         provider = data.get('provider', 'OpenAI')
#         module_id = data.get('module_id')
#         assessment_id = data.get('assessment_id')
#         selected_submissions = data.get('selected_submissions', [])
#         year = data.get('year')
#         month = data.get('month')
        
#         logger.info(f"Starting full evaluation pipeline with provider: {provider}")
#         logger.info(f"Assessment ID: {assessment_id}, Module ID: {module_id}")
#         logger.info(f"Selected submissions: {len(selected_submissions)} submissions")
        
#         # Get assessment data from database
#         assessment_data = get_assessment_data(assessment_id)
#         if not assessment_data:
#             return jsonify({'success': False, 'error': f'Assessment {assessment_id} not found'}), 404
        
#         # Use assessment creation date for year/month if not provided
#         if not year or not month:
#             created_date = assessment_data['created_on']
#             year = created_date.year
#             month = created_date.strftime('%B')
        
#         module_code = assessment_data['module_code']
#         logger.info(f"Using module code: {module_code}, year: {year}, month: {month}")
        
#         # Get selected submissions data with registration numbers
#         submissions_data = get_selected_submissions_data(selected_submissions)
#         if not submissions_data:
#             return jsonify({'success': False, 'error': 'No valid submissions found'}), 400
        
#         # Extract student indexes (registration numbers)
#         student_indexes = map_submissions_to_student_indexes(submissions_data)
#         logger.info(f"Processing student indexes: {student_indexes}")
        
#         # Set default models based on provider
#         if provider == 'OpenAI':
#             llm_model = 'gpt-4o'
#             embed_model = 'text-embedding-3-small'
#         elif provider == 'GoogleGemini':
#             llm_model = 'gemini-2.0-flash'
#             embed_model = 'models/embedding-001'
#         else:
#             llm_model = 'gpt-4o'
#             embed_model = 'text-embedding-3-small'
        
#         provider_suffix = 'openai' if provider == 'OpenAI' else 'gemini'
        
#         # Get assessment-related lecture materials
#         lecture_materials = get_assessment_related_lecture_materials(assessment_id)
#         logger.info(f"Found {len(lecture_materials)} lecture materials for this assessment")
        
#         # Update student tables with assessment context
#         update_student_tables_with_assessment_context(
#             assessment_data, year, month, provider_suffix, student_indexes
#         )
        
#         steps = [
#             ('embed_lecture_materials', embed_lecture_materials_main, {
#                 'provider': provider,
#                 'model': llm_model,
#                 'embedder': embed_model,
#                 'assessment_id': assessment_id  # Pass assessment_id to filter lecture materials
#             }),
#             ('extract_and_save', extract_and_save_main, {
#                 'provider': provider,
#                 'model': llm_model,
#                 'from_db': True,
#                 'student_indexes': student_indexes,  # Pass selected student indexes
#                 'assessment_id': assessment_id
#             }),
#             ('embed_from_db', embed_from_db_main, {
#                 'provider': provider,
#                 'model': embed_model,
#                 'module_code': module_code,
#                 'year': year,
#                 'month': month,
#                 'student_indexes': student_indexes,  # Pass selected student indexes
#                 'assessment_id': assessment_id
#             }),
#             ('embed_model_answers', embed_model_answers_main, {
#                 'provider': provider,
#                 'model': llm_model,
#                 'embedder': embed_model,
#                 'assessment_id': assessment_id  # Pass assessment_id for proper filtering
#             }),
#             ('mark_papers', mark_all_papers_main, {
#                 'provider': provider,
#                 'llm': llm_model,
#                 'embedder': embed_model.replace('models/', '') if 'models/' in embed_model else embed_model,
#                 'module_code': module_code,
#                 'year': year,
#                 'month': month,
#                 'student_indexes': student_indexes,  # Pass selected student indexes
#                 'assessment_id': assessment_id
#             })
#         ]
        
#         results = []
        
#         for i, (step_name, step_func, step_kwargs) in enumerate(steps):
#             logger.info(f"Running step {i+1}/5: {step_name}")
            
#             if step_name == 'embed_from_db':
#                 # Convert year to int for direct call
#                 direct_kwargs = step_kwargs.copy()
#                 direct_kwargs['year'] = int(direct_kwargs['year'])
#                 result = execute_direct_call(step_func, **direct_kwargs)
#             else:
#                 result = execute_script_with_args(step_func, step_name, **step_kwargs)
            
#             results.append({
#                 'step': step_name,
#                 'success': result['success'],
#                 'error': result.get('error'),
#                 'provider_used': step_kwargs.get('provider', 'UNKNOWN')
#             })
            
#             if not result['success']:
#                 logger.error(f"Pipeline failed at step {step_name}: {result.get('error')}")
#                 break
        
#         successful_steps = [r for r in results if r['success']]
#         all_successful = len(successful_steps) == len(steps)
        
#         return jsonify({
#             'success': all_successful,
#             'message': f'Pipeline completed: {len(successful_steps)}/{len(steps)} steps successful',
#             'results': results,
#             'parameters': {
#                 'provider': provider,
#                 'assessment_id': assessment_id,
#                 'module_id': module_id,
#                 'module_code': module_code,
#                 'year': year,
#                 'month': month,
#                 'llm_model': llm_model,
#                 'embed_model': embed_model,
#                 'submissions_processed': len(submissions_data),
#                 'student_indexes_processed': student_indexes,
#                 'lecture_materials_found': len(lecture_materials)
#             }
#         })
        
#     except Exception as e:
#         logger.error(f"Error in full evaluation: {str(e)}")
#         return jsonify({'success': False, 'error': str(e)}), 500


# # Keep all existing endpoints...
# @app.route('/api/health', methods=['GET'])
# def health_check():
#     """Health check endpoint."""
#     return jsonify({'status': 'healthy'})


# @app.route('/api/embed-lecture-materials', methods=['POST'])
# def embed_lecture_materials():
#     """Embed lecture materials from database."""
#     try:
#         data = request.get_json() or {}
#         provider = data.get('provider', 'OpenAI')
#         model = data.get('model', 'gpt-4o')
#         embedder = data.get('embedder')
#         assessment_id = data.get('assessment_id')  # Added assessment_id support
        
#         if not embedder:
#             embedder = 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001'
        
#         logger.info(f"Embedding lecture materials with provider: {provider}, model: {model}")
#         result = execute_script_with_args(
#             embed_lecture_materials_main, 
#             'embed_lecture_materials',
#             provider=provider,
#             model=model,
#             embedder=embedder,
#             assessment_id=assessment_id
#         )
        
#         if result['success']:
#             return jsonify({
#                 'success': True,
#                 'message': 'Lecture materials embedded successfully',
#                 'parameters': {
#                     'provider': provider,
#                     'model': model,
#                     'embedder': embedder,
#                     'assessment_id': assessment_id
#                 }
#             })
#         else:
#             return jsonify({'success': False, 'error': result['error']}), 500
            
#     except Exception as e:
#         logger.error(f"Error in embed lecture materials: {str(e)}")
#         return jsonify({'success': False, 'error': str(e)}), 500


# @app.route('/api/status', methods=['GET'])
# def get_status():
#     """Get current API status and available endpoints."""
#     return jsonify({
#         'status': 'running',
#         'version': '2.1.0',
#         'endpoints': {
#             'health': 'GET /api/health',
#             'embed_lecture_materials': 'POST /api/embed-lecture-materials',
#             'extract_and_save': 'POST /api/extract-and-save',
#             'embed_from_db': 'POST /api/embed-from-db',
#             'embed_model_answers': 'POST /api/embed-model-answers',
#             'mark_papers': 'POST /api/mark-papers',
#             'run_full_evaluation': 'POST /api/run-full-evaluation',
#             'status': 'GET /api/status'
#         },
#         'supported_providers': ['OpenAI', 'GoogleGemini'],
#         'features': [
#             'Assessment-specific evaluation',
#             'Database mapping and filtering',
#             'Submission selection support',
#             'Student index filtering',
#             'Assessment-related lecture materials filtering'
#         ]
#     })


# if __name__ == '__main__':
#     print("🚀 Starting Enhanced AI Exam Evaluation Flask API Server...")
#     print("📍 Available endpoints:")
#     print("   GET  /api/health")
#     print("   GET  /api/status")
#     print("   POST /api/embed-lecture-materials")
#     print("   POST /api/extract-and-save")
#     print("   POST /api/embed-from-db")
#     print("   POST /api/embed-model-answers")
#     print("   POST /api/mark-papers")
#     print("   POST /api/run-full-evaluation")
#     print("🎯 Enhanced Features:")
#     print("   • Assessment-specific lecture materials filtering")
#     print("   • Student index (registration number) filtering")
#     print("   • Proper database relationship mapping")
#     print("   • Context-aware embedding and evaluation")
    
#     app.run(host='0.0.0.0', port=7000, debug=True)

# """
# Enhanced Flask API Server for AI Exam Evaluation System
# Now supports proper assessment-specific filtering and database mapping.
# """

# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import logging
# import os
# import sys
# import psycopg2
# from psycopg2.extras import RealDictCursor
# from dotenv import load_dotenv
# from contextlib import contextmanager
# from datetime import datetime

# # Add project root to path for imports
# sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# from src.scripts.embed_lecture_materials import main as embed_lecture_materials_main
# from src.scripts.run_extract_and_save import main as extract_and_save_main  
# from src.scripts.embed_from_db import main as embed_from_db_main
# from src.scripts.embed_model_answers import main as embed_model_answers_main
# from src.scripts.mark_all_papers import main as mark_all_papers_main

# load_dotenv()
# app = Flask(__name__)
# CORS(app)

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)


# def get_database_connection():
#     """Get database connection using environment variables."""
#     try:
#         conn = psycopg2.connect(
#             host=os.getenv('POSTGRES_HOST'),
#             port=os.getenv('POSTGRES_PORT'),
#             database=os.getenv('POSTGRES_DB'),
#             user=os.getenv('POSTGRES_USER'),
#             password=os.getenv('POSTGRES_PASSWORD')
#         )
#         return conn
#     except Exception as e:
#         logger.error(f"Failed to connect to database: {e}")
#         raise


# def get_assessment_data(assessment_id):
#     """Get comprehensive assessment data including module code and creation date."""
#     conn = get_database_connection()
#     try:
#         with conn.cursor(cursor_factory=RealDictCursor) as cur:
#             cur.execute("""
#                 SELECT a.assessment_id, a.created_on, a.module_id,
#                        m.module_code, m.module_name
#                 FROM "Assessment" a
#                 JOIN "Module" m ON a.module_id = m.module_id
#                 WHERE a.assessment_id = %s
#             """, (assessment_id,))
            
#             result = cur.fetchone()
#             if result:
#                 return dict(result)
#             return None
#     finally:
#         conn.close()


# def get_selected_submissions_data(selected_submission_ids):
#     """Get submission data for selected submissions with proper mapping."""
#     if not selected_submission_ids:
#         return []
        
#     conn = get_database_connection()
#     try:
#         with conn.cursor(cursor_factory=RealDictCursor) as cur:
#             # Convert list to tuple for SQL IN clause
#             submission_ids_tuple = tuple(selected_submission_ids)
#             placeholders = ','.join(['%s'] * len(submission_ids_tuple))
            
#             cur.execute(f"""
#                 SELECT s.submission_id, s.assessment_id, s.student_id, s.file_url,
#                        st.registration_number, st.user_id as student_user_id,
#                        a.assessment_id, a.created_on as assessment_created_on,
#                        m.module_code, m.module_name
#                 FROM "Submission" s
#                 JOIN "Student" st ON s.student_id = st.user_id
#                 JOIN "Assessment" a ON s.assessment_id = a.assessment_id
#                 JOIN "Module" m ON a.module_id = m.module_id
#                 WHERE s.submission_id IN ({placeholders})
#             """, submission_ids_tuple)
            
#             results = cur.fetchall()
#             logger.info(f"Found {len(results)} valid submissions from database")
#             return [dict(row) for row in results]
#     finally:
#         conn.close()


# def get_assessment_related_lecture_materials(assessment_id):
#     """Get lecture materials specifically related to this assessment through module and lessons."""
#     conn = get_database_connection()
#     try:
#         with conn.cursor(cursor_factory=RealDictCursor) as cur:
#             cur.execute("""
#                 SELECT DISTINCT lm.material_id, lm.lesson_id, lm.file_name, lm.file_url, 
#                        lm.uploaded_on, lm.description,
#                        l.lesson_id, l.title as lesson_title,
#                        m.module_id, m.module_code, m.module_name
#                 FROM "Assessment" a
#                 JOIN "Module" m ON a.module_id = m.module_id
#                 JOIN "Lesson" l ON m.module_id = l.module_id
#                 JOIN "LectureMaterial" lm ON l.lesson_id = lm.lesson_id
#                 WHERE a.assessment_id = %s
#                 ORDER BY lm.uploaded_on ASC
#             """, (assessment_id,))
            
#             results = cur.fetchall()
#             logger.info(f"Found {len(results)} lecture materials for assessment {assessment_id}")
#             return [dict(row) for row in results]
#     finally:
#         conn.close()


# def check_already_extracted(submission_ids, provider_suffix):
#     """Check which submissions have already been extracted and saved."""
#     conn = get_database_connection()
#     try:
#         with conn.cursor() as cur:
#             answers_table = f"student_answers_{provider_suffix}"
            
#             # Check if the table exists first
#             cur.execute("""
#                 SELECT EXISTS (
#                     SELECT FROM information_schema.tables 
#                     WHERE table_name = %s
#                 );
#             """, (answers_table,))
            
#             table_exists = cur.fetchone()[0]
#             if not table_exists:
#                 logger.info(f"Table {answers_table} doesn't exist yet, no submissions extracted")
#                 return set()
            
#             # Check if assessment_id and submission_id columns exist
#             cur.execute("""
#                 SELECT column_name FROM information_schema.columns 
#                 WHERE table_name = %s AND column_name IN ('assessment_id', 'submission_id');
#             """, (answers_table,))
            
#             existing_columns = {row[0] for row in cur.fetchall()}
            
#             if 'submission_id' in existing_columns:
#                 # Use submission_id if available
#                 submission_ids_tuple = tuple(submission_ids)
#                 placeholders = ','.join(['%s'] * len(submission_ids_tuple))
                
#                 cur.execute(f"""
#                     SELECT DISTINCT submission_id FROM "{answers_table}" 
#                     WHERE submission_id IN ({placeholders})
#                 """, submission_ids_tuple)
                
#                 extracted_submissions = {row[0] for row in cur.fetchall()}
#                 logger.info(f"Found {len(extracted_submissions)} already extracted submissions")
#                 return extracted_submissions
#             else:
#                 # Fallback to old method if submission_id column doesn't exist
#                 logger.warning(f"submission_id column not found in {answers_table}, cannot check extraction status")
#                 return set()
                
#     except Exception as e:
#         logger.error(f"Error checking extracted submissions: {e}")
#         return set()
#     finally:
#         conn.close()


# def update_student_tables_with_assessment_context(provider_suffix, submissions_data):
#     """Add assessment_id and submission_id columns to student answer tables if they don't exist."""
#     conn = get_database_connection()
#     try:
#         with conn.cursor() as cur:
#             answers_table = f"student_answers_{provider_suffix}"
#             results_table = f"student_paper_results_{provider_suffix}"  
#             graded_table = f"graded_student_answers_{provider_suffix}"
            
#             # Add new columns to all tables if they don't exist
#             for table in [answers_table, results_table, graded_table]:
#                 cur.execute(f"""
#                     ALTER TABLE "{table}" 
#                     ADD COLUMN IF NOT EXISTS assessment_id TEXT,
#                     ADD COLUMN IF NOT EXISTS submission_id TEXT;
#                 """)
            
#         conn.commit()
#         logger.info(f"Updated table schema for assessment and submission tracking")
        
#     except Exception as e:
#         logger.error(f"Error updating table schema: {e}")
#         conn.rollback()
#         raise
#     finally:
#         conn.close()


# @contextmanager
# def temp_argv(new_argv):
#     """Context manager to temporarily replace sys.argv."""
#     original_argv = sys.argv.copy()
#     try:
#         sys.argv = new_argv
#         yield
#     finally:
#         sys.argv = original_argv


# def execute_script_with_args(script_func, script_name, **kwargs):
#     """Execute a script with proper argument handling using sys.argv."""
#     try:
#         script_file = f"{script_name}.py"
#         args = [script_file]
        
#         if script_name == 'embed_lecture_materials':
#             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
#             args.extend(['--model', kwargs.get('model', 'gpt-4o')])
#             args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
#             if kwargs.get('assessment_id'):
#                 args.extend(['--assessment-id', kwargs.get('assessment_id')])
                
#         elif script_name == 'extract_and_save':
#             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
#             args.extend(['--model', kwargs.get('model', 'gpt-4o')])
#             args.append('--from-db')  # Always use from-db mode
#             # Pass selected submission IDs for filtering
#             if kwargs.get('selected_submission_ids'):
#                 args.extend(['--selected-submission-ids'] + kwargs.get('selected_submission_ids'))
#             if kwargs.get('assessment_id'):
#                 args.extend(['--assessment-id', kwargs.get('assessment_id')])
                
#         elif script_name == 'embed_model_answers':
#             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
#             args.extend(['--model', kwargs.get('model', 'gpt-4o')])
#             args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
#             if kwargs.get('assessment_id'):
#                 args.extend(['--assessment-id', kwargs.get('assessment_id')])
            
#         elif script_name == 'mark_papers':
#             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
#             args.extend(['--llm', kwargs.get('llm', 'gpt-4o')])
#             args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
#             args.extend(['--module', kwargs.get('module_code', 'EE3350')])
#             args.extend(['--year', str(kwargs.get('year', 2025))])
#             args.extend(['--month', kwargs.get('month', 'June')])
#             if kwargs.get('student_indexes'):
#                 args.extend(['--student-indexes'] + kwargs.get('student_indexes'))
#             if kwargs.get('assessment_id'):
#                 args.extend(['--assessment-id', kwargs.get('assessment_id')])
        
#         logger.info(f"Executing {script_name} with args: {args}")
        
#         with temp_argv(args):
#             result = script_func()
            
#         return {'success': True, 'message': 'Script executed successfully', 'result': result}
        
#     except Exception as e:
#         logger.error(f"Script execution failed: {str(e)}")
#         return {'success': False, 'error': str(e)}


# def execute_direct_call(script_func, **kwargs):
#     """Execute script function directly with parameters."""
#     try:
#         logger.info(f"Executing {script_func.__name__} with kwargs: {kwargs}")
#         result = script_func(**kwargs)
#         return {'success': True, 'message': 'Script executed successfully', 'result': result}
#     except Exception as e:
#         logger.error(f"Direct execution failed: {str(e)}")
#         return {'success': False, 'error': str(e)}
    
# # Updated pipeline steps in the Flask API run_full_evaluation method

# def execute_mark_papers_with_assessment(provider: str, llm: str, embedder: str, 
#                                        module_code: str, year: int, month: str,
#                                        student_indexes: List[str], assessment_id: str):
#     """Execute mark_all_papers with assessment-specific context"""
#     try:
#         from src.services.embedding.openai_embedder import OpenAIEmbedder
#         from src.services.embedding.gemini_embedder import GeminiEmbedder
#         from src.services.grading_rag_service import RAGGrader
        
#         logger.info(f"Starting assessment-specific grading for {assessment_id}")
#         logger.info(f"Provider: {provider}, Students: {len(student_indexes)}")
        
#         # Initialize correct embedder based on provider
#         embedder_obj = (
#             OpenAIEmbedder(embedder)
#             if provider == "OpenAI"
#             else GeminiEmbedder(model_name=embedder)
#         )
        
#         # Create RAGGrader instance
#         grader = RAGGrader(
#             provider=provider,
#             chat_model=llm,
#             embedder=embedder_obj
#         )
        
#         # Grade the assessment with selected students
#         grader.grade_assessment(
#             assessment_id=assessment_id,
#             module_code=module_code,
#             year=year,
#             month=month,
#             selected_students=student_indexes
#         )
        
#         return {'success': True, 'message': f'Assessment {assessment_id} graded successfully'}
        
#     except Exception as e:
#         logger.error(f"Assessment grading failed: {str(e)}")
#         return {'success': False, 'error': str(e)}

# # Update the pipeline steps in run_full_evaluation:
# steps = [
#     ('embed_lecture_materials', embed_lecture_materials_main, {
#         'provider': provider,
#         'model': llm_model,
#         'embedder': embed_model,
#         'assessment_id': assessment_id
#     }),
#     ('extract_and_save', extract_and_save_main, {
#         'provider': provider,
#         'model': llm_model,
#         'assessment_id': assessment_id,
#         'selected_submission_ids': remaining_submissions,
#         'submissions_data': submissions_data
#     }),
#     ('embed_from_db', embed_from_db_main, {
#         'provider': provider,
#         'model': embed_model,
#         'module_code': module_code,
#         'year': year,
#         'month': month,
#         'student_indexes': student_indexes,
#         'assessment_id': assessment_id
#     }),
#     ('embed_model_answers', embed_model_answers_main, {
#         'provider': provider,
#         'model': llm_model,
#         'embedder': embed_model,
#         'assessment_id': assessment_id
#     }),
#     ('mark_papers', execute_mark_papers_with_assessment, {  # Use new function
#         'provider': provider,
#         'llm': llm_model,
#         'embedder': embed_model.replace('models/', '') if 'models/' in embed_model else embed_model,
#         'module_code': module_code,
#         'year': year,
#         'month': month,
#         'student_indexes': student_indexes,
#         'assessment_id': assessment_id
#     })
# ]

# # Update the execution loop:
# for i, (step_name, step_func, step_kwargs) in enumerate(steps):
#     logger.info(f"Running step {i+1}/5: {step_name}")
    
#     if step_name in ['embed_from_db', 'extract_and_save', 'embed_model_answers', 'mark_papers']:
#         # Use direct call for these steps to pass assessment context properly
#         if step_name == 'embed_from_db':
#             direct_kwargs = step_kwargs.copy()
#             direct_kwargs['year'] = int(direct_kwargs['year'])
#             logger.info(f"embed_from_db: Using assessment {assessment_id} with {len(student_indexes)} selected students")
#         else:
#             direct_kwargs = step_kwargs.copy()
            
#         result = execute_direct_call(step_func, **direct_kwargs)
#     else:
#         # Use script execution for embed_lecture_materials
#         result = execute_script_with_args(step_func, step_name, **step_kwargs)
    
#     results.append({
#         'step': step_name,
#         'success': result['success'],
#         'error': result.get('error'),
#         'provider_used': step_kwargs.get('provider', 'UNKNOWN'),
#         'assessment_id': assessment_id
#     })
    
#     if not result['success']:
#         logger.error(f"Pipeline failed at step {step_name}: {result.get('error')}")
#         break


# @app.route('/api/run-full-evaluation', methods=['POST'])
# def run_full_evaluation():
#     """Run the complete evaluation pipeline for specific assessment with proper data mapping."""
#     try:
#         data = request.get_json() or {}
#         provider = data.get('provider', 'OpenAI')
#         module_id = data.get('module_id')
#         assessment_id = data.get('assessment_id')
#         selected_submissions = data.get('selected_submissions', [])
#         year = data.get('year')
#         month = data.get('month')
        
#         logger.info(f"Starting full evaluation pipeline with provider: {provider}")
#         logger.info(f"Assessment ID: {assessment_id}, Module ID: {module_id}")
#         logger.info(f"Selected submissions: {len(selected_submissions)} submissions")
        
#         # Get assessment data from database
#         assessment_data = get_assessment_data(assessment_id)
#         if not assessment_data:
#             return jsonify({'success': False, 'error': f'Assessment {assessment_id} not found'}), 404
        
#         # Use assessment creation date for year/month if not provided
#         if not year or not month:
#             created_date = assessment_data['created_on']
#             year = created_date.year
#             month = created_date.strftime('%B')
        
#         module_code = assessment_data['module_code']
#         logger.info(f"Using module code: {module_code}, year: {year}, month: {month}")
        
#         # Get selected submissions data with all necessary mappings
#         submissions_data = get_selected_submissions_data(selected_submissions)
#         if not submissions_data:
#             return jsonify({'success': False, 'error': 'No valid submissions found'}), 400
        
#         # Extract student indexes (registration numbers) from database mapping
#         student_indexes = [sub['registration_number'] for sub in submissions_data]
#         logger.info(f"Processing student indexes from database: {student_indexes}")
        
#         # Set default models based on provider
#         if provider == 'OpenAI':
#             llm_model = 'gpt-4o'
#             embed_model = 'text-embedding-3-small'
#         elif provider == 'GoogleGemini':
#             llm_model = 'gemini-2.0-flash'
#             embed_model = 'models/embedding-001'
#         else:
#             llm_model = 'gpt-4o'
#             embed_model = 'text-embedding-3-small'
        
#         provider_suffix = 'openai' if provider == 'OpenAI' else 'gemini'
        
#         # Update student tables schema to support assessment and submission tracking
#         update_student_tables_with_assessment_context(provider_suffix, submissions_data)
        
#         # Check which submissions have already been extracted
#         already_extracted = check_already_extracted(selected_submissions, provider_suffix)
#         remaining_submissions = [sid for sid in selected_submissions if sid not in already_extracted]
        
#         if already_extracted:
#             logger.info(f"Skipping {len(already_extracted)} already extracted submissions")
#         if remaining_submissions:
#             logger.info(f"Will process {len(remaining_submissions)} new submissions")
        
#         steps = [
#             ('embed_lecture_materials', embed_lecture_materials_main, {
#                 'provider': provider,
#                 'model': llm_model,
#                 'embedder': embed_model,
#                 'assessment_id': assessment_id
#             }),
#             ('extract_and_save', extract_and_save_main, {
#                 'provider': provider,
#                 'model': llm_model,
#                 'assessment_id': assessment_id,
#                 'selected_submission_ids': remaining_submissions,  # Only process new submissions
#                 'submissions_data': submissions_data  # Pass full submission data for mapping
#             }),
#             # ('embed_from_db', embed_from_db_main, {
#             #     'provider': provider,
#             #     'model': embed_model,
#             #     'module_code': module_code,
#             #     'year': year,
#             #     'month': month,
#             #     'student_indexes': student_indexes,
#             #     'assessment_id': assessment_id
#             # }),
#             ('embed_from_db', embed_from_db_main, {
#                 'provider': provider,
#                 'model': embed_model,
#                 'module_code': module_code,
#                 'year': year,
#                 'month': month,
#                 'student_indexes': student_indexes,  # Selected from page
#                 'assessment_id': assessment_id,       # From page context
#                 # 'submissions_data': submissions_data  
#             }),
#             ('embed_model_answers', embed_model_answers_main, {
#                 'provider': provider,
#                 'model': llm_model,
#                 'embedder': embed_model,
#                 'assessment_id': assessment_id
#             }),
#             ('mark_papers', mark_all_papers_main, {
#                 'provider': provider,
#                 'llm': llm_model,
#                 'embedder': embed_model.replace('models/', '') if 'models/' in embed_model else embed_model,
#                 'module_code': module_code,
#                 'year': year,
#                 'month': month,
#                 'student_indexes': student_indexes,
#                 'assessment_id': assessment_id
#             })
#         ]
        
#         results = []
        
#         # for i, (step_name, step_func, step_kwargs) in enumerate(steps):
#         #     logger.info(f"Running step {i+1}/5: {step_name}")
            
#         #     if step_name == 'embed_from_db':
#         #         # Convert year to int for direct call
#         #         direct_kwargs = step_kwargs.copy()
#         #         direct_kwargs['year'] = int(direct_kwargs['year'])
#         #         result = execute_direct_call(step_func, **direct_kwargs)
#         #     elif step_name == 'extract_and_save':
#         #         # Use direct call for extract_and_save to pass submissions_data
#         #         result = execute_direct_call(step_func, **step_kwargs)
#         #     else:
#         #         result = execute_script_with_args(step_func, step_name, **step_kwargs)
            
#         #     results.append({
#         #         'step': step_name,
#         #         'success': result['success'],
#         #         'error': result.get('error'),
#         #         'provider_used': step_kwargs.get('provider', 'UNKNOWN')
#         #     })
            
#         #     if not result['success']:
#         #         logger.error(f"Pipeline failed at step {step_name}: {result.get('error')}")
#         #         break
        
#         # for i, (step_name, step_func, step_kwargs) in enumerate(steps):
#         #     logger.info(f"Running step {i+1}/5: {step_name}")
            
#         #     if step_name == 'embed_from_db':
#         #         # Use direct call for embed_from_db with assessment-specific filtering
#         #         direct_kwargs = step_kwargs.copy()
#         #         direct_kwargs['year'] = int(direct_kwargs['year'])
                
#         #         # Add assessment-specific filtering parameters
#         #         direct_kwargs['student_indexes'] = student_indexes  # From database mapping
#         #         direct_kwargs['assessment_id'] = assessment_id      # From page context
                
#         #         logger.info(f"🎯 embed_from_db: Using assessment {assessment_id} with {len(student_indexes)} selected students")
#         #         result = execute_direct_call(step_func, **direct_kwargs)
#         #     elif step_name == 'extract_and_save':
#         #         # Use direct call for extract_and_save to pass submissions_data
#         #         result = execute_direct_call(step_func, **step_kwargs)
#         #     else:
#         #         result = execute_script_with_args(step_func, step_name, **step_kwargs)
            
#         #     results.append({
#         #         'step': step_name,
#         #         'success': result['success'],
#         #         'error': result.get('error'),
#         #         'provider_used': step_kwargs.get('provider', 'UNKNOWN')
#         #     })
            
#         #     if not result['success']:
#         #         logger.error(f"Pipeline failed at step {step_name}: {result.get('error')}")
#         #         break

#         for i, (step_name, step_func, step_kwargs) in enumerate(steps):
#             logger.info(f"Running step {i+1}/5: {step_name}")
            
#             if step_name == 'embed_from_db':
#                 # Use direct call for embed_from_db with assessment-specific filtering
#                 direct_kwargs = step_kwargs.copy()
#                 direct_kwargs['year'] = int(direct_kwargs['year'])
                
#                 # Add assessment-specific filtering parameters
#                 direct_kwargs['student_indexes'] = student_indexes  # From database mapping
#                 direct_kwargs['assessment_id'] = assessment_id      # From page context
                
#                 logger.info(f"🎯 embed_from_db: Using assessment {assessment_id} with {len(student_indexes)} selected students")
#                 result = execute_direct_call(step_func, **direct_kwargs)
#             elif step_name == 'extract_and_save':
#                 # Use direct call for extract_and_save to pass submissions_data
#                 result = execute_direct_call(step_func, **step_kwargs)
#             elif step_name == 'embed_model_answers':
#                 # Use direct call for embed_model_answers to pass assessment_id and other parameters
#                 direct_kwargs = step_kwargs.copy()
#                 logger.info(f"🎯 embed_model_answers: Processing assessment {assessment_id}")
#                 result = execute_direct_call(step_func, **direct_kwargs)
#             else:
#                 result = execute_script_with_args(step_func, step_name, **step_kwargs)
            
#             results.append({
#                 'step': step_name,
#                 'success': result['success'],
#                 'error': result.get('error'),
#                 'provider_used': step_kwargs.get('provider', 'UNKNOWN')
#             })
            
#             if not result['success']:
#                 logger.error(f"Pipeline failed at step {step_name}: {result.get('error')}")
#                 break

#         successful_steps = [r for r in results if r['success']]
#         all_successful = len(successful_steps) == len(steps)
        
#         return jsonify({
#             'success': all_successful,
#             'message': f'Pipeline completed: {len(successful_steps)}/{len(steps)} steps successful',
#             'results': results,
#             'parameters': {
#                 'provider': provider,
#                 'assessment_id': assessment_id,
#                 'module_id': module_id,
#                 'module_code': module_code,
#                 'year': year,
#                 'month': month,
#                 'llm_model': llm_model,
#                 'embed_model': embed_model,
#                 'submissions_processed': len(submissions_data),
#                 'submissions_skipped': len(already_extracted),
#                 'student_indexes_processed': student_indexes
#             }
#         })
        
#     except Exception as e:
#         logger.error(f"Error in full evaluation: {str(e)}")
#         return jsonify({'success': False, 'error': str(e)}), 500

# # Add this to your Flask API server (paste-4.txt)

# @app.route('/api/mark-papers', methods=['POST'])
# def mark_papers():
#     """Mark papers with proper assessment-specific filtering."""
#     try:
#         data = request.get_json() or {}
#         provider = data.get('provider', 'OpenAI')
#         llm_model = data.get('llm', 'gpt-4o')
#         embedder = data.get('embedder')
#         module_code = data.get('module_code')
#         year = data.get('year')
#         month = data.get('month')
#         student_indexes = data.get('student_indexes', [])
#         assessment_id = data.get('assessment_id')
        
#         if not embedder:
#             embedder = 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001'
        
#         logger.info(f"Marking papers with provider: {provider}")
#         logger.info(f"Assessment ID: {assessment_id}, Module: {module_code}")
#         logger.info(f"Selected students: {student_indexes}")
        
#         # Get assessment data from database to validate and get correct parameters
#         assessment_data = get_assessment_data(assessment_id)
#         if not assessment_data:
#             return jsonify({'success': False, 'error': f'Assessment {assessment_id} not found'}), 404
        
#         # Use database-mapped values instead of provided values for consistency
#         db_module_code = assessment_data['module_code']
#         created_date = assessment_data['created_on']
#         db_year = created_date.year
#         db_month = created_date.strftime('%B')
        
#         # Override with database values for consistency
#         if module_code != db_module_code:
#             logger.warning(f"Module code mismatch: provided={module_code}, database={db_module_code}. Using database value.")
#             module_code = db_module_code
        
#         if year != db_year or month != db_month:
#             logger.warning(f"Date mismatch: provided={year}/{month}, database={db_year}/{db_month}. Using database values.")
#             year = db_year
#             month = db_month
        
#         logger.info(f"Using database-mapped values: Module={module_code}, Year={year}, Month={month}")
        
#         # Validate that student indexes exist in the database for this assessment
#         submissions_data = get_selected_submissions_data([])  # Get all submissions for this assessment
#         available_students = [sub['registration_number'] for sub in submissions_data 
#                             if sub['assessment_id'] == assessment_id]
        
#         # Filter student_indexes to only include those that exist
#         valid_students = [s for s in student_indexes if s in available_students] if student_indexes else available_students
        
#         if not valid_students:
#             return jsonify({'success': False, 'error': 'No valid student indexes found for this assessment'}), 400
        
#         logger.info(f"Valid students for grading: {valid_students}")
        
#         # Execute marking with assessment-specific parameters
#         result = execute_script_with_args(
#             mark_all_papers_main, 
#             'mark_papers',
#             provider=provider,
#             llm=llm_model,
#             embedder=embedder.replace('models/', '') if 'models/' in embedder else embedder,
#             module_code=module_code,
#             year=year,
#             month=month,
#             student_indexes=valid_students,
#             assessment_id=assessment_id
#         )
        
#         if result['success']:
#             return jsonify({
#                 'success': True,
#                 'message': f'Papers marked successfully for assessment {assessment_id}',
#                 'parameters': {
#                     'provider': provider,
#                     'llm_model': llm_model,
#                     'embedder': embedder,
#                     'module_code': module_code,
#                     'year': year,
#                     'month': month,
#                     'assessment_id': assessment_id,
#                     'students_graded': len(valid_students),
#                     'valid_students': valid_students
#                 },
#                 'result': result.get('result')
#             })
#         else:
#             return jsonify({
#                 'success': False, 
#                 'error': f'Marking failed: {result["error"]}',
#                 'parameters': {
#                     'assessment_id': assessment_id,
#                     'module_code': module_code,
#                     'students_attempted': len(valid_students)
#                 }
#             }), 500
            
#     except Exception as e:
#         logger.error(f"Error in mark papers: {str(e)}")
#         return jsonify({'success': False, 'error': str(e)}), 500

# # Keep all existing endpoints...
# @app.route('/api/health', methods=['GET'])
# def health_check():
#     """Health check endpoint."""
#     return jsonify({'status': 'healthy'})


# @app.route('/api/embed-lecture-materials', methods=['POST'])
# def embed_lecture_materials():
#     """Embed lecture materials from database."""
#     try:
#         data = request.get_json() or {}
#         provider = data.get('provider', 'OpenAI')
#         model = data.get('model', 'gpt-4o')
#         embedder = data.get('embedder')
#         assessment_id = data.get('assessment_id')
        
#         if not embedder:
#             embedder = 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001'
        
#         logger.info(f"Embedding lecture materials with provider: {provider}, model: {model}")
#         result = execute_script_with_args(
#             embed_lecture_materials_main, 
#             'embed_lecture_materials',
#             provider=provider,
#             model=model,
#             embedder=embedder,
#             assessment_id=assessment_id
#         )
        
#         if result['success']:
#             return jsonify({
#                 'success': True,
#                 'message': 'Lecture materials embedded successfully',
#                 'parameters': {
#                     'provider': provider,
#                     'model': model,
#                     'embedder': embedder,
#                     'assessment_id': assessment_id
#                 }
#             })
#         else:
#             return jsonify({'success': False, 'error': result['error']}), 500
            
#     except Exception as e:
#         logger.error(f"Error in embed lecture materials: {str(e)}")
#         return jsonify({'success': False, 'error': str(e)}), 500


# @app.route('/api/status', methods=['GET'])
# def get_status():
#     """Get current API status and available endpoints."""
#     return jsonify({
#         'status': 'running',
#         'version': '2.2.0',
#         'endpoints': {
#             'health': 'GET /api/health',
#             'embed_lecture_materials': 'POST /api/embed-lecture-materials',
#             'extract_and_save': 'POST /api/extract-and-save',
#             'embed_from_db': 'POST /api/embed-from-db',
#             'embed_model_answers': 'POST /api/embed-model-answers',
#             'mark_papers': 'POST /api/mark-papers',
#             'run_full_evaluation': 'POST /api/run-full-evaluation',
#             'status': 'GET /api/status'
#         },
#         'supported_providers': ['OpenAI', 'GoogleGemini'],
#         'features': [
#             'Assessment-specific evaluation',
#             'Database mapping and filtering',
#             'Submission selection support',
#             'Student index filtering',
#             'Assessment-related lecture materials filtering',
#             'Duplicate extraction prevention',
#             'Database-driven parameter mapping'
#         ]
#     })


# if __name__ == '__main__':
#     print("🚀 Starting Enhanced AI Exam Evaluation Flask API Server...")
#     print("📍 Available endpoints:")
#     print("   GET  /api/health")
#     print("   GET  /api/status")
#     print("   POST /api/embed-lecture-materials")
#     print("   POST /api/extract-and-save")
#     print("   POST /api/embed-from-db")
#     print("   POST /api/embed-model-answers")
#     print("   POST /api/mark-papers")
#     print("   POST /api/run-full-evaluation")
#     print("🎯 Enhanced Features:")
#     print("   • Assessment-specific lecture materials filtering")
#     print("   • Student index (registration number) filtering")
#     print("   • Proper database relationship mapping")
#     print("   • Context-aware embedding and evaluation")
#     print("   • Duplicate extraction prevention")
#     print("   • Database-driven parameter mapping")
    
#     app.run(host='0.0.0.0', port=7000, debug=True)

"""
Enhanced Flask API Server for AI Exam Evaluation System
Now supports proper assessment-specific filtering and database mapping.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from contextlib import contextmanager
from datetime import datetime
from typing import List  # Add this import to fix the error

# Add project root to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.scripts.embed_lecture_materials import main as embed_lecture_materials_main
from src.scripts.student_answer.extract_and_save import main as extract_and_save_main  
from src.scripts.embed_from_db import main as embed_from_db_main
from src.scripts.embed_model_answers import main as embed_model_answers_main
from src.scripts.mark_all_papers import main as mark_all_papers_main

load_dotenv()
app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_database_connection():
    """Get database connection using environment variables."""
    try:
        conn = psycopg2.connect(
            host=os.getenv('POSTGRES_HOST'),
            port=os.getenv('POSTGRES_PORT'),
            database=os.getenv('POSTGRES_DB'),
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD')
        )
        return conn
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        raise


def get_assessment_data(assessment_id):
    """Get comprehensive assessment data including module code and creation date."""
    conn = get_database_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT a.assessment_id, a.created_on, a.module_id,
                       m.module_code, m.module_name
                FROM "Assessment" a
                JOIN "Module" m ON a.module_id = m.module_id
                WHERE a.assessment_id = %s
            """, (assessment_id,))
            
            result = cur.fetchone()
            if result:
                return dict(result)
            return None
    finally:
        conn.close()


def get_selected_submissions_data(selected_submission_ids):
    """Get submission data for selected submissions with proper mapping."""
    if not selected_submission_ids:
        return []
        
    conn = get_database_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Convert list to tuple for SQL IN clause
            submission_ids_tuple = tuple(selected_submission_ids)
            placeholders = ','.join(['%s'] * len(submission_ids_tuple))
            
            cur.execute(f"""
                SELECT s.submission_id, s.assessment_id, s.student_id, s.file_url,
                       st.registration_number, st.user_id as student_user_id,
                       a.assessment_id, a.created_on as assessment_created_on,
                       m.module_code, m.module_name
                FROM "Submission" s
                JOIN "Student" st ON s.student_id = st.user_id
                JOIN "Assessment" a ON s.assessment_id = a.assessment_id
                JOIN "Module" m ON a.module_id = m.module_id
                WHERE s.submission_id IN ({placeholders})
            """, submission_ids_tuple)
            
            results = cur.fetchall()
            logger.info(f"Found {len(results)} valid submissions from database")
            return [dict(row) for row in results]
    finally:
        conn.close()


def get_assessment_related_lecture_materials(assessment_id):
    """Get lecture materials specifically related to this assessment through module and lessons."""
    conn = get_database_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT DISTINCT lm.material_id, lm.lesson_id, lm.file_name, lm.file_url, 
                       lm.uploaded_on, lm.description,
                       l.lesson_id, l.title as lesson_title,
                       m.module_id, m.module_code, m.module_name
                FROM "Assessment" a
                JOIN "Module" m ON a.module_id = m.module_id
                JOIN "Lesson" l ON m.module_id = l.module_id
                JOIN "LectureMaterial" lm ON l.lesson_id = lm.lesson_id
                WHERE a.assessment_id = %s
                ORDER BY lm.uploaded_on ASC
            """, (assessment_id,))
            
            results = cur.fetchall()
            logger.info(f"Found {len(results)} lecture materials for assessment {assessment_id}")
            return [dict(row) for row in results]
    finally:
        conn.close()


def check_already_extracted(submission_ids, provider_suffix):
    """Check which submissions have already been extracted and saved."""
    conn = get_database_connection()
    try:
        with conn.cursor() as cur:
            answers_table = f"student_answers_{provider_suffix}"
            
            # Check if the table exists first
            cur.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = %s
                );
            """, (answers_table,))
            
            table_exists = cur.fetchone()[0]
            if not table_exists:
                logger.info(f"Table {answers_table} doesn't exist yet, no submissions extracted")
                return set()
            
            # Check if assessment_id and submission_id columns exist
            cur.execute("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = %s AND column_name IN ('assessment_id', 'submission_id');
            """, (answers_table,))
            
            existing_columns = {row[0] for row in cur.fetchall()}
            
            if 'submission_id' in existing_columns:
                # Use submission_id if available
                submission_ids_tuple = tuple(submission_ids)
                placeholders = ','.join(['%s'] * len(submission_ids_tuple))
                
                cur.execute(f"""
                    SELECT DISTINCT submission_id FROM "{answers_table}" 
                    WHERE submission_id IN ({placeholders})
                """, submission_ids_tuple)
                
                extracted_submissions = {row[0] for row in cur.fetchall()}
                logger.info(f"Found {len(extracted_submissions)} already extracted submissions")
                return extracted_submissions
            else:
                # Fallback to old method if submission_id column doesn't exist
                logger.warning(f"submission_id column not found in {answers_table}, cannot check extraction status")
                return set()
                
    except Exception as e:
        logger.error(f"Error checking extracted submissions: {e}")
        return set()
    finally:
        conn.close()


def update_student_tables_with_assessment_context(provider_suffix, submissions_data):
    """Add assessment_id and submission_id columns to student answer tables if they don't exist."""
    conn = get_database_connection()
    try:
        with conn.cursor() as cur:
            answers_table = f"student_answers_{provider_suffix}"
            results_table = f"student_paper_results_{provider_suffix}"  
            graded_table = f"graded_student_answers_{provider_suffix}"
            
            # Add new columns to all tables if they don't exist
            for table in [answers_table, results_table, graded_table]:
                cur.execute(f"""
                    ALTER TABLE "{table}" 
                    ADD COLUMN IF NOT EXISTS assessment_id TEXT,
                    ADD COLUMN IF NOT EXISTS submission_id TEXT;
                """)
            
        conn.commit()
        logger.info(f"Updated table schema for assessment and submission tracking")
        
    except Exception as e:
        logger.error(f"Error updating table schema: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


@contextmanager
def temp_argv(new_argv):
    """Context manager to temporarily replace sys.argv."""
    original_argv = sys.argv.copy()
    try:
        sys.argv = new_argv
        yield
    finally:
        sys.argv = original_argv


def execute_script_with_args(script_func, script_name, **kwargs):
    """Execute a script with proper argument handling using sys.argv."""
    try:
        script_file = f"{script_name}.py"
        args = [script_file]
        
        if script_name == 'embed_lecture_materials':
            args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
            args.extend(['--model', kwargs.get('model', 'gpt-4o')])
            args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
            if kwargs.get('assessment_id'):
                args.extend(['--assessment-id', kwargs.get('assessment_id')])
                
        elif script_name == 'extract_and_save':
            args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
            args.extend(['--model', kwargs.get('model', 'gpt-4o')])
            args.append('--from-db')  # Always use from-db mode
            # Pass selected submission IDs for filtering
            if kwargs.get('selected_submission_ids'):
                args.extend(['--selected-submission-ids'] + kwargs.get('selected_submission_ids'))
            if kwargs.get('assessment_id'):
                args.extend(['--assessment-id', kwargs.get('assessment_id')])
                
        elif script_name == 'embed_model_answers':
            args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
            args.extend(['--model', kwargs.get('model', 'gpt-4o')])
            args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
            if kwargs.get('assessment_id'):
                args.extend(['--assessment-id', kwargs.get('assessment_id')])
            
        elif script_name == 'mark_papers':
            args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
            args.extend(['--llm', kwargs.get('llm', 'gpt-4o')])
            args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
            args.extend(['--module', kwargs.get('module_code', 'EE3350')])
            args.extend(['--year', str(kwargs.get('year', 2025))])
            args.extend(['--month', kwargs.get('month', 'June')])
            if kwargs.get('student_indexes'):
                args.extend(['--student-indexes'] + kwargs.get('student_indexes'))
            if kwargs.get('assessment_id'):
                args.extend(['--assessment-id', kwargs.get('assessment_id')])
        
        logger.info(f"Executing {script_name} with args: {args}")
        
        with temp_argv(args):
            result = script_func()
            
        return {'success': True, 'message': 'Script executed successfully', 'result': result}
        
    except Exception as e:
        logger.error(f"Script execution failed: {str(e)}")
        return {'success': False, 'error': str(e)}


def execute_direct_call(script_func, **kwargs):
    """Execute script function directly with parameters."""
    try:
        logger.info(f"Executing {script_func.__name__} with kwargs: {kwargs}")
        result = script_func(**kwargs)
        return {'success': True, 'message': 'Script executed successfully', 'result': result}
    except Exception as e:
        logger.error(f"Direct execution failed: {str(e)}")
        return {'success': False, 'error': str(e)}


def execute_mark_papers_with_assessment(provider: str, llm: str, embedder: str, 
                                       module_code: str, year: int, month: str,
                                       student_indexes: List[str], assessment_id: str):
    """Execute mark_all_papers with assessment-specific context"""
    try:
        from src.services.embedding.openai_embedder import OpenAIEmbedder
        from src.services.embedding.gemini_embedder import GeminiEmbedder
        from src.services.grading_rag_service import RAGGrader
        
        logger.info(f"Starting assessment-specific grading for {assessment_id}")
        logger.info(f"Provider: {provider}, Students: {len(student_indexes)}")
        
        # Initialize correct embedder based on provider
        embedder_obj = (
            OpenAIEmbedder(embedder)
            if provider == "OpenAI"
            else GeminiEmbedder(model_name=embedder)
        )
        
        # Create RAGGrader instance
        grader = RAGGrader(
            provider=provider,
            chat_model=llm,
            embedder=embedder_obj
        )
        
        # Grade the assessment with selected students
        grader.grade_assessment(
            assessment_id=assessment_id,
            module_code=module_code,
            year=year,
            month=month,
            selected_students=student_indexes
        )
        
        return {'success': True, 'message': f'Assessment {assessment_id} graded successfully'}
        
    except Exception as e:
        logger.error(f"Assessment grading failed: {str(e)}")
        return {'success': False, 'error': str(e)}


@app.route('/api/run-full-evaluation', methods=['POST'])
def run_full_evaluation():
    """Run the complete evaluation pipeline for specific assessment with proper data mapping."""
    try:
        data = request.get_json() or {}
        provider = data.get('provider', 'OpenAI')
        module_id = data.get('module_id')
        assessment_id = data.get('assessment_id')
        selected_submissions = data.get('selected_submissions', [])
        year = data.get('year')
        month = data.get('month')
        
        logger.info(f"Starting full evaluation pipeline with provider: {provider}")
        logger.info(f"Assessment ID: {assessment_id}, Module ID: {module_id}")
        logger.info(f"Selected submissions: {len(selected_submissions)} submissions")
        
        # Get assessment data from database
        assessment_data = get_assessment_data(assessment_id)
        if not assessment_data:
            return jsonify({'success': False, 'error': f'Assessment {assessment_id} not found'}), 404
        
        # Use assessment creation date for year/month if not provided
        if not year or not month:
            created_date = assessment_data['created_on']
            year = created_date.year
            month = created_date.strftime('%B')
        
        module_code = assessment_data['module_code']
        logger.info(f"Using module code: {module_code}, year: {year}, month: {month}")
        
        # Get selected submissions data with all necessary mappings
        submissions_data = get_selected_submissions_data(selected_submissions)
        if not submissions_data:
            return jsonify({'success': False, 'error': 'No valid submissions found'}), 400
        
        # Extract student indexes (registration numbers) from database mapping
        student_indexes = [sub['registration_number'] for sub in submissions_data]
        logger.info(f"Processing student indexes from database: {student_indexes}")
        
        # Set default models based on provider
        if provider == 'OpenAI':
            llm_model = 'gpt-4o'
            embed_model = 'text-embedding-3-small'
        elif provider == 'GoogleGemini':
            llm_model = 'gemini-2.0-flash'
            embed_model = 'models/embedding-001'
        else:
            llm_model = 'gpt-4o'
            embed_model = 'text-embedding-3-small'
        
        provider_suffix = 'openai' if provider == 'OpenAI' else 'gemini'
        
        # Update student tables schema to support assessment and submission tracking
        update_student_tables_with_assessment_context(provider_suffix, submissions_data)
        
        # Check which submissions have already been extracted
        already_extracted = check_already_extracted(selected_submissions, provider_suffix)
        remaining_submissions = [sid for sid in selected_submissions if sid not in already_extracted]
        
        if already_extracted:
            logger.info(f"Skipping {len(already_extracted)} already extracted submissions")
        if remaining_submissions:
            logger.info(f"Will process {len(remaining_submissions)} new submissions")
        
        steps = [
            ('embed_lecture_materials', embed_lecture_materials_main, {
                'provider': provider,
                'model': llm_model,
                'embedder': embed_model,
                'assessment_id': assessment_id
            }),
            ('extract_and_save', extract_and_save_main, {
                'provider': provider,
                'model': llm_model,
                'assessment_id': assessment_id,
                'selected_submission_ids': remaining_submissions,
                'submissions_data': submissions_data
            }),
            ('embed_from_db', embed_from_db_main, {
                'provider': provider,
                'model': embed_model,
                'module_code': module_code,
                'year': year,
                'month': month,
                'student_indexes': student_indexes,
                'assessment_id': assessment_id,
            }),
            ('embed_model_answers', embed_model_answers_main, {
                'provider': provider,
                'model': llm_model,
                'embedder': embed_model,
                'assessment_id': assessment_id
            }),
            ('mark_papers', mark_all_papers_main, {
                'provider': provider,
                'llm': llm_model,
                'embedder': embed_model.replace('models/', '') if 'models/' in embed_model else embed_model,
                'module_code': module_code,
                'year': year,
                'month': month,
                'student_indexes': student_indexes,
                'assessment_id': assessment_id
            })
        ]
        
        results = []

        for i, (step_name, step_func, step_kwargs) in enumerate(steps):
            logger.info(f"Running step {i+1}/5: {step_name}")
            
            if step_name == 'embed_from_db':
                # Use direct call for embed_from_db with assessment-specific filtering
                direct_kwargs = step_kwargs.copy()
                direct_kwargs['year'] = int(direct_kwargs['year'])
                
                # Add assessment-specific filtering parameters
                direct_kwargs['student_indexes'] = student_indexes
                direct_kwargs['assessment_id'] = assessment_id
                
                logger.info(f"🎯 embed_from_db: Using assessment {assessment_id} with {len(student_indexes)} selected students")
                result = execute_direct_call(step_func, **direct_kwargs)
            elif step_name == 'extract_and_save':
                # Use direct call for extract_and_save to pass submissions_data
                result = execute_direct_call(step_func, **step_kwargs)
            elif step_name == 'embed_model_answers':
                # Use direct call for embed_model_answers to pass assessment_id and other parameters
                direct_kwargs = step_kwargs.copy()
                logger.info(f"🎯 embed_model_answers: Processing assessment {assessment_id}")
                result = execute_direct_call(step_func, **direct_kwargs)
            else:
                result = execute_script_with_args(step_func, step_name, **step_kwargs)
            
            results.append({
                'step': step_name,
                'success': result['success'],
                'error': result.get('error'),
                'provider_used': step_kwargs.get('provider', 'UNKNOWN'),
                'assessment_id': assessment_id
            })
            
            if not result['success']:
                logger.error(f"Pipeline failed at step {step_name}: {result.get('error')}")
                break

        successful_steps = [r for r in results if r['success']]
        all_successful = len(successful_steps) == len(steps)
        
        return jsonify({
            'success': all_successful,
            'message': f'Pipeline completed: {len(successful_steps)}/{len(steps)} steps successful',
            'results': results,
            'parameters': {
                'provider': provider,
                'assessment_id': assessment_id,
                'module_id': module_id,
                'module_code': module_code,
                'year': year,
                'month': month,
                'llm_model': llm_model,
                'embed_model': embed_model,
                'submissions_processed': len(submissions_data),
                'submissions_skipped': len(already_extracted),
                'student_indexes_processed': student_indexes
            }
        })
        
    except Exception as e:
        logger.error(f"Error in full evaluation: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/mark-papers', methods=['POST'])
def mark_papers():
    """Mark papers with proper assessment-specific filtering."""
    try:
        data = request.get_json() or {}
        provider = data.get('provider', 'OpenAI')
        llm_model = data.get('llm', 'gpt-4o')
        embedder = data.get('embedder')
        module_code = data.get('module_code')
        year = data.get('year')
        month = data.get('month')
        student_indexes = data.get('student_indexes', [])
        assessment_id = data.get('assessment_id')
        
        if not embedder:
            embedder = 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001'
        
        logger.info(f"Marking papers with provider: {provider}")
        logger.info(f"Assessment ID: {assessment_id}, Module: {module_code}")
        logger.info(f"Selected students: {student_indexes}")
        
        # Get assessment data from database to validate and get correct parameters
        assessment_data = get_assessment_data(assessment_id)
        if not assessment_data:
            return jsonify({'success': False, 'error': f'Assessment {assessment_id} not found'}), 404
        
        # Use database-mapped values instead of provided values for consistency
        db_module_code = assessment_data['module_code']
        created_date = assessment_data['created_on']
        db_year = created_date.year
        db_month = created_date.strftime('%B')
        
        # Override with database values for consistency
        if module_code != db_module_code:
            logger.warning(f"Module code mismatch: provided={module_code}, database={db_module_code}. Using database value.")
            module_code = db_module_code
        
        if year != db_year or month != db_month:
            logger.warning(f"Date mismatch: provided={year}/{month}, database={db_year}/{db_month}. Using database values.")
            year = db_year
            month = db_month
        
        logger.info(f"Using database-mapped values: Module={module_code}, Year={year}, Month={month}")
        
        # Validate that student indexes exist in the database for this assessment
        submissions_data = get_selected_submissions_data([])  # Get all submissions for this assessment
        available_students = [sub['registration_number'] for sub in submissions_data 
                            if sub['assessment_id'] == assessment_id]
        
        # Filter student_indexes to only include those that exist
        valid_students = [s for s in student_indexes if s in available_students] if student_indexes else available_students
        
        if not valid_students:
            return jsonify({'success': False, 'error': 'No valid student indexes found for this assessment'}), 400
        
        logger.info(f"Valid students for grading: {valid_students}")
        
        # Execute marking with assessment-specific parameters
        result = execute_script_with_args(
            mark_all_papers_main, 
            'mark_papers',
            provider=provider,
            llm=llm_model,
            embedder=embedder.replace('models/', '') if 'models/' in embedder else embedder,
            module_code=module_code,
            year=year,
            month=month,
            student_indexes=valid_students,
            assessment_id=assessment_id
        )
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': f'Papers marked successfully for assessment {assessment_id}',
                'parameters': {
                    'provider': provider,
                    'llm_model': llm_model,
                    'embedder': embedder,
                    'module_code': module_code,
                    'year': year,
                    'month': month,
                    'assessment_id': assessment_id,
                    'students_graded': len(valid_students),
                    'valid_students': valid_students
                },
                'result': result.get('result')
            })
        else:
            return jsonify({
                'success': False, 
                'error': f'Marking failed: {result["error"]}',
                'parameters': {
                    'assessment_id': assessment_id,
                    'module_code': module_code,
                    'students_attempted': len(valid_students)
                }
            }), 500
            
    except Exception as e:
        logger.error(f"Error in mark papers: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy'})


@app.route('/api/embed-lecture-materials', methods=['POST'])
def embed_lecture_materials():
    """Embed lecture materials from database."""
    try:
        data = request.get_json() or {}
        provider = data.get('provider', 'OpenAI')
        model = data.get('model', 'gpt-4o')
        embedder = data.get('embedder')
        assessment_id = data.get('assessment_id')
        
        if not embedder:
            embedder = 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001'
        
        logger.info(f"Embedding lecture materials with provider: {provider}, model: {model}")
        result = execute_script_with_args(
            embed_lecture_materials_main, 
            'embed_lecture_materials',
            provider=provider,
            model=model,
            embedder=embedder,
            assessment_id=assessment_id
        )
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': 'Lecture materials embedded successfully',
                'parameters': {
                    'provider': provider,
                    'model': model,
                    'embedder': embedder,
                    'assessment_id': assessment_id
                }
            })
        else:
            return jsonify({'success': False, 'error': result['error']}), 500
            
    except Exception as e:
        logger.error(f"Error in embed lecture materials: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/status', methods=['GET'])
def get_status():
    """Get current API status and available endpoints."""
    return jsonify({
        'status': 'running',
        'version': '2.2.0',
        'endpoints': {
            'health': 'GET /api/health',
            'embed_lecture_materials': 'POST /api/embed-lecture-materials',
            'extract_and_save': 'POST /api/extract-and-save',
            'embed_from_db': 'POST /api/embed-from-db',
            'embed_model_answers': 'POST /api/embed-model-answers',
            'mark_papers': 'POST /api/mark-papers',
            'run_full_evaluation': 'POST /api/run-full-evaluation',
            'status': 'GET /api/status'
        },
        'supported_providers': ['OpenAI', 'GoogleGemini'],
        'features': [
            'Assessment-specific evaluation',
            'Database mapping and filtering',
            'Submission selection support',
            'Student index filtering',
            'Assessment-related lecture materials filtering',
            'Duplicate extraction prevention',
            'Database-driven parameter mapping'
        ]
    })


if __name__ == '__main__':
    print("🚀 Starting Enhanced AI Exam Evaluation Flask API Server...")
    print("📍 Available endpoints:")
    print("   GET  /api/health")
    print("   GET  /api/status")
    print("   POST /api/embed-lecture-materials")
    print("   POST /api/extract-and-save")
    print("   POST /api/embed-from-db")
    print("   POST /api/embed-model-answers")
    print("   POST /api/mark-papers")
    print("   POST /api/run-full-evaluation")
    print("🎯 Enhanced Features:")
    print("   • Assessment-specific lecture materials filtering")
    print("   • Student index (registration number) filtering")
    print("   • Proper database relationship mapping")
    print("   • Context-aware embedding and evaluation")
    print("   • Duplicate extraction prevention")
    print("   • Database-driven parameter mapping")
    
    app.run(host='0.0.0.0', port=7000, debug=True)