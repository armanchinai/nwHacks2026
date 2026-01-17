"""
"""

# Imports
from flask import Flask, jsonify, request
from flask_cors import CORS

# from db_config import db, configure_db
# from session_config import configure_sessions
from dotenv import load_dotenv
import os


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
    CORS(app, resources={r"/*": {"origins": CLIENT_URL, "allow_headers": ["Content-Type"]}}, supports_credentials=True)

    # SERVICES CONFIGURATION
    #
    #
    #

    # DATABASE CONFIGURATION
    # configure_db(app)

    # SESSION CONFIGURATION
    # configure_sessions(app, db)

    
    # ROUTES
    @app.route('/', methods=['GET'])
    def root():
        return jsonify({"message": "Hello World"})
    
    @app.route('/health', methods=['GET'])
    def health():
        return jsonify({"status": "OK"}), 200
    
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

    return app, None #db
