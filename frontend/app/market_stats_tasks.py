
import logging
from datetime import datetime, date, timedelta
from decimal import Decimal

from sqlalchemy import func, and_
from sqlalchemy.orm import Session

from database import SessionLocal
from celery_worker import celery_app
import models

logger = logging.getLogger(__name__)

@celery_app.task(name="stats.calculate_daily_market_stats")
def calculate_daily_market_stats():
    """
    Tarea diaria para calcular y almacenar estadísticas de mercado (VWAP, volatilidad, volumen)
    para cada producto.
    """
    db = SessionLocal()
    try:
        logger.info("Iniciando tarea de cálculo de estadísticas diarias de mercado...")
        
        yesterday = date.today() - timedelta(days=1)
        start_datetime = datetime.combine(yesterday, datetime.min.time())
        end_datetime = datetime.combine(yesterday, datetime.max.time())

        # Obtener todos los productos para los que hubo transacciones ayer
        product_ids = db.query(models.Orden.producto_id).distinct().join(
            models.Transaccion, models.Orden.id == models.Transaccion.orden_compra_id
        ).filter(models.Transaccion.timestamp.between(start_datetime, end_datetime)).all()

        for (producto_id,) in product_ids:
            # Obtener todas las transacciones de ayer para este producto
            transactions = db.query(models.Transaccion).join(
                models.Orden, models.Transaccion.orden_compra_id == models.Orden.id
            ).filter(
                models.Orden.producto_id == producto_id,
                models.Transaccion.timestamp.between(start_datetime, end_datetime)
            ).all()

            if not transactions:
                continue

            # Calcular VWAP, Volatilidad y Volumen
            sum_price_x_qty = sum(tx.precio_ejecucion * tx.cantidad_ejecutada for tx in transactions)
            total_volume = sum(tx.cantidad_ejecutada for tx in transactions)
            
            vwap = sum_price_x_qty / total_volume if total_volume > 0 else Decimal("0")
            
            prices = [tx.precio_ejecucion for tx in transactions]
            mean_price = sum(prices) / len(prices) if prices else Decimal("0")
            volatility = (sum((p - mean_price) ** 2 for p in prices) / len(prices)) ** Decimal("0.5") if len(prices) > 1 else Decimal("0")

            # Guardar las estadísticas
            stat_entry = models.EstadisticasMercadoDiarias(
                fecha=yesterday,
                producto_id=producto_id,
                vwap=vwap,
                volatilidad=volatility,
                volumen_total=total_volume
            )
            db.merge(stat_entry)
            logger.info(f"Estadísticas para producto {producto_id} en fecha {yesterday}: VWAP={vwap:.2f}, Volatilidad={volatility:.2f}, Volumen={total_volume}")

        db.commit()

    except Exception as e:
        logger.error(f"Error en la tarea de estadísticas diarias: {e}")
        db.rollback()
    finally:
        db.close()
