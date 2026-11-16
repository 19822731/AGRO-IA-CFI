from database import SessionLocal
from models import Transaccion, Orden, Producto

db = SessionLocal()

txs = db.query(Transaccion).all()
print(f"Found {len(txs)} transactions.")

for tx in txs:
    print(f"Tx ID: {tx.id}, Price: {tx.precio_ejecucion}, Qty: {tx.cantidad_ejecutada}")
    # Get product
    order = db.query(Orden).get(tx.orden_compra_id)
    if order:
        prod = db.query(Producto).get(order.producto_id)
        print(f"  Product: {prod.nombre} (ID: {prod.id})")
    print("-" * 20)

db.close()
