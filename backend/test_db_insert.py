from database import SessionLocal
import models
from datetime import datetime

def test_insert():
    print("Probando conexión a BD...")
    try:
        db = SessionLocal()
        print("Sesión creada.")
        
        # Verificar si existe la tabla
        try:
            count = db.query(models.PrecioHistorico).count()
            print(f"Registros actuales: {count}")
        except Exception as e:
            print(f"Error consultando tabla: {e}")
            return

        # Insertar prueba
        nuevo = models.PrecioHistorico(
            fecha=datetime.now(),
            precio=123.45,
            tipo_precio="test_debug"
        )
        db.add(nuevo)
        db.commit()
        print("Inserción exitosa.")
        
        # Verificar
        count_after = db.query(models.PrecioHistorico).count()
        print(f"Registros después: {count_after}")
        
    except Exception as e:
        print(f"Error general: {e}")

if __name__ == "__main__":
    test_insert()
