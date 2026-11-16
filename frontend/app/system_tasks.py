
import logging
from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy import func, and_
from sqlalchemy.orm import Session

from database import SessionLocal
from celery_worker import celery_app
from config import settings
import models

logger = logging.getLogger(__name__)

def get_system_parameter(db: Session, key: str, default: str) -> str:
    """
    Obtiene un parámetro del sistema de la BD. Si no existe, lo crea con el valor por defecto.
    """
    param = db.query(models.SystemParameter).filter_by(key=key).first()
    if not param:
        param = models.SystemParameter(key=key, value=default, description=f"Parámetro autogenerado para {key}")
        db.add(param)
        db.commit()
        db.refresh(param)
    return param.value

def set_system_parameter(db: Session, key: str, value: str):
    """
    Actualiza un parámetro del sistema en la BD.
    """
    param = db.query(models.SystemParameter).filter_by(key=key).first()
    if param:
        param.value = value
        db.commit()

@celery_app.task(name="system.update_commission_aggressiveness")
def update_commission_aggressiveness():
    """
    Tarea diaria para auto-ajustar la agresividad de la comisión y alcanzar
    el objetivo de rentabilidad a largo plazo.
    """
    db = SessionLocal()
    try:
        logger.info("Iniciando tarea de ajuste de agresividad de comisión...")
        
        # 1. Calcular comisión promedio real de los últimos 7 días
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        
        avg_commission_query = (
            db.query(
                func.avg(models.LedgerComision.monto / (models.Transaccion.precio_ejecucion * models.Transaccion.cantidad_ejecutada))
            )
            .join(models.Transaccion, models.LedgerComision.transaccion_id == models.Transaccion.id)
            .filter(
                models.Transaccion.timestamp >= seven_days_ago,
                models.Transaccion.precio_ejecucion > 0,
                models.Transaccion.cantidad_ejecutada > 0
            )
        ).scalar()

        if avg_commission_query is None:
            logger.warning("No hay transacciones en los últimos 7 días para calcular la comisión promedio. Omitiendo ajuste.")
            return

        avg_commission_real = Decimal(str(avg_commission_query))

        # 2. Obtener agresividad actual
        agresividad_actual_str = get_system_parameter(db, "agresividad_global", "1.0")
        agresividad_actual = Decimal(agresividad_actual_str)

        # 3. Comparar y ajustar
        ajuste = Decimal("0.05") # 5% de ajuste por día
        
        if avg_commission_real < settings.TARGET_AVG_COMISION:
            # Aumentar agresividad para subir el promedio
            nueva_agresividad = agresividad_actual * (1 + ajuste)
            logger.info(f"Comisión promedio ({avg_commission_real:.4f}) por debajo del objetivo ({settings.TARGET_AVG_COMISION}). Aumentando agresividad a {nueva_agresividad:.4f}")
        elif avg_commission_real > settings.TARGET_AVG_COMISION:
            # Disminuir agresividad para bajar el promedio
            nueva_agresividad = agresividad_actual * (1 - ajuste)
            logger.info(f"Comisión promedio ({avg_commission_real:.4f}) por encima del objetivo ({settings.TARGET_AVG_COMISION}). Disminuyendo agresividad a {nueva_agresividad:.4f}")
        else:
            logger.info("Comisión promedio en línea con el objetivo. No se requiere ajuste.")
            return

        # 4. Guardar nueva agresividad
        set_system_parameter(db, "agresividad_global", str(nueva_agresividad))

    finally:
        db.close()
