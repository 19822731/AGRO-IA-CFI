from datetime import datetime, date
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel

class ReporteTransaccion(BaseModel):
    id_transaccion: int
    timestamp: datetime
    producto_id: int
    tipo_operacion: str
    cantidad: Decimal
    precio: Decimal
    monto_total: Decimal
    comision_plataforma: Decimal
    comprador_id: int
    vendedor_id: int

    class Config:
        from_attributes = True

class ReporteComision(BaseModel):
    id: int
    transaccion_id: int
    monto: Decimal
    moneda: str
    created_at: datetime
    producto_id: Optional[int] = None # Se derivará de la transacción

    class Config:
        from_attributes = True

class ReporteEstadisticasMercado(BaseModel):
    fecha: date
    producto_id: int
    vwap: Decimal
    volatilidad: Decimal
    volumen_total: Decimal

    class Config:
        from_attributes = True

class ReportePrdHistory(BaseModel):
    id: int
    segment: Optional[str]
    valid_from: datetime
    prd_value: float
    exportable_balance: float
    stock_open: float
    domestic_demand: float
    policy_name: Optional[str] = None # Se derivará de MarketCommissionPolicy

    class Config:
        from_attributes = True
