from database import engine, Base
import models

def create_tables():
    print("Creando tablas en la base de datos...")
    Base.metadata.create_all(bind=engine)
    print("Tablas creadas exitosamente.")

if __name__ == "__main__":
    create_tables()
