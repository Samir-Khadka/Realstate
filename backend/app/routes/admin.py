from flask import Blueprint, jsonify, request
from bson.objectid import ObjectId
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..utils.decorators import role_required
from .. import mongo

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.route('/properties', methods=['GET'])
@role_required('admin')
def get_properties_for_admin():
    filter_dict = {}
    if 'status' in request.args and request.args['status'] == 'reported':
        filter_dict['status'] = 'reported'
    if 'seller_id' in request.args:
        filter_dict['seller_id'] = request.args['seller_id']

    properties = mongo.db.properties.find(filter_dict)
    result = []
    for prop in properties:
        prop['_id'] = str(prop['_id'])
        result.append(prop)
    
    return jsonify(result), 200

@admin_bp.route('/properties/<id>', methods=['DELETE'])
@role_required('admin')
def admin_delete_property(id):
    if not ObjectId.is_valid(id):
        return jsonify({"message": "Invalid property ID"}), 400
    
    result = mongo.db.properties.delete_one({"_id": ObjectId(id)})
    if result.deleted_count:
        return jsonify({"message": "Property deleted by admin"}), 200
    return jsonify({"message": "Property not found"}), 404

@admin_bp.route('/users', methods=['GET'])
@role_required('admin')
def get_all_users():
    users = list(mongo.db.users.find({}, {'password': 0}))
    for user in users:
        user['_id'] = str(user['_id'])
    return jsonify(users), 200

@admin_bp.route('/users/<username>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_user(username):
    """
    Delete a user by username (admin only)
    """
    # Prevent admin from deleting themselves
    current_user = get_jwt_identity()
    if current_user == username:
        return jsonify({"message": "Cannot delete your own account"}), 400
    
    # Delete user
    result = mongo.db.users.delete_one({"username": username})
    
    if result.deleted_count:
        # Also delete their properties
        mongo.db.properties.delete_many({"seller_id": username})
        return jsonify({"message": f"User {username} deleted successfully"}), 200
    
    return jsonify({"message": "User not found"}), 404

@admin_bp.route('/users/<username>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_user(username):
    """
    Update user details (admin only)
    """
    json_data = request.get_json()
    if not json_data:
        return jsonify({"message": "No data provided"}), 400
    
    # Prepare update data
    update_data = {}
    
    if 'email' in json_data:
        # Check if email is already taken by another user
        existing = mongo.db.users.find_one({"email": json_data['email'], "username": {"$ne": username}})
        if existing:
            return jsonify({"message": "Email already in use"}), 400
        update_data['email'] = json_data['email']
    
    if 'role' in json_data:
        valid_roles = ['buyer', 'seller', 'agent', 'admin']
        if json_data['role'] not in valid_roles:
            return jsonify({"message": f"Invalid role. Must be one of: {', '.join(valid_roles)}"}), 400
        update_data['role'] = json_data['role']
    
    if not update_data:
        return jsonify({"message": "No valid fields to update"}), 400
    
    # Update user
    result = mongo.db.users.update_one(
        {"username": username},
        {"$set": update_data}
    )
    
    if result.matched_count:
        return jsonify({"message": "User updated successfully"}), 200
    
    return jsonify({"message": "User not found"}), 404