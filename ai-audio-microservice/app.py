"""
"""

# Imports
from flask import Flask, jsonify, request
from flask_cors import CORS

from dotenv import load_dotenv
import os

from transformers import WhisperProcessor, WhisperForConditionalGeneration

from pipeline import audio_to_text


# CONSTANTS
load_dotenv()
CLIENT_URL = os.getenv('CLIENT_URL')


# Initialize Flask app
app = Flask(__name__)
CORS(app)


# FLASK CONFIGURATION
def create_app():
    """
    """
    load_dotenv()

    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": CLIENT_URL, "allow_headers": ["Content-Type"]}})

    processor = WhisperProcessor.from_pretrained("openai/whisper-small")
    model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-small").to("cuda")
    
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

        userid = request.form.get("userid")
        prompt = request.form.get("prompt")
        if not userid or not prompt:
            return {"error": "Missing userid or prompt"}, 400
        
        audio_to_text(audio_file, processor, model)

        return jsonify({"message": "Audio processed successfully"}), 200
        
        
        

    
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
