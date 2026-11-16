import redis
import time

def test_sub():
    r = redis.from_url("redis://127.0.0.1:6379", decode_responses=True)
    p = r.pubsub()
    p.subscribe("market_updates")
    print("Suscrito a market_updates...")
    
    while True:
        message = p.get_message()
        if message:
            print(f"Mensaje recibido: {message}")
        time.sleep(0.1)

if __name__ == "__main__":
    test_sub()
