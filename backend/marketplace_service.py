
import logging
from datetime import datetime, timedelta
from typing import List, Optional
from decimal import Decimal
import uuid

import holidays
import pytz
from sqlalchemy.orm import Session, aliased
from sqlalchemy import func, case
from sqlalchemy.exc import OperationalError

import models
import schemas
from database import SessionLocal
from celery_worker import celery_app
from config import settings
from app.system_tasks import get_system_parameter
from app.ml_predictor import predecir_factor_estacionalidad
import redis

# Redis client for publishing updates (synchronous)
# We use a separate connection or pool here.
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

def publish_market_update(product_id: int):
    """Publica un mensaje en Redis indicando que el producto se actualizó."""
    try:
        redis_client.publish("market_updates", f"product_id:{product_id}")
    except Exception as e:
        logger.error(f"Failed to publish market update to Redis: {e}")


logger = logging.getLogger(__name__)

def _get_product_segment(db: Session, producto_id: int) -> Optional[str]:
    prod = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    return prod.segmento_prd if prod else None

def is_demand_atypical(db: Session, producto_id: int, provincia: str) -> bool:
    now = datetime.utcnow()
    one_hour_ago = now - timedelta(hours=1)
    one_day_ago = now - timedelta(days=1)
    last_hour_demand_q = db.query(func.sum(models.HistorialDemandaZonal.volumen_demanda)).filter(
        models.HistorialDemandaZonal.producto_id == producto_id,
        models.HistorialDemandaZonal.provincia == provincia,
        models.HistorialDemandaZonal.timestamp >= one_hour_ago).scalar()
    last_hour_demand = Decimal(str(last_hour_demand_q)) if last_hour_demand_q else Decimal("0")
    avg_demand_q = db.query(func.avg(models.HistorialDemandaZonal.volumen_demanda)).filter(
        models.HistorialDemandaZonal.producto_id == producto_id,
        models.HistorialDemandaZonal.provincia == provincia,
        models.HistorialDemandaZonal.timestamp >= one_day_ago).scalar()
    if not avg_demand_q or avg_demand_q == 0: return False
    avg_demand_baseline = Decimal(str(avg_demand_q))
    return last_hour_demand > avg_demand_baseline * settings.UMBRAL_DEMANDA_ATIPICA

def get_bid_depth(db: Session, producto_id: int, top_n: int = 5) -> Decimal:
    bids = (db.query(models.Orden.cantidad_original - models.Orden.cantidad_ejecutada).filter(
        models.Orden.producto_id == producto_id, models.Orden.tipo_orden == 'compra',
        models.Orden.estado.in_(['abierta', 'parcialmente_ejecutada']),
        models.Orden.tipo_ejecucion == 'limite'
    ).order_by(models.Orden.precio_limite.desc()).limit(top_n)).all()
    return sum(bid[0] for bid in bids if bid[0] is not None)


def es_horario_de_mercado(tz_str: str = "America/Argentina/Buenos_Aires") -> bool:
    return True # Disabled for testing
    # try:
    #     now = datetime.now(pytz.timezone(tz_str))
    #     return now.weekday() < 5 and now.date() not in holidays.country_holidays('AR') and 9 <= now.hour < 17
    # except Exception: return False

def get_precio_actual(db: Session, producto_id: int) -> Optional[Decimal]:
    tx = (db.query(models.Transaccion).join(models.Orden, models.Transaccion.orden_compra_id == models.Orden.id)
          .filter(models.Orden.producto_id == producto_id).order_by(models.Transaccion.timestamp.desc()).first())
    return tx.precio_ejecucion if tx else None

def get_precio_referencia_dinamico(db: Session, producto_id: int) -> Optional[Decimal]:
    seg = _get_product_segment(db, producto_id)
    if not seg: return None
    prd = db.query(models.PrdSeries).filter(models.PrdSeries.segment == seg).order_by(models.PrdSeries.valid_from.desc()).first()
    return Decimal(str(prd.prd_value)) if prd else None

def get_last_trade_extended(db: Session, producto_id: int):
    # Aliases for joining Order table twice
    OC = aliased(models.Orden)
    OV = aliased(models.Orden)
    
    tx = (db.query(models.Transaccion, OC.usuario_id.label("buyer_id"), OV.usuario_id.label("seller_id"))
          .join(OC, models.Transaccion.orden_compra_id == OC.id)
          .join(OV, models.Transaccion.orden_venta_id == OV.id)
          .filter(OC.producto_id == producto_id)
          .order_by(models.Transaccion.timestamp.desc())
          .first())
          
    if tx:
        transaccion, buyer_id, seller_id = tx
        return {
            "id": transaccion.id,
            "price": float(transaccion.precio_ejecucion),
            "amount": float(transaccion.cantidad_ejecutada),
            "timestamp": transaccion.timestamp.timestamp() * 1000,
            "buyer_id": str(buyer_id), 
            "seller_id": str(seller_id)
        }
    return None

def get_order_book(db: Session, producto_id: int) -> schemas.OrderBookResponse:
    bids = (db.query(models.Orden.precio_limite.label("precio"),
                      func.sum(models.Orden.cantidad_original - models.Orden.cantidad_ejecutada).label("cantidad"))
              .filter(models.Orden.producto_id == producto_id, models.Orden.tipo_orden == 'compra',
                      models.Orden.estado.in_(['abierta', 'parcialmente_ejecutada']),
                      models.Orden.tipo_ejecucion == 'limite')
              .group_by(models.Orden.precio_limite).order_by(models.Orden.precio_limite.desc()).limit(25)).all()
    asks = (db.query(models.Orden.precio_limite.label("precio"),
                      func.sum(models.Orden.cantidad_original - models.Orden.cantidad_ejecutada).label("cantidad"))
              .filter(models.Orden.producto_id == producto_id, models.Orden.tipo_orden == 'venta',
                      models.Orden.estado.in_(['abierta', 'parcialmente_ejecutada']),
                      models.Orden.tipo_ejecucion == 'limite')
              .group_by(models.Orden.precio_limite).order_by(models.Orden.precio_limite.asc()).limit(25)).all()
    return schemas.OrderBookResponse(bids=bids, asks=asks)

def get_user_orders(db: Session, usuario_id: int) -> List[models.Orden]:
    return db.query(models.Orden).filter(models.Orden.usuario_id == usuario_id).order_by(models.Orden.timestamp.desc()).all()

def get_user_transactions(db: Session, usuario_id: int) -> List[schemas.TransaccionHistorial]:
    OC, OV = aliased(models.Orden), aliased(models.Orden)
    txs = (db.query(models.Transaccion.id.label("id_transaccion"), models.Transaccion.timestamp,
                    models.Transaccion.cantidad_ejecutada.label("cantidad"),
                    models.Transaccion.precio_ejecucion.label("precio"), OC.producto_id,
                    case((OC.usuario_id == usuario_id, "compra"), (OV.usuario_id == usuario_id, "venta")).label("tipo_operacion"))
           .join(OC, models.Transaccion.orden_compra_id == OC.id).join(OV, models.Transaccion.orden_venta_id == OV.id)
           .filter((OC.usuario_id == usuario_id) | (OV.usuario_id == usuario_id)).order_by(models.Transaccion.timestamp.desc())).all()
    return [schemas.TransaccionHistorial(id_transaccion=t.id_transaccion, timestamp=t.timestamp, tipo_operacion=t.tipo_operacion,
                                       cantidad=t.cantidad, precio=t.precio, monto_total=t.cantidad * t.precio,
                                       producto_id=t.producto_id) for t in txs]

def _get_or_create_billetera(db: Session, model, **kwargs):
    b = db.query(model).filter_by(**kwargs).first()
    if not b:
        if model == models.BilleteraFiat:
            b = model(**kwargs, saldo=Decimal("0"))
        elif model == models.BilleteraActivo:
            b = model(**kwargs, cantidad=Decimal("0"))
        else:
            # Fallback or error
            b = model(**kwargs)
        db.add(b); db.commit()
    return b



def crear_orden(db: Session, orden: schemas.OrdenCrear, usuario_id: int) -> models.Orden:
    # Store original execution type


    if orden.tipo_ejecucion == 'limite' and not orden.precio_limite: raise ValueError("Límite requiere precio.")

    if orden.tipo_orden == 'compra':
        if orden.tipo_ejecucion == 'mercado': raise ValueError("Compra a mercado no soportada.")
            
        # Continue with logic for limit buy order
        monto = orden.cantidad_original * orden.precio_limite * (Decimal("1") + settings.MAX_COMISION) # Use Decimal("1") for clarity
        b = _get_or_create_billetera(db, models.BilleteraFiat, usuario_id=usuario_id, moneda="ARS")
        if b.saldo < monto: raise ValueError("Fondos insuficientes.")
        b.saldo -= monto
    elif orden.tipo_orden == 'venta':
        b = _get_or_create_billetera(db, models.BilleteraActivo, usuario_id=usuario_id, producto_id=orden.producto_id)
        if b.cantidad < orden.cantidad_original: raise ValueError("Activos insuficientes.")
        b.cantidad -= orden.cantidad_original
    
    # Pass original_tipo_ejecucion to the model constructor
    db_o = models.Orden(
        **orden.dict(),
        usuario_id=usuario_id,
        estado='abierta'
    )
    db.add(db_o); db.commit(); db.refresh(db_o)
    
    # Notify update
    publish_market_update(orden.producto_id)
    
    # Ejecutar calce síncrono (para dev/demo sin workers)
    try:
        ejecutar_calce_por_producto(db, orden.producto_id)
    except Exception as e:
        logger.error(f"Error en calce síncrono: {e}")

    return db_o

def cancelar_orden(db: Session, orden_id: int, usuario_id: int) -> models.Orden:
    o = db.query(models.Orden).filter(models.Orden.id == orden_id).first()
    if not o: raise ValueError("Orden no existe.")
    if o.usuario_id != usuario_id: raise ValueError("Sin permiso.")
    if o.estado not in ['abierta', 'parcialmente_ejecutada']: raise ValueError(f"Estado '{o.estado}' no cancelable.")
    cant = o.cantidad_original - o.cantidad_ejecutada
    if o.tipo_orden == 'compra':
        monto = cant * o.precio_limite * (1 + settings.MAX_COMISION)
        _get_or_create_billetera(db, models.BilleteraFiat, usuario_id=usuario_id, moneda="ARS").saldo += monto
    elif o.tipo_orden == 'venta':
        _get_or_create_billetera(db, models.BilleteraActivo, usuario_id=usuario_id, producto_id=o.producto_id).cantidad += cant
    o.estado = 'cancelada'; db.commit(); db.refresh(o)
    
    # Notify update
    publish_market_update(o.producto_id)
    
    return o

def ejecutar_calce_por_producto(db: Session, producto_id: int) -> bool:
    try:
        with db.begin_nested():
            bid = db.query(models.Orden).filter(models.Orden.producto_id == producto_id, models.Orden.tipo_orden == 'compra',
                                               models.Orden.estado.in_(['abierta', 'parcialmente_ejecutada'])
                                               ).order_by(models.Orden.precio_limite.desc(), models.Orden.timestamp.asc()
                                                          ).with_for_update(skip_locked=True).first()
            ask = db.query(models.Orden).filter(models.Orden.producto_id == producto_id, models.Orden.tipo_orden == 'venta',
                                               models.Orden.estado.in_(['abierta', 'parcialmente_ejecutada'])
                                               ).order_by(models.Orden.precio_limite.asc(), models.Orden.timestamp.asc()
                                                          ).with_for_update(skip_locked=True).first()
            if not bid or not ask or bid.precio_limite < ask.precio_limite: return False

            precio_ej, cant = ask.precio_limite, min(bid.cantidad_original - bid.cantidad_ejecutada, ask.cantidad_original - ask.cantidad_ejecutada)
            monto = precio_ej * cant
            agresividad = Decimal(get_system_parameter(db, "agresividad_global", "1.0"))
            
            comprador = db.query(models.Usuario).filter_by(id=bid.usuario_id).one()
            factor_est = predecir_factor_estacionalidad(db, producto_id, comprador.provincia, comprador.pais)
            k_adj = settings.K_FACTOR * agresividad * factor_est
            
            prd = get_precio_referencia_dinamico(db, producto_id)
            desviacion = (precio_ej - prd) / prd if prd and prd > 0 else Decimal("0")
            
            ajuste_v = -desviacion if desviacion < 0 else (desviacion if is_demand_atypical(db, producto_id, comprador.provincia) else 0)
            ratio_v = max(settings.MIN_COMISION, min(settings.MAX_COMISION, settings.COMISION_VENDEDOR + (ajuste_v * k_adj)))
            comision_v = ratio_v * monto
            
            ajuste_prd_c = desviacion
            ahorro = bid.precio_limite - precio_ej
            ajuste_ahorro = (ahorro/precio_ej) * settings.TASA_PARTICIPACION_AHORRO if ahorro > 0 and precio_ej > 0 else 0
            ratio_c = max(settings.MIN_COMISION, min(settings.MAX_COMISION, settings.COMISION_COMPRADOR_BASE + ((ajuste_prd_c + ajuste_ahorro) * k_adj)))
            comision_c = ratio_c * monto
            
            comision_p = comision_c + comision_v
            
            bid.cantidad_ejecutada += cant; ask.cantidad_ejecutada += cant
            bid.estado = 'ejecutada' if bid.cantidad_ejecutada >= bid.cantidad_original else 'parcialmente_ejecutada'
            ask.estado = 'ejecutada' if ask.cantidad_ejecutada >= ask.cantidad_original else 'parcialmente_ejecutada'
            
            reembolso = (cant * bid.precio_limite * (1 + settings.MAX_COMISION)) - (monto + comision_c)
            _get_or_create_billetera(db, models.BilleteraFiat, usuario_id=bid.usuario_id).saldo += reembolso
            _get_or_create_billetera(db, models.BilleteraFiat, usuario_id=ask.usuario_id).saldo += monto - comision_v
            _get_or_create_billetera(db, models.BilleteraActivo, usuario_id=bid.usuario_id, producto_id=producto_id).cantidad += cant
            
            tx = models.Transaccion(idempotency_key=f"calce-{bid.id}-{ask.id}-{uuid.uuid4().hex}", orden_compra_id=bid.id,
                                    orden_venta_id=ask.id, cantidad_ejecutada=cant, precio_ejecucion=precio_ej,
                                    comision_plataforma=comision_p)
            db.add(tx); db.flush()
            db.add(models.LedgerComision(transaccion_id=tx.id, monto=comision_p))
            
            # Notify update
            publish_market_update(producto_id)
            
            return True
    except Exception as e:
        logger.error(f"Error en motor de calce: {e}"); db.rollback(); return False

@celery_app.task(name="marketplace.supervisor_calce_mercados")
def supervisor_calce_mercados():
    db=SessionLocal()
    try:
        [ejecutar_calce_por_producto_task.delay(p.id) for p in db.query(models.Producto).filter(models.Producto.activo==True).all()]
    finally: db.close()

@celery_app.task(bind=True, name="marketplace.ejecutar_calce_por_producto", autoretry_for=(OperationalError,), retry_kwargs={'max_retries': 3}, retry_backoff=True)
def ejecutar_calce_por_producto_task(self, producto_id: int):
    db=SessionLocal()
    try:
        while ejecutar_calce_por_producto(db, producto_id): pass
    except OperationalError as e: raise self.retry(exc=e)
    finally: db.close()
