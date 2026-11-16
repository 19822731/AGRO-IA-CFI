import requests
import json

# Login first to get token
login_url = "http://127.0.0.1:8000/auth/token"
login_data = {"username": "producer@test.com", "password": "password123"}
response = requests.post(login_url, data=login_data)

if response.status_code != 200:
    print(f"Login failed: {response.text}")
    exit(1)

token = response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Test Wallet Summary
summary_url = "http://127.0.0.1:8000/api/wallet/summary"
response = requests.get(summary_url, headers=headers)

print(f"Status Code: {response.status_code}")
print("Response Body:")
print(json.dumps(response.json(), indent=2))
