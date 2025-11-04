from flask import Blueprint, request, jsonify
from .lb import process_lb_file  # This will now receive parsed data + file
import json
import os
import traceback

lb_uploadController_bp = Blueprint('lb_uploadController_bp', __name__)

@lb_uploadController_bp.route('/lb-upload', methods=['POST'])
def calculate_lb_uploadController():
    try:
        # 1. Get all form fields
        date = request.form.get('date')
        shift = request.form.get('shift')
        line = request.form.get('line')
        no_of_stations = request.form.get('noOfStations')
        crane_pos_raw = request.form.get('crane_pos', '[]')
        models_raw = request.form.get('models', '[]')

        # 2. Parse the models JSON string
        try:
            models = json.loads(models_raw) if models_raw else []
        except json.JSONDecodeError as e:
            return jsonify({
                'success': False, 
                'message': f'Invalid models JSON format: {str(e)}'
            }), 400

        # 3. Parse the crane_pos JSON string
        try:
            crane_pos = json.loads(crane_pos_raw) if crane_pos_raw else []
            # Validate that it's a list of integers
            if not isinstance(crane_pos, list):
                crane_pos = []
            # Ensure all elements are integers
            crane_pos = [int(pos) for pos in crane_pos if isinstance(pos, (int, float, str)) and str(pos).isdigit()]
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Warning: Could not parse crane_pos '{crane_pos_raw}': {str(e)}")
            crane_pos = []

        # 4. Get the uploaded file
        uploaded_file = request.files.get('workContent')

        if not uploaded_file:
            return jsonify({
                'success': False, 
                'message': 'No file uploaded'
            }), 400

        if uploaded_file.filename == '':
            return jsonify({
                'success': False, 
                'message': 'No file selected'
            }), 400

        # 5. Validate file extension
        allowed_extensions = {'.xlsx', '.xls', '.csv'}
        file_ext = os.path.splitext(uploaded_file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            return jsonify({
                'success': False, 
                'message': f'Invalid file type. Allowed: {", ".join(allowed_extensions)}'
            }), 400

        # 6. Save the file locally
        upload_folder = 'uploads'
        os.makedirs(upload_folder, exist_ok=True)
        upload_path = os.path.join(upload_folder, uploaded_file.filename)
        uploaded_file.save(upload_path)

        # 7. Build the data structure
        parsed_data = {
            'date': date,
            'shift': shift,
            'line': line,
            'noOfStations': int(no_of_stations) if no_of_stations else 0,
            'crane_pos': crane_pos,  # Now properly parsed as list
            'models': models,
            'file_path': upload_path
        }

        print("="*80)
        print("Parsed Data for Line Balancing:")
        print(f"  Date: {date}")
        print(f"  Shift: {shift}")
        print(f"  Line: {line}")
        print(f"  Number of Stations: {parsed_data['noOfStations']}")
        print(f"  Crane Positions: {crane_pos}")
        print(f"  Models: {models}")
        print(f"  File Path: {upload_path}")
        print("="*80)

        # 8. Pass this to your processing function
        result = process_lb_file(parsed_data)

        # 9. Optional: Clean up the uploaded file after processing
        # Uncomment the following lines if you want to delete the file after processing
        # try:
        #     if os.path.exists(upload_path):
        #         os.remove(upload_path)
        #         print(f"Cleaned up file: {upload_path}")
        # except Exception as cleanup_error:
        #     print(f"Warning: Could not delete file {upload_path}: {str(cleanup_error)}")

        return jsonify(result)

    except Exception as e:
        error_details = traceback.format_exc()
        print("="*80)
        print("ERROR in calculate_lb_uploadController:")
        print(str(e))
        print(error_details)
        print("="*80)
        return jsonify({
            'success': False, 
            'message': str(e),
            'traceback': error_details
        }), 500