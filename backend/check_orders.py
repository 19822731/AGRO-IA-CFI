from database import SessionLocal
from models import Orden, Producto

db = SessionLocal()

orders = db.query(Orden).all()
print(f"Found {len(orders)} orders.")

for o in orders:
    print(f"Order ID: {o.id}, Type: {o.tipo_orden}, State: {o.estado}, Qty: {o.cantidad_original}, Price: {o.precio_limite}")
    prod = db.query(Producto).get(o.producto_id)
    print(f"  Product: {prod.nombre}")
    print("-" * 20)

db.close()
