from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson.objectid import ObjectId
from datetime import datetime, timedelta
from marshmallow.exceptions import ValidationError
from ..schemas.property_schema import PropertySchema
from ..utils.decorators import role_required, property_ownership_required
from .. import mongo  # <-- FIX: Import mongo directly

properties_bp = Blueprint('properties', __name__, url_prefix='/properties')
property_schema = PropertySchema()

@properties_bp.route('', methods=['GET'])
def get_properties():
    filter_dict = {}
    if 'location' in request.args:
        filter_dict['location'] = {"$regex": request.args['location'], "$options": "i"}
    if 'property_type' in request.args:
        filter_dict['property_type'] = request.args['property_type']
    if 'min_price' in request.args:
        filter_dict['price'] = filter_dict.get('price', {})
        filter_dict['price']['$gte'] = float(request.args['min_price'])
    if 'max_price' in request.args:
        filter_dict['price'] = filter_dict.get('price', {})
        filter_dict['price']['$lte'] = float(request.args['max_price'])
    if 'bedrooms' in request.args:
        filter_dict['bedrooms'] = int(request.args['bedrooms'])
    
    # FIX: Use mongo directly
    properties = mongo.db.properties.find(filter_dict)
    
    result = []
    for prop in properties:
        prop['_id'] = str(prop['_id'])
        created_at = prop.get('created_at')
        if isinstance(created_at, datetime):
            prop['listing_age'] = (datetime.utcnow() - created_at).days
        result.append(prop)

    return jsonify(result), 200

@properties_bp.route('', methods=['POST'])
@jwt_required()
@role_required('seller', 'agent')
def create_property():
    json_data = request.get_json()
    if not json_data:
        return jsonify({"message": "No input data provided"}), 400

    try:
        data = property_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 422

    data['seller_id'] = get_jwt_identity()
    data['views'] = 0
    data['listing_age'] = 0
    data['created_at'] = datetime.utcnow()
    data['updated_at'] = datetime.utcnow()

    # FIX: Use mongo directly
    result = mongo.db.properties.insert_one(data)
    if result.inserted_id:
        data['_id'] = str(result.inserted_id)
        return jsonify(data), 201
    return jsonify({"message": "Failed to create property"}), 500

@properties_bp.route('/<id>', methods=['GET'])
def get_property(id):
    if not ObjectId.is_valid(id):
        return jsonify({"message": "Invalid property ID"}), 400
        
    # FIX: Use mongo directly
    property = mongo.db.properties.find_one_and_update(
        {"_id": ObjectId(id)},
        {"$inc": {"views": 1}}
    )
    if property:
        property['_id'] = str(property['_id'])
        return jsonify(property), 200
    return jsonify({"message": "Property not found"}), 404

@properties_bp.route('/<id>', methods=['PUT'])
@property_ownership_required
def update_property(id):
    json_data = request.get_json()
    if not json_data:
        return jsonify({"message": "No input data provided"}), 400

    try:
        data = property_schema.load(json_data, partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 422

    data['updated_at'] = datetime.utcnow()
    
    # FIX: Use mongo directly
    result = mongo.db.properties.update_one(
        {"_id": ObjectId(id)},
        {"$set": data}
    )
    if result.modified_count:
        updated_property = mongo.db.properties.find_one({"_id": ObjectId(id)})
        updated_property['_id'] = str(updated_property['_id'])
        return jsonify(updated_property), 200
    return jsonify({"message": "Property not found or no changes made"}), 404

@properties_bp.route('/<id>', methods=['DELETE'])
@property_ownership_required
def delete_property(id):
    # FIX: Use mongo directly
    result = mongo.db.properties.delete_one({"_id": ObjectId(id)})
    if result.deleted_count:
        return jsonify({"message": "Property deleted successfully"}), 200
    return jsonify({"message": "Property not found"}), 404

@properties_bp.route('/<property_id>/contact', methods=['POST'])
@jwt_required()
def contact_seller(property_id):
    """Send a message to the seller of a property."""
    current_user = get_jwt_identity()
    if not ObjectId.is_valid(property_id):
        return jsonify({"message": "Invalid property ID"}), 400

    # Find the property to get the seller's ID
    property = mongo.db.properties.find_one({"_id": ObjectId(property_id)})
    if not property:
        return jsonify({"message": "Property not found"}), 404
    
    seller_id = property.get('seller_id')
    if not seller_id:
        return jsonify({"message": "Seller information not available"}), 404

    # Prevent a user from contacting themselves
    if seller_id == current_user:
        return jsonify({"message": "You cannot contact yourself"}), 400

    json_data = request.get_json()
    if not json_data or not 'message' in json_data:
        return jsonify({"message": "Message content is required"}), 400

    # Create the message document
    message = {
        "from_user": current_user,
        "to_user": seller_id,
        "property_id": property_id,
        "message": json_data['message'],
        "created_at": datetime.utcnow()
    }

    # Insert the message into the database
    mongo.db.messages.insert_one(message)
    return jsonify({"message": "Your message has been sent successfully"}), 201