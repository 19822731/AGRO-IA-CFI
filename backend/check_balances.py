from database import SessionLocal
from models import Usuario, BilleteraFiat, BilleteraActivo, Producto
from security import get_password_hash

db = SessionLocal()

# Find the user (assuming there's only one or we can find by a known email if we had it, 
# but for now let's list all users and their balances)
users = db.query(Usuario).all()

print(f"Found {len(users)} users.")

for user in users:
    print(f"User: {user.email} (ID: {user.id})")
for user in users:
    print(f"User: {user.email} (ID: {user.id})")
    
    # Check Fiat Wallets
    fiat_wallets = db.query(BilleteraFiat).filter(BilleteraFiat.usuario_id == user.id).all()
    if fiat_wallets:
        for fw in fiat_wallets:
            print(f"  Fiat Balance ({fw.moneda}): {fw.saldo}")
    else:
        print("  No fiat wallet found.")

    # Check Asset Wallets
    asset_wallets = db.query(BilleteraActivo).filter(BilleteraActivo.usuario_id == user.id).all()
    if asset_wallets:
        print(f"  Assets: {len(asset_wallets)}")
        for aw in asset_wallets:
            product = db.query(Producto).filter(Producto.id == aw.producto_id).first()
            product_name = product.nombre if product else f"Product {aw.producto_id}"
            print(f"    {product_name}: {aw.cantidad}")
    else:
        print("  No assets found.")
    print("-" * 20)

db.close()
