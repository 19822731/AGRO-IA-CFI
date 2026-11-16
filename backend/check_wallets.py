from database import SessionLocal
from models import BilleteraFiat, Usuario

def check_wallets():
    db = SessionLocal()
    wallets = db.query(BilleteraFiat).all()
    print(f"Found {len(wallets)} wallets.")
    for w in wallets:
        user = db.query(Usuario).filter(Usuario.id == w.usuario_id).first()
        email = user.email if user else "Unknown"
        print(f"User: {email}, Currency: {w.moneda}, Balance: {w.saldo}, CVU: {w.cvu}")
    db.close()

if __name__ == "__main__":
    check_wallets()
