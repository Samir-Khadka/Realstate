from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson.objectid import ObjectId
from .. import mongo  # <-- FIX: Import mongo directly from the app package

def role_required(*allowed_roles):
    """Decorator to require a specific user role to access an endpoint."""
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            current_user_id = get_jwt_identity()
            # FIX: Use mongo directly instead of current_app.mongo
            users_collection = mongo.db.users
            
            # Find user by their ID (which is their username in this token strategy)
            # A better strategy is to store user_id in the token. For now, we use username.
            user = users_collection.find_one({"username": current_user_id})
            
            if not user or user.get('role') not in allowed_roles:
                return jsonify({"message": "Admin access required"}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def property_ownership_required(f):
    """Decorator to ensure a user can only modify their own properties."""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        # FIX: Use mongo directly
        properties_collection = mongo.db.properties
        property_id = kwargs.get('id')
        
        if not property_id:
            return jsonify({"message": "Property ID is required"}), 400

        try:
            # FIX: Use mongo directly
            property_obj = properties_collection.find_one({"_id": ObjectId(property_id)})
        except:
            return jsonify({"message": "Invalid property ID format"}), 400

        if not property_obj:
            return jsonify({"message": "Property not found"}), 404

        # Check if the logged-in user is the seller or an admin
        # FIX: Use mongo directly
        users_collection = mongo.db.users
        user = users_collection.find_one({"username": current_user_id})
        is_admin = user and user.get('role') == 'admin'
        is_owner = property_obj.get('seller_id') == current_user_id

        if not (is_owner or is_admin):
            return jsonify({"message": "You do not have permission to modify this property"}), 403
            
        return f(*args, **kwargs)
    return decorated_function