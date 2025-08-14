# # # """
# # # Simple Flask API Server for AI Exam Evaluation System
# # # Provides direct REST endpoints for each evaluation step without task tracking.
# # # """

# # # from flask import Flask, request, jsonify
# # # from flask_cors import CORS
# # # import logging
# # # import os
# # # import sys

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


# # # def execute_script(script_func, args):
# # #     """Execute a script with given arguments."""
# # #     try:
# # #         # Override sys.argv for the script
# # #         original_argv = sys.argv.copy()
# # #         sys.argv = args
        
# # #         # Run the script
# # #         result = script_func()
        
# # #         # Restore original argv
# # #         sys.argv = original_argv
        
# # #         return {'success': True, 'message': 'Script executed successfully'}
        
# # #     except Exception as e:
# # #         logger.error(f"Script execution failed: {str(e)}")
# # #         # Restore original argv even on error
# # #         sys.argv = original_argv
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
        
# # #         # Prepare arguments for the script
# # #         args = ['embed_lecture_materials.py', '--provider', provider, '--model', model, '--embedder', embedder]
# # #         if module_code:
# # #             args.extend(['--module', module_code])
        
# # #         logger.info(f"Embedding lecture materials with args: {args}")
# # #         result = execute_script(embed_lecture_materials_main, args)
        
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
        
# # #         # Prepare arguments for the script
# # #         args = ['run_extract_and_save.py', '--provider', provider, '--model', model, '--from-db']
        
# # #         logger.info(f"Extracting and saving answers with args: {args}")
# # #         result = execute_script(extract_and_save_main, args)
        
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
        
# # #         # Prepare arguments for the script
# # #         args = [
# # #             'embed_from_db.py', '--provider', provider, '--model', model,
# # #             '--module_code', module_code, '--year', year, '--month', month
# # #         ]
        
# # #         logger.info(f"Embedding from database with args: {args}")
# # #         result = execute_script(embed_from_db_main, args)
        
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
        
# # #         # Prepare arguments for the script
# # #         args = ['embed_model_answers.py', '--provider', provider, '--model', model, '--embedder', embedder]
        
# # #         logger.info(f"Embedding model answers with args: {args}")
# # #         result = execute_script(embed_model_answers_main, args)
        
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
        
# # #         # Prepare arguments for the script
# # #         args = [
# # #             'mark_all_papers.py', '--provider', provider, '--llm', llm,
# # #             '--embedder', embedder, '--module', module, '--year', year, '--month', month
# # #         ]
        
# # #         logger.info(f"Marking papers with args: {args}")
# # #         result = execute_script(mark_all_papers_main, args)
        
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
# # #             ('embed_lecture_materials', embed_lecture_materials_main),
# # #             ('extract_and_save', extract_and_save_main),
# # #             ('embed_from_db', embed_from_db_main),
# # #             ('embed_model_answers', embed_model_answers_main),
# # #             ('mark_papers', mark_all_papers_main)
# # #         ]
        
# # #         results = []
        
# # #         for i, (step_name, step_func) in enumerate(steps):
# # #             logger.info(f"Running step {i+1}/5: {step_name}")
            
# # #             # Prepare arguments based on step
# # #             if step_name == 'embed_lecture_materials':
# # #                 args = ['embed_lecture_materials.py', '--provider', provider, '--model', llm_model, '--embedder', embed_model]
# # #                 if module_code:
# # #                     args.extend(['--module', module_code])
# # #             elif step_name == 'extract_and_save':
# # #                 args = ['run_extract_and_save.py', '--provider', provider, '--model', llm_model, '--from-db']
# # #             elif step_name == 'embed_from_db':
# # #                 args = ['embed_from_db.py', '--provider', provider, '--model', embed_model, '--module_code', module_code, '--year', year, '--month', month]
# # #             elif step_name == 'embed_model_answers':
# # #                 args = ['embed_model_answers.py', '--provider', provider, '--model', llm_model, '--embedder', embed_model]
# # #             elif step_name == 'mark_papers':
# # #                 embedder_arg = embed_model.replace('models/', '') if 'models/' in embed_model else embed_model
# # #                 args = ['mark_all_papers.py', '--provider', provider, '--llm', llm_model, '--embedder', embedder_arg, '--module', module_code, '--year', year, '--month', month]
            
# # #             result = execute_script(step_func, args)
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


# # # if __name__ == '__main__':
# # #     print("🚀 Starting AI Exam Evaluation Flask API Server...")
# # #     print("📍 Available endpoints:")
# # #     print("   GET  /api/health")
# # #     print("   POST /api/embed-lecture-materials")
# # #     print("   POST /api/extract-and-save")
# # #     print("   POST /api/embed-from-db")
# # #     print("   POST /api/embed-model-answers")
# # #     print("   POST /api/mark-papers")
# # #     print("   POST /api/run-full-evaluation")
    
# # #     app.run(host='0.0.0.0', port=7000, debug=True)

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
                
# # #         elif script_name == 'embed_from_db':
# # #             args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
# # #             args.extend(['--model', kwargs.get('model', 'text-embedding-3-small')])
# # #             args.extend(['--module_code', kwargs.get('module_code', 'EE3350')])
# # #             args.extend(['--year', kwargs.get('year', '2025')])
# # #             args.extend(['--month', kwargs.get('month', 'June')])
            
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
# # #         result = execute_script_with_args(
# # #             embed_from_db_main,
# # #             'embed_from_db',
# # #             provider=provider,
# # #             model=model,
# # #             module_code=module_code,
# # #             year=year,
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
            
# # #             result = execute_script_with_args(step_func, step_name, **step_kwargs)
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
        
# #         steps = [
# #             ('embed_lecture_materials', embed_lecture_materials_main, {
# #                 'provider': provider,
# #                 'model': llm_model,
# #                 'embedder': embed_model,
# #                 'module_code': module_code
# #             }),
# #             ('extract_and_save', extract_and_save_main, {
# #                 'provider': provider,
# #                 'model': llm_model,
# #                 'from_db': True
# #             }),
# #             ('embed_from_db', embed_from_db_main, {
# #                 'provider': provider,
# #                 'model': embed_model,
# #                 'module_code': module_code,
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
# #                 'module': module_code,
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
#             args.extend(['--module', kwargs.get('module', 'EE3350')])
#             args.extend(['--year', kwargs.get('year', '2025')])
#             args.extend(['--month', kwargs.get('month', 'June')])
        
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
#         result = execute_script_with_args(
#             embed_lecture_materials_main, 
#             'embed_lecture_materials',
#             provider=provider,
#             model=model,
#             embedder=embedder,
#             module_code=module_code
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
#         module_code = data.get('module_code', 'EE3350')
#         year = data.get('year', '2025')
#         month = data.get('month', 'June')
        
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
#         module = data.get('module', 'EE3350')
#         year = data.get('year', '2025')
#         month = data.get('month', 'June')
        
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
#         module_code = data.get('module_code', 'EE3350')
#         year = data.get('year', '2025')
#         month = data.get('month', 'June')
        
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
#             ('extract_and_save', extract_and_save_main, {
#                 'provider': provider,
#                 'model': llm_model,
#                 'from_db': True
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
#                 'error': result.get('error')
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
#             args.extend(['--module', kwargs.get('module', 'EE3350')])
#             args.extend(['--year', kwargs.get('year', '2025')])
#             args.extend(['--month', kwargs.get('month', 'June')])
        
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
#         result = execute_script_with_args(
#             embed_lecture_materials_main, 
#             'embed_lecture_materials',
#             provider=provider,
#             model=model,
#             embedder=embedder,
#             module_code=module_code
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
#         module_code = data.get('module_code', 'EE3350')
#         year = data.get('year', '2025')
#         month = data.get('month', 'June')
        
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
#         module = data.get('module', 'EE3350')
#         year = data.get('year', '2025')
#         month = data.get('month', 'June')
        
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
#         module_code = data.get('module_code', 'EE3350')
#         year = data.get('year', '2025')
#         month = data.get('month', 'June')
        
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
#             ('extract_and_save', extract_and_save_main, {
#                 'provider': provider,
#                 'model': llm_model,
#                 'from_db': True
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
#                 'error': result.get('error')
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


"""
Simple Flask API Server for AI Exam Evaluation System
Provides direct REST endpoints for each evaluation step without task tracking.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import os
import sys
import argparse
from contextlib import contextmanager

# Add project root to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.scripts.embed_lecture_materials import main as embed_lecture_materials_main
from src.scripts.run_extract_and_save import main as extract_and_save_main  
from src.scripts.embed_from_db import main as embed_from_db_main
from src.scripts.embed_model_answers import main as embed_model_answers_main
from src.scripts.mark_all_papers import main as mark_all_papers_main

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_actual_module_code(module_identifier):
    """
    Get the actual module code from module identifier.
    If it's already a module code (like EE3350), return as-is.
    If it's a UUID, fetch the actual module code from database.
    """
    try:
        # If it looks like a standard module code, return as-is
        if len(module_identifier) <= 10 and not '-' in module_identifier:
            return module_identifier
        
        # If it's a UUID, you should fetch from database
        # For now, using a fallback - you should implement database lookup
        if len(module_identifier) > 10 and '-' in module_identifier:
            logger.warning(f"UUID-like module identifier received: {module_identifier}")
            # TODO: Implement database lookup to get actual module code
            # Example: SELECT module_code FROM modules WHERE module_id = %s
            return 'EE3350'  # Fallback - replace with actual database lookup
        
        return module_identifier
        
    except Exception as e:
        logger.error(f"Error getting module code: {str(e)}")
        return 'EE3350'  # Safe fallback


@contextmanager
def temp_argv(new_argv):
    """Context manager to temporarily replace sys.argv."""
    original_argv = sys.argv.copy()
    try:
        sys.argv = new_argv
        yield
    finally:
        sys.argv = original_argv


def execute_direct_call(script_func, **kwargs):
    """Execute script function directly with parameters."""
    try:
        logger.info(f"Executing {script_func.__name__} with kwargs: {kwargs}")
        result = script_func(**kwargs)
        return {'success': True, 'message': 'Script executed successfully', 'result': result}
    except Exception as e:
        logger.error(f"Direct execution failed: {str(e)}")
        return {'success': False, 'error': str(e)}


def execute_script_with_args(script_func, script_name, **kwargs):
    """Execute a script with proper argument handling using sys.argv."""
    try:
        # Build the command line arguments based on the script
        script_file = f"{script_name}.py"
        args = [script_file]
        
        if script_name == 'embed_lecture_materials':
            args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
            args.extend(['--model', kwargs.get('model', 'gpt-4o')])
            args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
            if kwargs.get('module_code'):
                args.extend(['--module', kwargs.get('module_code')])
                
        elif script_name == 'extract_and_save':
            # FIX: Use the passed provider instead of hardcoding or defaulting incorrectly
            args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
            args.extend(['--model', kwargs.get('model', 'gpt-4o')])
            if kwargs.get('from_db', True):
                args.append('--from-db')
                
        elif script_name == 'embed_model_answers':
            args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
            args.extend(['--model', kwargs.get('model', 'gpt-4o')])
            args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
            
        elif script_name == 'mark_papers':
            args.extend(['--provider', kwargs.get('provider', 'OpenAI')])
            args.extend(['--llm', kwargs.get('llm', 'gpt-4o')])
            args.extend(['--embedder', kwargs.get('embedder', 'text-embedding-3-small')])
            args.extend(['--module', kwargs.get('module', 'EE3350')])
            args.extend(['--year', kwargs.get('year', '2025')])
            args.extend(['--month', kwargs.get('month', 'June')])
        
        logger.info(f"Executing {script_name} with args: {args}")
        
        # Execute with temporary sys.argv
        with temp_argv(args):
            result = script_func()
            
        return {'success': True, 'message': 'Script executed successfully', 'result': result}
        
    except Exception as e:
        logger.error(f"Script execution failed: {str(e)}")
        return {'success': False, 'error': str(e)}


def execute_script_legacy(script_func, args_dict):
    """Legacy script execution method using sys.argv manipulation."""
    try:
        # Build args list
        args = [script_func.__name__ + '.py']
        for key, value in args_dict.items():
            if value is not None:
                if isinstance(value, bool) and value:
                    args.append(f'--{key.replace("_", "-")}')
                else:
                    args.extend([f'--{key.replace("_", "-")}', str(value)])
        
        logger.info(f"Legacy execution with args: {args}")
        
        # Override sys.argv for the script
        with temp_argv(args):
            result = script_func()
        
        return {'success': True, 'message': 'Script executed successfully', 'result': result}
        
    except Exception as e:
        logger.error(f"Legacy script execution failed: {str(e)}")
        return {'success': False, 'error': str(e)}


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
        module_code = data.get('module_code')
        
        # Set default embedders based on provider
        if not embedder:
            embedder = 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001'
        
        logger.info(f"Embedding lecture materials with provider: {provider}, model: {model}")
        result = execute_script_with_args(
            embed_lecture_materials_main, 
            'embed_lecture_materials',
            provider=provider,
            model=model,
            embedder=embedder,
            module_code=module_code
        )
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': 'Lecture materials embedded successfully',
                'parameters': {
                    'provider': provider,
                    'model': model,
                    'embedder': embedder,
                    'module_code': module_code
                }
            })
        else:
            return jsonify({'success': False, 'error': result['error']}), 500
            
    except Exception as e:
        logger.error(f"Error in embed lecture materials: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/extract-and-save', methods=['POST'])
def extract_and_save():
    """Extract and save student answers."""
    try:
        data = request.get_json() or {}
        provider = data.get('provider', 'OpenAI')
        model = data.get('model', 'gpt-4o' if provider == 'OpenAI' else 'gemini-2.0-flash')
        
        logger.info(f"Extracting and saving answers with provider: {provider}, model: {model}")
        result = execute_script_with_args(
            extract_and_save_main,
            'extract_and_save',
            provider=provider,
            model=model,
            from_db=True
        )
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': 'Student answers extracted and saved successfully',
                'parameters': {
                    'provider': provider,
                    'model': model
                }
            })
        else:
            return jsonify({'success': False, 'error': result['error']}), 500
            
    except Exception as e:
        logger.error(f"Error in extract and save: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/embed-from-db', methods=['POST'])
def embed_from_db():
    """Embed student answers from database."""
    try:
        data = request.get_json() or {}
        provider = data.get('provider', 'OpenAI')
        model = data.get('model', 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001')
        module_code = data.get('module_code', 'EE3350')
        year = data.get('year', '2025')
        month = data.get('month', 'June')
        
        logger.info(f"Embedding from database with provider: {provider}, model: {model}")
        
        # Use direct function call instead of sys.argv manipulation
        result = execute_direct_call(
            embed_from_db_main,
            provider=provider,
            model=model,
            module_code=module_code,
            year=int(year),  # Make sure year is integer
            month=month
        )
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': 'Student answers embedded successfully',
                'parameters': {
                    'provider': provider,
                    'model': model,
                    'module_code': module_code,
                    'year': year,
                    'month': month
                }
            })
        else:
            return jsonify({'success': False, 'error': result['error']}), 500
            
    except Exception as e:
        logger.error(f"Error in embed from db: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/embed-model-answers', methods=['POST'])
def embed_model_answers():
    """Embed model answers."""
    try:
        data = request.get_json() or {}
        provider = data.get('provider', 'OpenAI')
        model = data.get('model', 'gpt-4o' if provider == 'OpenAI' else 'gemini-2.0-flash')
        embedder = data.get('embedder', 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001')
        
        logger.info(f"Embedding model answers with provider: {provider}, model: {model}")
        result = execute_script_with_args(
            embed_model_answers_main,
            'embed_model_answers',
            provider=provider,
            model=model,
            embedder=embedder
        )
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': 'Model answers embedded successfully',
                'parameters': {
                    'provider': provider,
                    'model': model,
                    'embedder': embedder
                }
            })
        else:
            return jsonify({'success': False, 'error': result['error']}), 500
            
    except Exception as e:
        logger.error(f"Error in embed model answers: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/mark-papers', methods=['POST'])
def mark_papers():
    """Mark all papers."""
    try:
        data = request.get_json() or {}
        provider = data.get('provider', 'OpenAI')
        llm = data.get('llm', 'gpt-4o' if provider == 'OpenAI' else 'gemini-2.0-flash')
        embedder = data.get('embedder', 'text-embedding-3-small' if provider == 'OpenAI' else 'embedding-001')
        module = data.get('module', 'EE3350')
        year = data.get('year', '2025')
        month = data.get('month', 'June')
        
        logger.info(f"Marking papers with provider: {provider}, llm: {llm}")
        result = execute_script_with_args(
            mark_all_papers_main,
            'mark_papers',
            provider=provider,
            llm=llm,
            embedder=embedder,
            module=module,
            year=year,
            month=month
        )
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': 'Papers marked successfully',
                'parameters': {
                    'provider': provider,
                    'llm': llm,
                    'embedder': embedder,
                    'module': module,
                    'year': year,
                    'month': month
                }
            })
        else:
            return jsonify({'success': False, 'error': result['error']}), 500
            
    except Exception as e:
        logger.error(f"Error in mark papers: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/run-full-evaluation', methods=['POST'])
def run_full_evaluation():
    """Run the complete evaluation pipeline."""
    try:
        data = request.get_json() or {}
        provider = data.get('provider', 'OpenAI')
        module_code = data.get('module_code', 'EE3350')
        year = data.get('year', '2025')
        month = data.get('month', 'June')
        
        logger.info(f"Starting full evaluation pipeline with provider: {provider}")
        logger.info(f"Module code received: {module_code}")
        
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
        
        # Extract actual module code if it's a UUID (for embed_from_db and mark_papers)
        # These steps need the actual module code (like EE3350), not the UUID
        actual_module_code = get_actual_module_code(module_code)
        if actual_module_code != module_code:
            logger.info(f"Converted module identifier {module_code} to module code: {actual_module_code}")
        
        steps = [
            ('embed_lecture_materials', embed_lecture_materials_main, {
                'provider': provider,
                'model': llm_model,
                'embedder': embed_model,
                'module_code': module_code  # Use original for lecture materials
            }),
            ('extract_and_save', extract_and_save_main, {
                'provider': provider,  # CRITICAL FIX: Pass the correct provider
                'model': llm_model,    # CRITICAL FIX: Use the correct model for the provider
                'from_db': True
            }),
            ('embed_from_db', embed_from_db_main, {
                'provider': provider,
                'model': embed_model,
                'module_code': actual_module_code,  # Use actual module code
                'year': year,
                'month': month
            }),
            ('embed_model_answers', embed_model_answers_main, {
                'provider': provider,
                'model': llm_model,
                'embedder': embed_model
            }),
            ('mark_papers', mark_all_papers_main, {
                'provider': provider,
                'llm': llm_model,
                'embedder': embed_model.replace('models/', '') if 'models/' in embed_model else embed_model,
                'module': actual_module_code,  # Use actual module code
                'year': year,
                'month': month
            })
        ]
        
        results = []
        
        for i, (step_name, step_func, step_kwargs) in enumerate(steps):
            logger.info(f"Running step {i+1}/5: {step_name}")
            
            # Debug: Log what provider is being used for each step
            logger.info(f"Step {step_name} using provider: {step_kwargs.get('provider', 'NOT_SET')}")
            
            # Use direct call for embed_from_db, sys.argv manipulation for others
            if step_name == 'embed_from_db':
                # Convert year to int for direct call
                direct_kwargs = step_kwargs.copy()
                direct_kwargs['year'] = int(direct_kwargs['year'])
                result = execute_direct_call(step_func, **direct_kwargs)
            else:
                result = execute_script_with_args(step_func, step_name, **step_kwargs)
            
            results.append({
                'step': step_name,
                'success': result['success'],
                'error': result.get('error'),
                'provider_used': step_kwargs.get('provider', 'UNKNOWN')
            })
            
            # If a step fails, stop the pipeline
            if not result['success']:
                logger.error(f"Pipeline failed at step {step_name}: {result.get('error')}")
                break
        
        # Check if all steps completed successfully
        successful_steps = [r for r in results if r['success']]
        all_successful = len(successful_steps) == len(steps)
        
        return jsonify({
            'success': all_successful,
            'message': f'Pipeline completed: {len(successful_steps)}/{len(steps)} steps successful',
            'results': results,
            'parameters': {
                'provider': provider,
                'module_code': module_code,
                'year': year,
                'month': month,
                'llm_model': llm_model,
                'embed_model': embed_model
            }
        })
        
    except Exception as e:
        logger.error(f"Error in full evaluation: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/status', methods=['GET'])
def get_status():
    """Get current API status and available endpoints."""
    return jsonify({
        'status': 'running',
        'version': '1.0.0',
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
        'default_models': {
            'OpenAI': {
                'llm': 'gpt-4o',
                'embedder': 'text-embedding-3-small'
            },
            'GoogleGemini': {
                'llm': 'gemini-2.0-flash',
                'embedder': 'models/embedding-001'
            }
        }
    })


if __name__ == '__main__':
    print("🚀 Starting AI Exam Evaluation Flask API Server...")
    print("📍 Available endpoints:")
    print("   GET  /api/health")
    print("   GET  /api/status")
    print("   POST /api/embed-lecture-materials")
    print("   POST /api/extract-and-save")
    print("   POST /api/embed-from-db")
    print("   POST /api/embed-model-answers")
    print("   POST /api/mark-papers")
    print("   POST /api/run-full-evaluation")
    
    app.run(host='0.0.0.0', port=7000, debug=True)