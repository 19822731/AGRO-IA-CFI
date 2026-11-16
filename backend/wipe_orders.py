from database import SessionLocal
from models import Orden, EstadoOrdenEnum

def wipe_orders():
    db = SessionLocal()
    try:
        # Cancel ALL open orders for product 2
        deleted = db.query(Orden).filter(
            Orden.producto_id == 2,
            Orden.estado == EstadoOrdenEnum.abierta
        ).update({Orden.estado: EstadoOrdenEnum.cancelada}, synchronize_session=False)
        
        db.commit()
        print(f"Wiped {deleted} orders from Order Book.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    wipe_orders()
