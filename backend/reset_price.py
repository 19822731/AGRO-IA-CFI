from database import SessionLocal
from models import Transaccion, Orden, PrdSeries, Usuario, TipoOrdenEnum, TipoEjecucionEnum
from datetime import datetime
import uuid

def reset_market_price():
    db = SessionLocal()
    try:
        # Get target PRD
        current_prd = db.query(PrdSeries).order_by(PrdSeries.valid_from.desc()).first()
        target_price = current_prd.prd_value if current_prd else 565000.0
        
        print(f"Resetting market price to: {target_price}")
        
        # Create a dummy transaction at this price
        # We need dummy orders first? Or just insert a tx?
        # Better to just insert a tx to set the 'last price'
        
        # We need valid order IDs or null? Models say ForeignKey.
        # Let's pick any existing order or create dummy ones.
        user = db.query(Usuario).first()
        
        dummy_order = Orden(
            usuario_id=user.id,
            producto_id=2,
            tipo_orden=TipoOrdenEnum.compra,
            tipo_ejecucion=TipoEjecucionEnum.mercado,
            cantidad_original=1,
            cantidad_ejecutada=1,
            estado="ejecutada"
        )
        db.add(dummy_order)
        db.flush()
        
        tx = Transaccion(
            idempotency_key=str(uuid.uuid4()),
            orden_compra_id=dummy_order.id,
            orden_venta_id=dummy_order.id, # Self trade logic but fine for price fixing
            cantidad_ejecutada=1.0,
            precio_ejecucion=target_price,
            comision_plataforma=0,
            timestamp=datetime.utcnow()
        )
        db.add(tx)
        db.commit()
        print("Market price reset successfully.")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_market_price()
