# app/routes/admin_reports.py
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session, aliased
from sqlalchemy import func, cast, String
from datetime import datetime, date, timedelta
from decimal import Decimal
from typing import List, Optional

# Asegurarse de que el path permita importar desde la raíz del proyecto
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from database import SessionLocal
import models
from security import require_role
from app.routes.schemas_reports import (
    ReporteTransaccion,
    ReporteComision,
    ReporteEstadisticasMercado,
    ReportePrdHistory
)

router = APIRouter(prefix="/admin/reports", tags=["Admin Reports"], dependencies=[Depends(require_role("admin"))])

def _get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/transactions", response_model=List[ReporteTransaccion])
def get_transaction_report(
    producto_id: Optional[int] = Query(None, description="Filtrar por ID de producto"),
    comprador_id: Optional[int] = Query(None, description="Filtrar por ID de usuario comprador"),
    vendedor_id: Optional[int] = Query(None, description="Filtrar por ID de usuario vendedor"),
    fecha_inicio: Optional[date] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    fecha_fin: Optional[date] = Query(None, description="Fecha de fin (YYYY-MM-DD)"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(_get_session)
):
    OC = aliased(models.Orden, name='oc')
    OV = aliased(models.Orden, name='ov')
    
    query = db.query(
        models.Transaccion.id.label("id_transaccion"),
        models.Transaccion.timestamp,
        OC.producto_id,
        cast(func.coalesce(OC.tipo_orden, OV.tipo_orden), String).label("tipo_operacion"), # Determine type from buyer or seller order
        models.Transaccion.cantidad_ejecutada.label("cantidad"),
        models.Transaccion.precio_ejecucion.label("precio"),
        (models.Transaccion.cantidad_ejecutada * models.Transaccion.precio_ejecucion).label("monto_total"),
        models.Transaccion.comision_plataforma,
        OC.usuario_id.label("comprador_id"),
        OV.usuario_id.label("vendedor_id")
    ).join(OC, models.Transaccion.orden_compra_id == OC.id)\
    .join(OV, models.Transaccion.orden_venta_id == OV.id)

    if producto_id:
        query = query.filter(OC.producto_id == producto_id)
    if comprador_id:
        query = query.filter(OC.usuario_id == comprador_id)
    if vendedor_id:
        query = query.filter(OV.usuario_id == vendedor_id)
    if fecha_inicio:
        query = query.filter(models.Transaccion.timestamp >= fecha_inicio)
    if fecha_fin:
        query = query.filter(models.Transaccion.timestamp <= (fecha_fin + timedelta(days=1))) # Include end day

    query = query.order_by(models.Transaccion.timestamp.desc())
    transactions = query.offset(offset).limit(limit).all()
    
    return [ReporteTransaccion(**tx._asdict()) for tx in transactions]

@router.get("/commissions", response_model=List[ReporteComision])
def get_commission_report(
    producto_id: Optional[int] = Query(None, description="Filtrar por ID de producto"),
    fecha_inicio: Optional[date] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    fecha_fin: Optional[date] = Query(None, description="Fecha de fin (YYYY-MM-DD)"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(_get_session)
):
    query = db.query(
        models.LedgerComision.id,
        models.LedgerComision.transaccion_id,
        models.LedgerComision.monto,
        models.LedgerComision.moneda,
        models.LedgerComision.created_at,
        models.Orden.producto_id.label("producto_id") # Get product_id directly from the order
    ).join(models.Transaccion, models.LedgerComision.transaccion_id == models.Transaccion.id)\
    .join(models.Orden, models.Transaccion.orden_compra_id == models.Orden.id) # Use buy order to get product_id, as it's part of the transaction

    if producto_id:
        query = query.filter(models.Orden.producto_id == producto_id)
    if fecha_inicio:
        query = query.filter(models.LedgerComision.created_at >= fecha_inicio)
    if fecha_fin:
        query = query.filter(models.LedgerComision.created_at <= (fecha_fin + timedelta(days=1)))

    query = query.order_by(models.LedgerComision.created_at.desc())
    commissions = query.offset(offset).limit(limit).all()
    
    return [ReporteComision(**comm._asdict()) for comm in commissions]

@router.get("/market_stats", response_model=List[ReporteEstadisticasMercado])
def get_market_stats_report(
    producto_id: Optional[int] = Query(None, description="Filtrar por ID de producto"),
    fecha_inicio: Optional[date] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    fecha_fin: Optional[date] = Query(None, description="Fecha de fin (YYYY-MM-DD)"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(_get_session)
):
    query = db.query(models.EstadisticasMercadoDiarias).order_by(models.EstadisticasMercadoDiarias.fecha.desc())
    
    if producto_id:
        query = query.filter(models.EstadisticasMercadoDiarias.producto_id == producto_id)
    if fecha_inicio:
        query = query.filter(models.EstadisticasMercadoDiarias.fecha >= fecha_inicio)
    if fecha_fin:
        query = query.filter(models.EstadisticasMercadoDiarias.fecha <= fecha_fin)

    stats = query.offset(offset).limit(limit).all()
    return [ReporteEstadisticasMercado.from_orm(stat) for stat in stats]

@router.get("/prd_history", response_model=List[ReportePrdHistory])
def get_prd_history_report(
    segment: Optional[str] = Query(None, description="Filtrar por segmento PRD"),
    fecha_inicio: Optional[date] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    fecha_fin: Optional[date] = Query(None, description="Fecha de fin (YYYY-MM-DD)"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(_get_session)
):
    query = db.query(
        models.PrdSeries.id,
        models.PrdSeries.segment,
        models.PrdSeries.valid_from,
        models.PrdSeries.prd_value,
        models.PrdSeries.exportable_balance,
        models.PrdSeries.stock_open,
        models.PrdSeries.domestic_demand,
        models.MarketCommissionPolicy.name.label("policy_name")
    ).outerjoin(models.MarketCommissionPolicy, models.PrdSeries.policy_id == models.MarketCommissionPolicy.id)
    
    if segment:
        query = query.filter(models.PrdSeries.segment == segment)
    if fecha_inicio:
        query = query.filter(models.PrdSeries.valid_from >= fecha_inicio)
    if fecha_fin:
        query = query.filter(models.PrdSeries.valid_from <= (fecha_fin + timedelta(days=1)))

    query = query.order_by(models.PrdSeries.valid_from.desc())
    prd_history = query.offset(offset).limit(limit).all()
    
    return [ReportePrdHistory(**prd._asdict()) for prd in prd_history]
