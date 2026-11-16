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

def test_get_prices(product_id=2):
    token = generate_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{API_URL}/api/market/prices/{product_id}", headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("Response JSON:")
            print(json.dumps(data, indent=2))
            
            if "current_price" in data and "prd" in data:
                print("SUCCESS: Retrieved prices.")
            else:
                print("FAILURE: Missing keys in response.")
        else:
            print("Error response:", response.text)
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_get_prices()
