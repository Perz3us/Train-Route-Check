import requests
import json

def verify_login():
    url = "http://localhost:3000/api/auth/login"
    payload = {
        "email": "admin@example.com",
        "password": "password"
    }
    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        response.raise_for_status()  # Raise an exception for bad status codes

        print("Login successful!")
        print("Response:", response.json())
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        if e.response:
            print(f"Response content: {e.response.text}")

if __name__ == "__main__":
    verify_login()
