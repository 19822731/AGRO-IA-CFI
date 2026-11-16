import requests

BASE_URL = "http://127.0.0.1:8000"

def test_login_and_fetch():
    # 1. Login
    print("Attempting login...")
    login_data = {
        "username": "producer@test.com",
        "password": "password123"
    }
    try:
        response = requests.post(f"{BASE_URL}/auth/token", data=login_data)
        print(f"Login Status: {response.status_code}")
        if response.status_code != 200:
            print("Login failed:", response.text)
            return

        token_data = response.json()
        access_token = token_data.get("access_token")
        print(f"Token received: {access_token[:20]}...")

        # 2. Fetch Portfolio
        print("\nFetching Portfolio...")
        headers = {"Authorization": f"Bearer {access_token}"}
        pf_response = requests.get(f"{BASE_URL}/api/portfolio", headers=headers)
        print(f"Portfolio Status: {pf_response.status_code}")
        print("Portfolio Response:", pf_response.text)

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login_and_fetch()
