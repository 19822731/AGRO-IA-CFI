from database import SessionLocal, engine
import models
import security
from decimal import Decimal # Necesario para los objetos Decimal

db = SessionLocal()

def seed_database():
    print("Poblando la base de datos con datos iniciales (versión corregida)...")

    # --- Crear Productos ---
    # Asegúrate de que los IDs aquí coincidan con los usados en billeteras_activos y órdenes si existieran.
    producto1 = models.Producto(
        id=1,
        nombre="Azúcar Refinada (Mercado Interno)",
        commodity="Azúcar",
        especificacion="Refinada",
        mercado="Interno",
        segmento_prd="AR_total", # Usado como el segmento actual
        activo=True
    )
    producto2 = models.Producto(
        id=2,
        nombre="Azúcar Crudo (Mercado Interno)", # Ejemplo para ID 2
        commodity="Azúcar",
        especificacion="Crudo",
        mercado="Interno",
        segmento_prd="AR_crudo_int", # Ejemplo de nombre de segmento
        activo=True
    )
    db.add_all([producto1, producto2])
    db.commit()


    # --- Crear Usuarios con Contraseñas Hasheadas ---
    usuario1 = models.Usuario(
        id=1, 
        email="comprador@agro.ia", 
        hashed_password=security.get_password_hash("password123")
    )
    usuario2 = models.Usuario(
        id=2, 
        email="vendedor@agro.ia", 
        hashed_password=security.get_password_hash("password456")
    )

    db.add_all([usuario1, usuario2])
    db.commit()

    # --- Crear Billeteras de Dinero (Fiat) ---
    billetera_fiat_1 = models.BilleteraFiat(usuario_id=1, saldo=Decimal("1000000.0"))
    billetera_fiat_2 = models.BilleteraFiat(usuario_id=2, saldo=Decimal("0.0"))

    db.add_all([billetera_fiat_1, billetera_fiat_2])
    db.commit()

    # --- Crear Billeteras de Activos (Warrants) ---
    # Asegúrate de que producto_id 2 exista en la tabla productos ANTES de esto
    billetera_activo_2 = models.BilleteraActivo(usuario_id=2, producto_id=2, cantidad=Decimal("15.0"))

    db.add(billetera_activo_2)
    db.commit()

    print("✅ Base de datos poblada con éxito.")

if __name__ == "__main__":
    # En un entorno de desarrollo, a veces es útil recrear la base de datos para pruebas.
    # Comentar estas líneas si se está ejecutando en un entorno donde las tablas ya existen
    # y no se desean borrar los datos existentes.
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)
    seed_database()
