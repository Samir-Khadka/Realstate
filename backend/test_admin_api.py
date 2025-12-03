import requests
import json

BASE_URL = 'http://localhost:5000'

def test_admin_api():
    # 1. Login
    print("Logging in as admin...")
    login_payload = {
        "username": "admin",
        "password": "password123"
    }
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
        print(f"Login Status: {response.status_code}")
        if response.status_code != 200:
            print(f"Login Failed: {response.text}")
            return

        token = response.json().get('access_token')
        print("Login Successful. Token received.")
        
        # 2. Get Users
        print("\nFetching users...")
        headers = {
            "Authorization": f"Bearer {token}"
        }
        response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
        print(f"Get Users Status: {response.status_code}")
        print(f"Get Users Response: {response.text}")

        # 3. Get Properties
        print("\nFetching properties...")
        response = requests.get(f"{BASE_URL}/admin/properties", headers=headers)
        print(f"Get Properties Status: {response.status_code}")
        print(f"Get Properties Response: {response.text}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_admin_api()
