from database import SessionLocal
import models

def check_data():
    db = SessionLocal()
    try:
        users = db.query(models.Usuario).all()
        print(f"Total Users: {len(users)}")
        for u in users:
            print(f"User: {u.email} (ID: {u.id})")
            
            # Check Fiat Wallets
            fiat = db.query(models.BilleteraFiat).filter_by(usuario_id=u.id).all()
            for f in fiat:
                print(f"  - Fiat: {f.moneda} = {f.saldo}")
                
            # Check Asset Wallets
            assets = db.query(models.BilleteraActivo).filter_by(usuario_id=u.id).all()
            for a in assets:
                print(f"  - Asset ID {a.producto_id}: {a.cantidad}")
                
    finally:
        db.close()

if __name__ == "__main__":
    check_data()
