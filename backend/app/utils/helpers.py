import bcrypt

def hash_password(password):
    """Hashes a password using bcrypt."""
    pwhash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return pwhash.decode('utf-8')

def check_password(password, hashed_password):
    """Checks a password against a bcrypt hash."""
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))