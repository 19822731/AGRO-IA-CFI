from database import SessionLocal
import models

def seed_products():
    db = SessionLocal()
    try:
        print("Verificando productos...")
        
        # Producto 1
        p1 = db.query(models.Producto).filter(models.Producto.id == 1).first()
        if not p1:
            p1 = models.Producto(
                id=1,
                nombre="Azúcar Refinada (Mercado Interno)",
                commodity="Azúcar",
                especificacion="Refinada",
                mercado="Interno",
                segmento_prd="AR_total",
                activo=True
            )
            db.add(p1)
            print("Producto 1 creado.")
        
        # Producto 2
        p2 = db.query(models.Producto).filter(models.Producto.id == 2).first()
        if not p2:
            p2 = models.Producto(
                id=2,
                nombre="Azúcar Crudo (Mercado Interno)",
                commodity="Azúcar",
                especificacion="Crudo",
                mercado="Interno",
                segmento_prd="AR_crudo_int",
                activo=True
            )
            db.add(p2)
            print("Producto 2 creado.")
            
        db.commit()
        print("✅ Productos verificados/creados.")
        
    except Exception as e:
        print(f"Error seeding products: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_products()
