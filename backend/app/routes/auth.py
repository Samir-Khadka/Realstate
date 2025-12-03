from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from bson.objectid import ObjectId
from marshmallow.exceptions import ValidationError
from datetime import datetime
from ..schemas.user_schema import UserSchema
from ..utils.helpers import hash_password, check_password
from .. import mongo

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')
user_schema = UserSchema()

@auth_bp.route('/register', methods=['POST'])
def register():
    json_data = request.get_json()
    if not json_data:
        return jsonify({"message": "No input data provided"}), 400

    if mongo.db.users.find_one({"username": json_data.get('username')}):
        return jsonify({"message": "Username already exists."}), 400
    if mongo.db.users.find_one({"email": json_data.get('email')}):
        return jsonify({"message": "Email already registered."}), 400

    try:
        data = user_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 422

    data['password'] = hash_password(data['password'])
    # Use provided role or default to 'buyer'
    if 'role' not in data or not data['role']:
        data['role'] = 'buyer'
    data['created_at'] = datetime.utcnow()

    result = mongo.db.users.insert_one(data)
    if result.inserted_id:
        return jsonify({"message": "User created successfully!"}), 201
    return jsonify({"message": "Failed to create user"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    json_data = request.get_json()
    if not json_data or not json_data.get('username') or not json_data.get('password'):
        return jsonify({"message": "Username and password required"}), 400

    user = mongo.db.users.find_one({"username": json_data['username']})
    if user and check_password(json_data['password'], user['password']):
        access_token = create_access_token(identity=user['username'])
        return jsonify(access_token=access_token), 200
    
    return jsonify({"message": "Invalid credentials"}), 401

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    current_user = get_jwt_identity()
    user = mongo.db.users.find_one({"username": current_user})
    if user:
        user.pop('password', None)
        user['_id'] = str(user['_id'])
        return jsonify(user), 200
    return jsonify({"message": "User not found"}), 404

@auth_bp.route('/upload-profile-picture', methods=['POST'])
@jwt_required()
def upload_profile_picture():
    """
    Upload profile picture as base64 encoded image
    """
    current_user = get_jwt_identity()
    json_data = request.get_json()
    
    if not json_data or 'profile_picture' not in json_data:
        return jsonify({"message": "No image data provided"}), 400
    
    profile_picture = json_data['profile_picture']
    
    # Update user's profile picture
    result = mongo.db.users.update_one(
        {"username": current_user},
        {"$set": {"profile_picture": profile_picture}}
    )
    
    if result.modified_count:
        return jsonify({"message": "Profile picture updated successfully!"}), 200
    return jsonify({"message": "Failed to update profile picture"}), 500

@auth_bp.route('/delete', methods=['DELETE'])
@jwt_required()
def delete_account():
    current_user = get_jwt_identity()
    result = mongo.db.users.delete_one({"username": current_user})
    if result.deleted_count:
        mongo.db.properties.delete_many({"seller_id": current_user})
        return jsonify({"message": "Account deleted successfully"}), 200
    return jsonify({"message": "Failed to delete account"}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logs out a user.
    In a JWT-based system, the actual logout is handled by the client
    by discarding the token. This endpoint simply confirms the action.
    """
    return jsonify({"message": "Successfully logged out"}), 200