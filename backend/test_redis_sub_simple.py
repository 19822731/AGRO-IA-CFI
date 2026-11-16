import redis
import sys

try:
    r = redis.from_url("redis://localhost:6379", decode_responses=True)
    p = r.pubsub()
    p.subscribe("market_updates")
    
    print("Listening for market_updates... (Ctrl+C to stop)")
    
    for message in p.listen():
        if message["type"] == "message":
            print(f"RECEIVED: {message['data']}")
            sys.stdout.flush()
            # Exit after receiving one valid message to confirm flow
            if message["data"].startswith("product_id:"):
                sys.exit(0)
except Exception as e:
    print(f"Error: {e}")
