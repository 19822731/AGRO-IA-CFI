
from pydantic import BaseModel
from typing import Optional, List
from enum import Enum
import datetime
from decimal import Decimal

# --- Enums para Validación ---
class TipoOrden(str, Enum):
    compra = "compra"
    venta = "venta"

class TipoEjecucion(str, Enum):
    mercado = "mercado"
    limite = "limite"

class EstadoOrden(str, Enum):
    abierta = "abierta"
    parcialmente_ejecutada = "parcialmente_ejecutada"
    ejecutada = "ejecutada"
    cancelada = "cancelada"
    pendiente_apertura = "pendiente_apertura"

# --- Esquemas de Órdenes ---
class OrdenBase(BaseModel):
    producto_id: int
    tipo_orden: TipoOrden
    tipo_ejecucion: TipoEjecucion
    cantidad_original: Decimal
    precio_limite: Optional[Decimal] = None

class OrdenCrear(OrdenBase):
    pass

class OrdenLeer(OrdenBase):
    id: int
    usuario_id: int
    estado: EstadoOrden
    cantidad_ejecutada: Decimal
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

# --- Esquemas de Usuario y Token ---
class UsuarioBase(BaseModel):
    email: str

class UsuarioCrear(UsuarioBase):
    password: str

class UsuarioLeer(UsuarioBase):
    id: int
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Esquemas de Predicciones ---
class ProduccionMensualBase(BaseModel):
    fecha: datetime.datetime
    cantidad_tm: Decimal
    tipo_azucar: Optional[str] = None

class ProduccionMensualCrear(ProduccionMensualBase):
    pass

class ProduccionMensualLeer(ProduccionMensualBase):
    id: int

    class Config:
        from_attributes = True

class ConsumoMensualBase(BaseModel):
    fecha: datetime.datetime
    cantidad_tm: Decimal

class ConsumoMensualCrear(ConsumoMensualBase):
    pass

class ConsumoMensualLeer(ConsumoMensualBase):
    id: int

    class Config:
        from_attributes = True

class PrecioHistoricoBase(BaseModel):
    fecha: datetime.datetime
    precio: Decimal
    tipo_precio: str

class PrecioHistoricoCrear(PrecioHistoricoBase):
    pass

class PrecioHistoricoLeer(PrecioHistoricoBase):
    id: int

    class Config:
        from_attributes = True

# --- Esquemas de Precios de Referencia ---
class PrecioReferencia(BaseModel):
    producto_id: int
    precio: Decimal
    moneda: str = "ARS"
    timestamp: datetime.datetime

# --- Esquemas de Billeteras ---
class BilleteraFiatBase(BaseModel):
    saldo: Decimal
    moneda: str

class BilleteraActivoBase(BaseModel):
    cantidad: Decimal
    producto_id: int

# --- Esquemas de Libro de Órdenes ---
class OrderBookEntry(BaseModel):
    precio: Decimal
    cantidad: Decimal

    class Config:
        from_attributes = True

class OrderBookResponse(BaseModel):

    bids: List[OrderBookEntry]

    asks: List[OrderBookEntry]



    class Config:

        from_attributes = True



# --- Esquemas de Historial de Usuario ---

class TransaccionLeer(BaseModel):

    id: int

    orden_compra_id: int

    orden_venta_id: int

    cantidad_ejecutada: Decimal

    precio_ejecucion: Decimal

    comision_plataforma: Decimal

    timestamp: datetime.datetime



    class Config:

        from_attributes = True



class TransaccionHistorial(BaseModel):

    id_transaccion: int

    timestamp: datetime.datetime

    tipo_operacion: TipoOrden

    cantidad: Decimal

    precio: Decimal

    monto_total: Decimal

    producto_id: int



    class Config:

        from_attributes = True
