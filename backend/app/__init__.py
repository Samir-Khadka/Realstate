from flask import Flask, jsonify, send_from_directory
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow
from flask_swagger_ui import get_swaggerui_blueprint
from flask_cors import CORS
from config.config import config_by_name
import os

# Initialize extensions
mongo = PyMongo()
jwt = JWTManager()
ma = Marshmallow()

def create_app(config_name='development'):
    """Application factory pattern."""
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    # Enable CORS for frontend
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Initialize extensions with app
    mongo.init_app(app)
    jwt.init_app(app)
    ma.init_app(app)

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.properties import properties_bp
    from .routes.admin import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(properties_bp)
    app.register_blueprint(admin_bp)

    # --- SWAGGER UI CONFIGURATION ---
    swaggerui_blueprint = get_swaggerui_blueprint(
        base_url='/docs',
        api_url='/swagger.json',
    )
    app.register_blueprint(swaggerui_blueprint, url_prefix='/docs')
    # --- END SWAGGER CONFIG ---

    @app.route('/swagger.json')
    def swagger_json():
        """Serve the swagger.json file."""
        static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'static')
        return send_from_directory(static_dir, 'swagger.json')

    @app.route('/')
    def index():
        """
        Provides a high-level overview of the API, including status,
        version, and available endpoints.
        """
        api_info = {
            "message": "Real Estate API is running!",
            "status": "running",
            "version": "1.0.0",
            "instructions": "Visit /docs for interactive API documentation",
            "endpoints": {
                "authentication": {
                    "register": "/auth/register",
                    "login": "/auth/login",
                    "profile": "/auth/profile",
                    "logout": "/auth/logout",
                    "delete_account": "/auth/delete"
                },
                "properties": {
                    "browse_all": "/properties",
                    "get_single": "/properties/<id>",
                    "create": "/properties",
                    "update": "/properties/<id>",
                    "delete": "/properties/<id>",
                    "favorites": "/properties/favorites",
                    "contact_seller": "/properties/<id>/contact"
                },
                "administrative": {
                    "manage_properties": "/admin/properties",
                    "manage_users": "/admin/users",
                    "delete_property": "/admin/properties/<id>"
                }
            }
        }
        return jsonify(api_info)

    return app