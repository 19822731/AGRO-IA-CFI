from database import SessionLocal
from models import Usuario
from security import get_password_hash

def reset_password(email, new_password):
    db = SessionLocal()
    user = db.query(Usuario).filter(Usuario.email == email).first()
    if user:
        user.hashed_password = get_password_hash(new_password)
        db.commit()
        print(f"Password for {email} reset to {new_password}")
    else:
        print(f"User {email} not found")
    db.close()

if __name__ == "__main__":
    reset_password("producer@test.com", "password123")
