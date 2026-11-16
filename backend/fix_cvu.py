from database import SessionLocal
from models import BilleteraFiat, Usuario
import random
import string

def fix_cvu():
    db = SessionLocal()
    # Find wallet for test@example.com
    user = db.query(Usuario).filter(Usuario.email == "test@example.com").first()
    if not user:
        print("User test@example.com not found")
        return

    wallet = db.query(BilleteraFiat).filter(BilleteraFiat.usuario_id == user.id).first()
    if not wallet:
        print("Wallet not found, creating...")
        wallet = BilleteraFiat(usuario_id=user.id, moneda="ARS", saldo=0)
        db.add(wallet)
    
    if not wallet.cvu:
        print("Generating CVU for test@example.com...")
        wallet.cvu = "000000" + "".join(random.choices(string.digits, k=16))
        db.add(wallet)
        db.commit()
        print(f"CVU generated: {wallet.cvu}")
    else:
        print(f"CVU already exists: {wallet.cvu}")
    
    db.close()

if __name__ == "__main__":
    fix_cvu()
