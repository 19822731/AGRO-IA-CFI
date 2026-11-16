
import logging
from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from database import SessionLocal
from celery_worker import celery_app
import models

logger = logging.getLogger(__name__)

@celery_app.task(name="demand.update_zonal_demand_baseline")
def update_zonal_demand_baseline():
    """
    Tarea horaria para calcular y almacenar el volumen de demanda por provincia y producto.
    """
    db = SessionLocal()
    try:
        logger.info("Iniciando tarea de cálculo de demanda zonal...")
        
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        
        # Agrupar órdenes de compra de la última hora por producto y provincia del usuario
        demand_data = (
            db.query(
                models.Producto.id.label("producto_id"),
                models.Usuario.provincia.label("provincia"),
                func.sum(models.Orden.cantidad_original).label("volumen")
            )
            .join(models.Usuario, models.Orden.usuario_id == models.Usuario.id)
            .join(models.Producto, models.Orden.producto_id == models.Producto.id)
            .filter(
                models.Orden.tipo_orden == 'compra',
                models.Orden.timestamp >= one_hour_ago
            )
            .group_by(models.Producto.id, models.Usuario.provincia)
        ).all()

        if not demand_data:
            logger.info("No hubo demanda en la última hora.")
            return

        # Guardar los snapshots de demanda en el historial
        for item in demand_data:
            snapshot = models.HistorialDemandaZonal(
                timestamp=datetime.utcnow().replace(minute=0, second=0, microsecond=0),
                provincia=item.provincia,
                producto_id=item.producto_id,
                volumen_demanda=item.volumen
            )
            # Usar merge para insertar o actualizar si ya existe un snapshot para esa hora/prov/prod
            db.merge(snapshot)
        
        db.commit()
        logger.info(f"Guardados {len(demand_data)} snapshots de demanda zonal.")

    except Exception as e:
        logger.error(f"Error en la tarea de demanda zonal: {e}")
        db.rollback()
    finally:
        db.close()
