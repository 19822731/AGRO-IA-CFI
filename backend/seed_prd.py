from database import SessionLocal
import models
from datetime import datetime
from decimal import Decimal

def seed_prd():
    db = SessionLocal()
    try:
        print("Insertando PRD inicial...")
        
        # Crear política si no existe
        policy = db.query(models.MarketCommissionPolicy).filter(models.MarketCommissionPolicy.name == "default").first()
        if not policy:
            policy = models.MarketCommissionPolicy(
                name="default",
                valid_from=datetime.utcnow(),
                pbase_azucar=400.0,
                k_factor=0.5,
                justification="Initial Seed"
            )
            db.add(policy)
            db.commit()
            print("Política creada.")

        # Crear PRD para Azúcar (Segmento AR_crudo_int o el que tenga el producto 2)
        # Verificamos el segmento del producto 2
        prod = db.query(models.Producto).filter(models.Producto.id == 2).first()
        segment = prod.segmento_prd if prod else "AR_crudo_int"
        
        prd = models.PrdSeries(
            segment=segment,
            valid_from=datetime.utcnow(),
            prd_value=400.0,
            stock_open=100000.0,
            domestic_demand=50000.0,
            exportable_balance=50000.0,
            policy_id=policy.id,
            inputs_hash="seed_hash_123"
        )
        db.add(prd)
        db.commit()
        print(f"✅ PRD insertado para segmento {segment}: $400.00")
        
    except Exception as e:
        print(f"Error seeding PRD: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_prd()
