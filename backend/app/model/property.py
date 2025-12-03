# This file acts as a schema definition for clarity.

property_model = {
    "property_title": "string",
    "price": "float",
    "location": "string",
    "property_type": "string (e.g., apartment, villa)",
    "bedrooms": "integer",
    "bathrooms": "integer",
    "area_sqft": "integer",
    "listing_age": "integer (days)",
    "views": "integer",
    "seller_id": "string (references user.username)",
    "created_at": "datetime (ISO 8601)",
    "updated_at": "datetime (ISO 8601)"
}