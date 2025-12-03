import sys
import os

# --- PYTHON PATH FIX ---
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(PROJECT_ROOT)
# --- END: PYTHON PATH FIX ---

import pytest
from app import create_app, mongo
from bson.objectid import ObjectId

@pytest.fixture(scope='module')
def test_client():
    """
    A test client for the app.
    """
    os.environ['FLASK_ENV'] = 'testing'
    flask_app = create_app('testing')

    with flask_app.test_client() as testing_client:
        with flask_app.app_context():
            yield testing_client

@pytest.fixture(scope='module')
def init_database(test_client):
    """
    Initializes the database with a test user.
    """
    # Clear the database before tests
    mongo.db.users.delete_many({})
    mongo.db.properties.delete_many({})

    # Step 1: Create a test user with the default role ('buyer')
    test_user = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
        # NOTE: We do NOT include 'role' here because the schema is dump_only
    }
    
    response = test_client.post('/auth/register', json=test_user)
    assert response.status_code == 201, f"Test user creation failed with status {response.status_code}: {response.json}"

    # Step 2: Manually update the user's role in the database to 'seller' for testing purposes
    mongo.db.users.update_one(
        {"username": "testuser"},
        {"$set": {"role": "seller"}}
    )

    yield # This is where the testing happens

    # Clean up after tests
    mongo.db.users.delete_many({})
    mongo.db.properties.delete_many({})

@pytest.fixture
def auth_headers(test_client, init_database):
    """
    Logs in the test user and returns the authorization headers.
    """
    response = test_client.post('/auth/login', json={
        "username": "testuser",
        "password": "password123"
    })
    
    assert response.status_code == 200, f"Test user login failed with status {response.status_code}: {response.json}"
    
    token = response.json['access_token']
    return {'Authorization': f'Bearer {token}'}