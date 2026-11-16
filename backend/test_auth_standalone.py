from security import get_password_hash, verify_password, authenticate_user
from database import SessionLocal
import models

def test_auth():
    print("Testing Auth Logic...")
    
    # 1. Test Hashing
    pwd = "password123"
    hashed = get_password_hash(pwd)
    print(f"Password: {pwd}")
    print(f"Hash: {hashed}")
    
    # 2. Test Verify
    is_valid = verify_password(pwd, hashed)
    print(f"Verify (Direct): {is_valid}")
    
    if not is_valid:
        print("❌ Direct verification failed!")
        return

    # 3. Test DB Auth
    db = SessionLocal()
    try:
        email = "comprador@agro.ia"
        user = authenticate_user(db, email, pwd)
        if user:
            print(f"✅ DB Auth Success for {email}")
        else:
            print(f"❌ DB Auth Failed for {email}")
            # Debug why
            u = db.query(models.Usuario).filter(models.Usuario.email == email).first()
            if u:
                print(f"   User found in DB. Hash: {u.hashed_password}")
                print(f"   Verify against DB hash: {verify_password(pwd, u.hashed_password)}")
            else:
                print("   User NOT found in DB")
                
    except Exception as e:
        print(f"❌ Exception during DB Auth: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_auth()
