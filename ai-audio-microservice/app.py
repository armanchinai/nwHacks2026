"""
"""

# Imports
from flask import Flask, jsonify, request
from flask_cors import CORS

from dotenv import load_dotenv
import os

from grading import grade_submission


# CONSTANTS
load_dotenv()
CLIENT_URL = os.getenv('CLIENT_URL')


# INIT FLASK APP
app = Flask(__name__)
CORS(app)


# FLASK CONFIGURATION
def create_app():
    """
    """
    load_dotenv()

    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*", "allow_headers": ["Content-Type"]}})
    
    # ROUTES
    @app.route('/', methods=['GET'])
    def root():
        return jsonify({"message": "Hello World"})
    
    @app.route('/health', methods=['GET'])
    def health():
        return jsonify({"status": "OK"}), 200
    
    @app.route('/options', methods=['OPTIONS'])
    def options():
        return jsonify({}), 200
    
    @app.route('/grade', methods=['POST'])
    def grade():
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400
        audio_file = request.files['file']

        problem_description = request.form.get("problem_description")
        code_snippet = request.form.get("code_snippet")
        if not code_snippet:
            return {"error": "Missing code_snippet"}, 400
        if not problem_description:
            return {"error": "Missing problem_description"}, 400
        
        response = grade_submission(audio_file, code_snippet, problem_description)
        return jsonify({"message": response}), 200

    
    # RESPONSE HEADERS
    @app.after_request
    def after_request(response):
        response.headers['Access-Control-Allow-Origin'] = "*"
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        # Handle OPTIONS request directly
        if request.method == 'OPTIONS':
            response.status_code = 200
        return response

    return app
