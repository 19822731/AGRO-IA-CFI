
import requests
import json
from security import create_access_token
from datetime import timedelta

# Configuration
API_URL = "http://127.0.0.1:8000"
USER_EMAIL = "producer@test.com"

def generate_token():
    token = create_access_token(
        data={"sub": USER_EMAIL},
        expires_delta=timedelta(minutes=30)
    )
    return token

def test_market_endpoints():
    token = generate_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Testing Global Sugar Price Endpoint...")
    try:
        response = requests.get(f"{API_URL}/api/market/global/sugar", headers=headers)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Global Data Sample:", json.dumps(data, indent=2)[:200] + "...")
            if "price" in data and "history" in data:
                print("SUCCESS: Global data structure valid.")
            else:
                print("FAILURE: Missing keys in global data.")
        else:
            print("Error:", response.text)
    except Exception as e:
        print(f"Global Request failed: {e}")

    print("\nTesting Local Market History Endpoint...")
    try:
        response = requests.get(f"{API_URL}/api/market/local/history", headers=headers)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Local Data Count: {len(data)}")
            if len(data) > 0 and "price" in data[0]:
                print("SUCCESS: Local history returned.")
            else:
                print("WARNING: Local history empty or invalid structure.")
        else:
            print("Error:", response.text)
    except Exception as e:
        print(f"Local Request failed: {e}")

if __name__ == "__main__":
    test_market_endpoints()
