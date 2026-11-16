from database import SessionLocal
from models import Transaccion, Orden, PrdSeries
import random

def fix_history():
    db = SessionLocal()
    try:
        # 1. Get current PRD
        current_prd = db.query(PrdSeries).order_by(PrdSeries.valid_from.desc()).first()
        target_price = current_prd.prd_value if current_prd else 565000.0
        print(f"Target Base Price (TN): {target_price}")
        
        # 2. Get recent transactions
        txs = db.query(Transaccion).all()
        print(f"Found {len(txs)} transactions.")
        
        # 3. Update them to be around target_price
        # We'll create a trend leading up to the target price
        count = len(txs)
        for i, tx in enumerate(txs):
            # trend from 90% of price to 100% of price
            progress = i / max(1, count)
            factor = 0.9 + (0.1 * progress) 
            
            # add random volatility +/- 2%
            volatility = random.uniform(0.98, 1.02)
            
            new_price = target_price * factor * volatility
            
            tx.precio_ejecucion = new_price
            
            # Update the order price too just in case
            if tx.orden_compra_id:
                orden = db.query(Orden).filter(Orden.id == tx.orden_compra_id).first()
                if orden:
                    orden.precio_limite = new_price
            
        db.commit()
        print("Successfully updated transaction history to match PRD.")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_history()
