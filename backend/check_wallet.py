from main import SessionLocal, models
from decimal import Decimal

db = SessionLocal()
user = db.query(models.Usuario).filter(models.Usuario.email == "producer@test.com").first()
if user:
    print(f"User Found: {user.email} (ID: {user.id})")
    assets = db.query(models.BilleteraActivo).filter(models.BilleteraActivo.usuario_id == user.id).all()
    print(f"Assets count: {len(assets)}")
    for asset in assets:
        print(f"Product: {asset.producto.nombre}, Qty: {asset.cantidad}")
else:
    print("User producer@test.com not found")
db.close()
