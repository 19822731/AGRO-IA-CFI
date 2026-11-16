import sys
import os
import logging
from datetime import datetime
from database import SessionLocal
import models

# Configurar path para importar desde "Algoritmo v.2 "
# Nota: El espacio al final del nombre del directorio es intencional según el sistema de archivos
ALGO_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Algoritmo v.2 ")
sys.path.append(ALGO_DIR)

try:
    from motor_prd_diario import calcular_prd_diario
except ImportError as e:
    print(f"Error importando motor_prd_diario: {e}")
    sys.exit(1)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from datetime import date

def integrate_prd():
    logger.info("🚀 Iniciando integración de PRD Real...")
    
    # 1. Calcular PRD usando el algoritmo
    # Usamos la última fecha disponible en la simulación: 2025-11-26
    fecha_analisis = date(2025, 11, 26)
    resultados = calcular_prd_diario(fecha_analisis)
    
    if not resultados:
        logger.error("❌ El algoritmo no devolvió resultados.")
        return

    prd_value = resultados.get("prd")
    analisis = resultados.get("analisis_texto")
    k_factor = resultados.get("k_dinamico")
    
    logger.info(f"✅ PRD Calculado: ${prd_value:,.2f}")
    logger.info(f"   Analisis: {analisis}")

    # 2. Guardar en Base de Datos
    db = SessionLocal()
    try:
        # Buscar política activa (o crear default)
        policy = db.query(models.MarketCommissionPolicy).filter(models.MarketCommissionPolicy.name == "default").first()
        if not policy:
            policy = models.MarketCommissionPolicy(
                name="default",
                valid_from=datetime.utcnow(),
                pbase_azucar=400.0, # Valor base referencial
                k_factor=0.5,
                justification="Auto-generated"
            )
            db.add(policy)
            db.commit()

        # Insertar PRD Series
        # Asumimos segmento "AR_crudo_int" para el producto principal
        segment = "AR_crudo_int"
        
        nuevo_prd = models.PrdSeries(
            segment=segment,
            valid_from=datetime.utcnow(),
            prd_value=float(prd_value),
            stock_open=float(resultados.get("stock_real_hoy", 0)),
            domestic_demand=float(resultados.get("consumo_esperado_acumulado", 0)),
            exportable_balance=0.0, # Dato no provisto por el script actual
            policy_id=policy.id,
            inputs_hash=f"algo_v2_{datetime.utcnow().timestamp()}",
            justification=analisis
        )
        
        db.add(nuevo_prd)
        db.commit()
        logger.info(f"✅ PRD insertado en BD para segmento {segment}")
        
    except Exception as e:
        logger.error(f"❌ Error guardando en BD: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    integrate_prd()
