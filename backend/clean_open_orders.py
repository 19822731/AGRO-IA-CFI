from database import SessionLocal
from models import Orden, EstadoOrdenEnum
import logging

def clean_orders():
    db = SessionLocal()
    try:
        # Cancel all open orders below 450,000 (likely old data)
        deleted = db.query(Orden).filter(
            Orden.estado == EstadoOrdenEnum.abierta,
            Orden.precio_limite < 450000
        ).update({Orden.estado: EstadoOrdenEnum.cancelada}, synchronize_session=False)
        
        db.commit()
        print(f"Cancelled {deleted} old low-price orders.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    clean_orders()
