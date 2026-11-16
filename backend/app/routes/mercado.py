from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import pytz

import models
import schemas
import marketplace_service
import market_data_service
from database import SessionLocal
from security import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/mercado/precio-actual/{producto_id}", response_model=schemas.PrecioReferencia, tags=["Mercado"])
def endpoint_get_precio_actual(producto_id: int, db: Session = Depends(get_db)):
    precio = marketplace_service.get_precio_actual(db, producto_id)
    if precio is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No hay transacciones para este producto.")
    
    return schemas.PrecioReferencia(
        producto_id=producto_id,
        precio=precio,
        timestamp=datetime.now(pytz.utc)
    )

@router.get("/mercado/precio-referencia-dinamico/{producto_id}", response_model=schemas.PrecioReferencia, tags=["Mercado"])
def endpoint_get_precio_referencia_dinamico(producto_id: int, db: Session = Depends(get_db)):
    prd = marketplace_service.get_precio_referencia_dinamico(db, producto_id)
    if prd is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Precio de Referencia Dinámico no disponible para este producto.")
    
    return schemas.PrecioReferencia(
        producto_id=producto_id,
        precio=prd,
        timestamp=datetime.now(pytz.utc)
    )

@router.post("/mercado/ordenes/", response_model=schemas.OrdenLeer, tags=["Mercado"])
def endpoint_crear_orden(
    orden: schemas.OrdenCrear,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    if not marketplace_service.es_horario_de_mercado():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El mercado se encuentra cerrado."
        )
    
    try:
        db_orden = marketplace_service.crear_orden(db=db, orden=orden, usuario_id=current_user.id)
        return db_orden
    except ValueError as e:
        # Convierte ValueError (fondos insuficientes, etc.) a HTTPException con CORS
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/mercado/ordenes/{orden_id}", response_model=schemas.OrdenLeer, tags=["Mercado"])
def endpoint_cancelar_orden(
    orden_id: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    if not marketplace_service.es_horario_de_mercado():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El mercado se encuentra cerrado."
        )

    db_orden = marketplace_service.cancelar_orden(db=db, orden_id=orden_id, usuario_id=current_user.id)
    return db_orden


@router.get("/mercado/productos/{producto_id}/orderbook", response_model=schemas.OrderBookResponse, tags=["Mercado"])
def endpoint_get_order_book(
    producto_id: int,
    db: Session = Depends(get_db)
):
    order_book = marketplace_service.get_order_book(db=db, producto_id=producto_id)
    return order_book

@router.get("/mercado/historial/ordenes", response_model=List[schemas.OrdenLeer], tags=["Mercado"])
def endpoint_get_user_orders(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    orders = marketplace_service.get_user_orders(db=db, usuario_id=current_user.id)
    return orders

@router.get("/mercado/historial/transacciones", response_model=List[schemas.TransaccionHistorial], tags=["Mercado"])
def endpoint_get_user_transactions(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    transactions = marketplace_service.get_user_transactions(db=db, usuario_id=current_user.id)
    return transactions

@router.get("/api/sugar-prices", tags=["Mercado"])
def get_sugar_prices(db: Session = Depends(get_db)):
    # Obtener datos reales de la base de datos
    def get_latest_price(tipo: str):
        return db.query(models.PrecioHistorico).filter(
            models.PrecioHistorico.tipo_precio == tipo
        ).order_by(models.PrecioHistorico.fecha.desc()).first()

    def get_history(tipo: str, limit: int = 30):
        # Obtener los últimos 'limit' registros disponibles, independientemente de la fecha
        # (Útil si los datos reales tienen un lag respecto a la fecha simulada)
        records = db.query(models.PrecioHistorico).filter(
            models.PrecioHistorico.tipo_precio == tipo
        ).order_by(models.PrecioHistorico.fecha.desc()).limit(limit).all()
        
        # Revertir para orden cronológico ascendente (para el gráfico)
        return records[::-1]

    # Contrato 5 (Londres)
    c5_latest = get_latest_price("contrato_5")
    c5_price = float(c5_latest.precio) if c5_latest else 0.0
    # Calcular cambio (vs dia anterior)
    c5_prev = db.query(models.PrecioHistorico).filter(
        models.PrecioHistorico.tipo_precio == "contrato_5",
        models.PrecioHistorico.fecha < (c5_latest.fecha if c5_latest else datetime.now())
    ).order_by(models.PrecioHistorico.fecha.desc()).first()
    c5_change = round(((c5_price - float(c5_prev.precio)) / float(c5_prev.precio) * 100), 2) if c5_prev and c5_prev.precio else 0.0

    # Contrato 11 (USA)
    c11_latest = get_latest_price("contrato_11")
    c11_price = float(c11_latest.precio) if c11_latest else 0.0
    c11_prev = db.query(models.PrecioHistorico).filter(
        models.PrecioHistorico.tipo_precio == "contrato_11",
        models.PrecioHistorico.fecha < (c11_latest.fecha if c11_latest else datetime.now())
    ).order_by(models.PrecioHistorico.fecha.desc()).first()
    c11_change = round(((c11_price - float(c11_prev.precio)) / float(c11_prev.precio) * 100), 2) if c11_prev and c11_prev.precio else 0.0

    # Historiales para gráficos
    history_c5 = get_history("contrato_5")
    history_c11 = get_history("contrato_11") # Si se quisiera mostrar este también

    # Mercado Interno (Simulado o derivado por ahora, ya que no tenemos fuente directa en script aun)
    # Podríamos derivarlo del internacional: Precio Londres (USD/ton) * Dolar / 1000 * 50 (bolsa 50kg) ? 
    # Por ahora mantenemos la simulación "inteligente" basada en el precio real de Londres si existe
    import random
    if c5_price > 0:
        # Estimación burda: (Londres USD/ton * 1.2 (gastos)) * 1000 (dolar blue aprox) / 1000kg = precio kg
        # Ajustar a valores de mercado argentino actuales (~850 ARS/kg)
        base_internal = (c5_price * 1.4) # Factor de ajuste arbitrario para acercarse a la realidad local
    else:
        base_internal = 850

    mercado_interno_price = round(base_internal + random.uniform(-5, 5), 2)

    return {
        "actualizado": datetime.now().isoformat(),
        "mercadoInterno": {
            "precio": mercado_interno_price,
            "cambio": round(random.uniform(-2, 2), 2),
            "unidad": "ARS/kg"
        },
        "contrato5": {
            "precio": c5_price,
            "cambio": c5_change,
            "unidad": "USD/ton"
        },
        "contrato11": {
            "precio": c11_price,
            "cambio": c11_change,
            "unidad": "cent/lb"
        },
        "historicos": [
            {"fecha": h.fecha.isoformat(), "precio": float(h.precio)} for h in history_c5
        ],
        "historicosMercadoInterno": [
             # Mantenemos simulado por ahora o podríamos guardar historial interno también
             {"fecha": (datetime.now() - timedelta(days=i)).isoformat(), "precio": 800 + (i * 2) + random.uniform(-10, 10)}
            for i in range(30, 0, -1)
        ],
        "futuros": [
            # Estos datos no vienen del script actual (que trae histórico continuo), 
            # así que los dejamos simulados o estáticos por el momento.
            {"mes": "Mar 24", "precio": 24.10, "cambio": 0.5},
            {"mes": "May 24", "precio": 23.80, "cambio": -0.2},
            {"mes": "Jul 24", "precio": 23.50, "cambio": -0.1},
            {"mes": "Oct 24", "precio": 23.20, "cambio": 0.0}
        ]
    }

@router.get("/api/market/prices/{product_id}", tags=["Market"])
def get_market_prices(product_id: int, db: Session = Depends(get_db)):
    current_price = marketplace_service.get_precio_actual(db, product_id)
    prd = marketplace_service.get_precio_referencia_dinamico(db, product_id)
    
    return {
        "current_price": float(current_price) if current_price else 0.0,
        "prd": float(prd) if prd else 0.0
    }

@router.get("/api/market/global/sugar", tags=["Market"])
def get_global_sugar_price():
    data = market_data_service.get_global_sugar_price()
    if not data:
        raise HTTPException(status_code=503, detail="Global market data unavailable")
    return data

@router.get("/api/market/local/history", tags=["Market"])
def get_local_market_history(db: Session = Depends(get_db)):
    from datetime import timedelta
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    txs = db.query(models.Transaccion).join(models.Orden, models.Transaccion.orden_compra_id == models.Orden.id)\
        .filter(models.Orden.producto_id == 2, models.Transaccion.timestamp >= thirty_days_ago)\
        .order_by(models.Transaccion.timestamp.asc()).all()
        
    history = []
    for tx in txs:
        history.append({
            "date": tx.timestamp.strftime("%Y-%m-%d"),
            "price": float(tx.precio_ejecucion),
            "volume": float(tx.cantidad_ejecutada)
        })
        
    if not history:
        import random
        base = 23700
        for i in range(30):
            date = (thirty_days_ago + timedelta(days=i)).strftime("%Y-%m-%d")
            price = base + (i * 50) + random.uniform(-200, 200)
            history.append({
                "date": date,
                "price": round(price, 2),
                "volume": round(random.uniform(10, 100), 2)
            })
            
    return history

@router.get("/mercado/productos/{producto_id}/historial", tags=["Mercado"])
def get_product_history(producto_id: int, limit: int = 100, db: Session = Depends(get_db)):
    # Obtener transacciones recientes para el gráfico
    txs = db.query(models.Transaccion).join(models.Orden, models.Transaccion.orden_compra_id == models.Orden.id)\
        .filter(models.Orden.producto_id == producto_id)\
        .order_by(models.Transaccion.timestamp.desc())\
        .limit(limit).all()
    
    # Formato para el frontend
    data = []
    for tx in txs:
        data.append({
            "timestamp": tx.timestamp.isoformat(),
            "precio": float(tx.precio_ejecucion), # Precio en TN
            "cantidad": float(tx.cantidad_ejecutada)
        })
    
    # Revertir para que esté en orden cronológico (antiguo -> nuevo)
    return data[::-1]
