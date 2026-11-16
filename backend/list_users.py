from database import SessionLocal
from models import Usuario

def list_users():
    db = SessionLocal()
    users = db.query(Usuario).all()
    print(f"Found {len(users)} users:")
    for user in users:
        print(f"ID: {user.id}, Email: {user.email}")
    db.close()

if __name__ == "__main__":
    list_users()
