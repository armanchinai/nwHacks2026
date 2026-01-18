"""
"""

# Imports
from flask import Flask, jsonify, request
from flask_cors import CORS

from dotenv import load_dotenv
import os

from pipeline import audio_to_transcript, transcript_to_grade


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
    CORS(app, resources={r"/*": {"origins": CLIENT_URL, "allow_headers": ["Content-Type"]}})
    
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
        if not problem_description:
            return {"error": "Missing problem_description"}, 400
        
        transcript = audio_to_transcript(audio_file)
        # response = transcript_to_grade(transcript, problem_description)

        return jsonify({"message": transcript}), 200
        
        
        

    
    # RESPONSE HEADERS
    @app.after_request
    def after_request(response):
        response.headers['Access-Control-Allow-Origin'] = CLIENT_URL
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        # Handle OPTIONS request directly
        if request.method == 'OPTIONS':
            response.status_code = 200
        return response
            
    # REGISTER BLUEPRINTS

    return app
