import time
import logging
from database import SessionLocal
from marketplace_service import ejecutar_calce_por_producto
import models

# Logging setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def run_matching_engine():
    logger.info("⚙️ Iniciando Motor de Calce Local...")
    
    while True:
        db = SessionLocal()
        try:
            # Obtener productos activos
            productos = db.query(models.Producto).filter(models.Producto.activo == True).all()
            
            for p in productos:
                matches = 0
                # Ejecutar calce hasta que no haya más coincidencias
                while ejecutar_calce_por_producto(db, p.id):
                    matches += 1
                
                if matches > 0:
                    logger.info(f"✅ {matches} calces ejecutados para {p.nombre}")
                    
        except Exception as e:
            logger.error(f"Error en ciclo de calce: {e}")
        finally:
            db.close()
            
        # Esperar un poco antes de la siguiente ronda
        time.sleep(1)

if __name__ == "__main__":
    run_matching_engine()
