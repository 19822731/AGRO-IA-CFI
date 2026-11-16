from database import SessionLocal
import models
import security

def seed_users():
    db = SessionLocal()
    try:
        print("Creando usuarios humanos...")
        
        users = [
            {"email": "comprador@agro.ia", "password": "password123", "rol": "viewer"},
            {"email": "vendedor@agro.ia", "password": "password456", "rol": "operator"}
        ]
        
        for u_data in users:
            user = db.query(models.Usuario).filter(models.Usuario.email == u_data["email"]).first()
            if not user:
                hashed_pw = security.get_password_hash(u_data["password"])
                user = models.Usuario(email=u_data["email"], hashed_password=hashed_pw, roles=u_data["rol"])
                db.add(user)
                print(f"Usuario creado: {u_data['email']}")
            else:
                print(f"Usuario ya existe: {u_data['email']}")
                
            db.commit()
            
            # Crear billeteras si no existen
            if user:
                # Fiat
                wallet_fiat = db.query(models.BilleteraFiat).filter(models.BilleteraFiat.usuario_id == user.id).first()
                if not wallet_fiat:
                    wallet_fiat = models.BilleteraFiat(usuario_id=user.id, saldo=1000000, moneda="ARS")
                    db.add(wallet_fiat)
                
                # Activo (solo vendedor)
                if u_data["email"] == "vendedor@agro.ia":
                    wallet_asset = db.query(models.BilleteraActivo).filter(models.BilleteraActivo.usuario_id == user.id, models.BilleteraActivo.producto_id == 2).first()
                    if not wallet_asset:
                        wallet_asset = models.BilleteraActivo(usuario_id=user.id, producto_id=2, cantidad=100)
                        db.add(wallet_asset)
                
                db.commit()

        print("✅ Usuarios humanos listos.")
        
    except Exception as e:
        print(f"Error seeding users: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_users()
