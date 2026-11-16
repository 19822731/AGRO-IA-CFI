import requests
import json

BASE_URL = "http://localhost:8000"

# We need a token. Let's try to login first or use a known user if we can mock auth.
# Actually, for quick testing, I can try to access it. If it requires auth (which it does), I need a token.
# I'll assume I can get a token via login or I'll check if I can bypass it for testing.
# The endpoint is: def get_wallet_activity(current_user: models.Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
# So it needs a valid token.

def login():
    url = f"{BASE_URL}/auth/token"
    # Assuming test user credentials from previous context or standard defaults
    payload = {"username": "test@example.com", "password": "password123"} 
    try:
        response = requests.post(url, data=payload)
        if response.status_code == 200:
            return response.json().get("access_token")
        else:
            print(f"Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def test_activity():
    token = login()
    if not token:
        print("Skipping activity test due to login failure.")
        return

    url = f"{BASE_URL}/api/wallet/activity"
    headers = {"Authorization": f"Bearer {token}"}
    
    print(f"Testing GET {url}")
    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_activity()
