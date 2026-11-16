import requests
import json

# Configuration
BASE_URL = "http://127.0.0.1:8000"
EMAIL = "producer@test.com"
PASSWORD = "password123" # Assuming this is the password, or I might need to check how to get a token. 
# If I don't know the password, I can't login easily via script without resetting it.
# However, I can use the 'security' module to create a token if I have access to the code.

from security import create_access_token
from datetime import timedelta

# Generate a token directly since I have backend access
access_token = create_access_token(
    data={"sub": EMAIL},
    expires_delta=timedelta(minutes=30)
)

print(f"Generated Token: {access_token[:20]}...")

headers = {
    "Authorization": f"Bearer {access_token}"
}

try:
    response = requests.get(f"{BASE_URL}/api/wallet/summary", headers=headers)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Response JSON:")
        print(json.dumps(response.json(), indent=2))
    else:
        print("Error Response:")
        print(response.text)
except Exception as e:
    print(f"Request failed: {e}")
