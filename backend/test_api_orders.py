import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def login(email, password):
    response = requests.post(f"{BASE_URL}/auth/token", data={
        "username": email,
        "password": password
    })
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"Login failed: {response.text}")
        return None

def create_order(token, product_id, tipo_orden, cantidad, precio):
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "producto_id": product_id,
        "tipo_orden": tipo_orden,
        "tipo_ejecucion": "limite",
        "cantidad_original": cantidad,
        "precio_limite": precio
    }
    response = requests.post(f"{BASE_URL}/mercado/ordenes/", json=data, headers=headers)
    if response.status_code == 200:
        print(f"Order created: {response.json()}")
        return response.json()
    else:
        print(f"Create order failed: {response.text}")
        return None

def get_order_book(product_id):
    response = requests.get(f"{BASE_URL}/mercado/productos/{product_id}/orderbook")
    if response.status_code == 200:
        print(f"Order book: {json.dumps(response.json(), indent=2)}")
        return response.json()
    else:
        print(f"Get order book failed: {response.text}")
        return None

def main():
    # 1. Login
    print("Logging in...")
    token = login("test@example.com", "password123") # Assuming this user exists from previous tests
    if not token:
        # Try creating user if login fails
        print("Creating user...")
        requests.post(f"{BASE_URL}/usuarios/", json={"email": "test@example.com", "password": "password123"})
        token = login("test@example.com", "password123")
    
    if not token:
        return

    # Fund the user directly in DB
    try:
        from database import SessionLocal
        from models import Usuario, BilleteraFiat
        from decimal import Decimal
        
        db = SessionLocal()
        user = db.query(Usuario).filter(Usuario.email == "test@example.com").first()
        if user:
            wallet = db.query(BilleteraFiat).filter(BilleteraFiat.usuario_id == user.id, BilleteraFiat.moneda == "ARS").first()
            if not wallet:
                wallet = BilleteraFiat(usuario_id=user.id, moneda="ARS", saldo=Decimal("1000000"))
                db.add(wallet)
            else:
                wallet.saldo = Decimal("1000000")
            db.commit()
            print("User funded with 1,000,000 ARS")
        db.close()
    except Exception as e:
        print(f"Error funding user: {e}")

    # 2. Create Order
    print("\nCreating Buy Order...")
    order = create_order(token, 2, "compra", 10, 20.5) # Product ID 2
    
    # 3. Fetch Order Book
    print("\nFetching Order Book...")
    get_order_book(2)

if __name__ == "__main__":
    main()
