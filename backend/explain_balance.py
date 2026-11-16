from database import SessionLocal
import models
from sqlalchemy import func

def explain_balance():
    db = SessionLocal()
    try:
        # 1. Get User
        user = db.query(models.Usuario).filter(models.Usuario.email == "producer@test.com").first()
        if not user:
            print("User not found")
            return

        print(f"User: {user.email} (ID: {user.id})")
        print("-" * 30)

        # 2. Get Assets
        assets = db.query(models.BilleteraActivo).filter(models.BilleteraActivo.usuario_id == user.id).all()
        
        for asset in assets:
            product = db.query(models.Producto).filter(models.Producto.id == asset.producto_id).first()
            product_name = product.nombre if product else f"Unknown (ID: {asset.producto_id})"
            
            print(f"Product: {product_name} (ID: {asset.producto_id})")
            print(f"  Total in Wallet: {asset.cantidad}")

            # 3. Check Locked in Orders
            open_sell_orders = db.query(models.Orden).filter(
                models.Orden.usuario_id == user.id,
                models.Orden.producto_id == asset.producto_id,
                models.Orden.tipo_orden == models.TipoOrdenEnum.venta,
                models.Orden.estado.in_([models.EstadoOrdenEnum.abierta, models.EstadoOrdenEnum.parcialmente_ejecutada])
            ).all()

            locked = sum(
                (float(o.cantidad_original) - float(o.cantidad_ejecutada))
                for o in open_sell_orders
            )
            
            print(f"  Locked in Open Sell Orders: {locked}")
            print(f"  Available: {float(asset.cantidad) - locked}")
            print("-" * 30)

    finally:
        db.close()

if __name__ == "__main__":
    explain_balance()
