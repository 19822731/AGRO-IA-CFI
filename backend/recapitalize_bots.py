from database import SessionLocal
from models import BilleteraFiat, BilleteraActivo, Usuario

def recapitalize_bots():
    db = SessionLocal()
    try:
        # Find all bot users
        bots = db.query(Usuario).filter(Usuario.email.like("bot_%@simulation.com")).all()
        
        for bot in bots:
            # Recapitalize Fiat wallet (ARS)
            wallet_fiat = db.query(BilleteraFiat).filter(
                BilleteraFiat.usuario_id == bot.id,
                BilleteraFiat.moneda == "ARS"
            ).first()
            
            if wallet_fiat:
                wallet_fiat.saldo = 100_000_000  # 100 Million ARS
                print(f"Recapitalized {bot.email} Fiat: $100M")
            
            # Recapitalize Asset wallet (Sugar)
            wallet_asset = db.query(BilleteraActivo).filter(
                BilleteraActivo.usuario_id == bot.id,
                BilleteraActivo.producto_id == 2
            ).first()
            
            if wallet_asset:
                wallet_asset.cantidad = 50000  # 50,000 Tons
                print(f"Recapitalized {bot.email} Asset: 50k Tons")
        
        db.commit()
        print(f"Successfully recapitalized {len(bots)} bots.")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    recapitalize_bots()
