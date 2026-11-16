import requests
import json

BASE_URL = "http://localhost:8000"

def test_deposit():
    # 1. Login to get token (needed? Webhook might be public or protected? The code shows it depends on nothing but db)
    # The endpoint definition: def simulate_deposit(data: dict, db: Session = Depends(get_db)):
    # It does NOT have Depends(get_current_user) or similar security. It's open.
    
    # 2. We need a valid CVU. Let's try to find one or create a user first.
    # Actually, let's just try to hit it with a random CVU and see if we get 404 (which means endpoint exists and logic runs)
    
    url = f"{BASE_URL}/api/webhooks/simulate-deposit"
    payload = {
        "cvu": "0000001234567890123456", # Fake CVU
        "amount": 1000
    }
    
    print(f"Testing POST {url} with {payload}")
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_deposit()
