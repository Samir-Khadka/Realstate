def test_register_user(test_client):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/auth/register' endpoint is posted to with valid data
    THEN check the response is valid and the user is created
    """
    response = test_client.post('/auth/register', json={
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "password123"
    })
    assert response.status_code == 201
    assert b"User created successfully!" in response.data

def test_register_duplicate_user(test_client, init_database):
    """
    GIVEN a user already exists
    WHEN the '/auth/register' endpoint is posted to with the same username
    THEN check the response is a 400 error
    """
    response = test_client.post('/auth/register', json={
        "username": "testuser", # This user is created in init_database
        "email": "another@example.com",
        "password": "password123"
    })
    assert response.status_code == 400
    assert b"Username already exists." in response.data

def test_login_valid_user(test_client, init_database):
    """
    GIVEN a valid user
    WHEN the '/auth/login' endpoint is posted to
    THEN check the response is valid and contains a token
    """
    response = test_client.post('/auth/login', json={
        "username": "testuser",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json

def test_login_invalid_user(test_client):
    """
    GIVEN an invalid user
    WHEN the '/auth/login' endpoint is posted to
    THEN check the response is a 401 error
    """
    response = test_client.post('/auth/login', json={
        "username": "wronguser",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert b"Invalid credentials" in response.data

def test_get_profile(test_client, auth_headers):
    """
    GIVEN a logged-in user
    WHEN the '/auth/profile' endpoint is requested with valid headers
    THEN check the response is valid and contains user data
    """
    response = test_client.get('/auth/profile', headers=auth_headers)
    assert response.status_code == 200
    assert response.json['username'] == 'testuser'
    assert 'password' not in response.json