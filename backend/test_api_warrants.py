import requests
import jwt
import datetime

# Configuration
API_URL = "http://127.0.0.1:8000"
USER_EMAIL = "producer@test.com"
from security import create_access_token
from datetime import timedelta

def generate_token():
    token = create_access_token(
        data={"sub": USER_EMAIL},
        expires_delta=timedelta(minutes=30)
    )
    return token

def test_get_warrants():
    token = generate_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{API_URL}/api/warrants", headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("Response JSON:")
            import json
            print(json.dumps(data, indent=2))
            
            if len(data) == 3:
                print("SUCCESS: Retrieved 3 warrants.")
            else:
                print(f"FAILURE: Expected 3 warrants, got {len(data)}.")
        else:
            print("Error response:", response.text)
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_get_warrants()
