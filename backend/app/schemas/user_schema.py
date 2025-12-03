from flask_marshmallow import Marshmallow
from marshmallow import fields, validate
from flask_marshmallow import Marshmallow
from marshmallow import fields, validate

ma = Marshmallow()

class UserSchema(ma.Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=50))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6), load_only=True)
    role = fields.Str(validate=validate.OneOf(['buyer', 'seller', 'agent', 'admin']))

    # The @validates decorators for username and email have been removed
    # because the uniqueness checks are now handled in the route.