import asyncio
import websockets
import json

async def test_ws():
    uri = "ws://localhost:8000/ws/market/2"
    async with websockets.connect(uri) as websocket:
        print(f"Conectado a {uri}")
        # Enviar token de autenticación si es necesario (el endpoint actual lo requiere en query param o header? 
        # Revisando main.py: @app.websocket("/ws/market/{product_id}") async def websocket_endpoint(websocket: WebSocket, product_id: int, token: str = Query(...)):
        # Necesito un token.
        
        # Esperar mensajes
        while True:
            try:
                message = await websocket.recv()
                data = json.loads(message)
                if data.get("type") == "ORDER_BOOK_UPDATE":
                    last_trade = data.get("last_trade")
                    print(f"Recibido update. Last Trade: {last_trade}")
                    if last_trade:
                        print("✅ Last Trade recibido correctamente!")
                        break
            except Exception as e:
                print(f"Error: {e}")
                break

if __name__ == "__main__":
    # Necesito un token válido. Voy a intentar login primero o usar uno hardcodeado si tengo.
    # Mejor simulo el cliente completo: Login -> WS
    import requests
    
    # Login
    try:
        response = requests.post("http://localhost:8000/auth/token", data={"username": "bot_1@simulation.com", "password": "BotPassword123!"})
        if response.status_code == 200:
            token = response.json()["access_token"]
            print(f"Token obtenido: {token[:10]}...")
            
            # Ejecutar test WS con token
            uri = f"ws://localhost:8000/ws/market/2?token={token}"
            
            async def run_with_token():
                async with websockets.connect(uri) as websocket:
                    print(f"Conectado a WS")
                    while True:
                        msg = await websocket.recv()
                        print(f"Mensaje crudo: {msg[:200]}...") # Imprimir primeros 200 chars
                        data = json.loads(msg)
                        if "last_trade" in data:
                            print(f"Update recibido. Last Trade: {data['last_trade']}")
                            if data['last_trade']:
                                print("✅ SUCCESS: last_trade data found.")
                                return
                        else:
                            print("Update recibido sin last_trade")

            asyncio.run(run_with_token())
        else:
            print("Error login")
    except Exception as e:
        print(f"Error: {e}")
