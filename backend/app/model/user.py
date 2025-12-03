# This file acts as a schema definition for clarity.
# MongoDB is schemaless, but this documents our intended structure.

USER_ROLES = ['buyer', 'seller', 'agent', 'admin']

user_model = {
    "username": "string (unique)",
    "email": "string (unique)",
    "password_hash": "string",
    "role": f"string (one of: {', '.join(USER_ROLES)})",
    "created_at": "datetime (ISO 8601)"
}