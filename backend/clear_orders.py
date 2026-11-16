from sqlalchemy.orm import Session
from database import SessionLocal
import models

def clear_all_orders():
    db = SessionLocal()
    try:
        print("Eliminando órdenes y transacciones antiguas...")
        # Eliminar transacciones primero (FK)
        db.query(models.Transaccion).delete()
        # Eliminar comisiones (FK)
        db.query(models.LedgerComision).delete()
        # Eliminar órdenes
        num_orders = db.query(models.Orden).delete()
        
        # Resetear billeteras de activos de bots para que tengan saldo para vender
        # (Opcional, pero bueno para reiniciar la simulación limpia)
        bots = db.query(models.Usuario).filter(models.Usuario.email.like("bot_%")).all()
        for bot in bots:
            wallet = db.query(models.BilleteraActivo).filter_by(usuario_id=bot.id, producto_id=2).first()
            if wallet:
                wallet.cantidad = 5000
            
            wallet_fiat = db.query(models.BilleteraFiat).filter_by(usuario_id=bot.id, moneda="ARS").first()
            if wallet_fiat:
                wallet_fiat.saldo = 10000000

        db.commit()
        print(f"✅ Se eliminaron {num_orders} órdenes y se resetearon los bots.")
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_all_orders()
