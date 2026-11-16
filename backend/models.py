import enum
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, func, Index, UniqueConstraint, Boolean
import sqlalchemy as sa
from sqlalchemy.types import DECIMAL
from sqlalchemy.orm import relationship
import datetime

from database import Base

# --- Enums para controlar los estados y tipos ---

class TipoOrdenEnum(enum.Enum):
    compra = "compra"
    venta = "venta"

class TipoEjecucionEnum(enum.Enum):
    mercado = "mercado"
    limite = "limite"

class EstadoOrdenEnum(enum.Enum):
    abierta = "abierta"
    parcialmente_ejecutada = "parcialmente_ejecutada"
    ejecutada = "ejecutada"
    cancelada = "cancelada"
    pendiente_apertura = "pendiente_apertura"

# --- Modelos de Base de Datos ---

class Usuario(Base):
    __tablename__ = 'usuarios'
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    pais = Column(String, index=True, nullable=False, server_default="default")
    provincia = Column(String, index=True, nullable=False, server_default="default")
    roles = Column(String, nullable=False, server_default="viewer")  # e.g., "viewer,operator"

    billeteras_fiat = relationship("BilleteraFiat", back_populates="propietario")
    billeteras_activos = relationship("BilleteraActivo", back_populates="propietario")

class BilleteraFiat(Base):
    __tablename__ = 'billeteras_fiat'
    id = Column(Integer, primary_key=True)
    saldo = Column(DECIMAL(18, 4), nullable=False, default=0.0)
    moneda = Column(String, default="ARS")
    cvu = Column(String, unique=True, nullable=True, index=True)
    usuario_id = Column(Integer, ForeignKey('usuarios.id'))

    propietario = relationship("Usuario", back_populates="billeteras_fiat")

class BilleteraActivo(Base):
    __tablename__ = 'billeteras_activos'
    id = Column(Integer, primary_key=True)
    cantidad = Column(DECIMAL(18, 4), nullable=False, default=0.0)
    producto_id = Column(Integer, ForeignKey('productos.id'), nullable=False)
    usuario_id = Column(Integer, ForeignKey('usuarios.id'))

    propietario = relationship("Usuario", back_populates="billeteras_activos")
    producto = relationship("Producto")
    __table_args__ = (UniqueConstraint('usuario_id', 'producto_id', name='uq_billetera_activo'),)

class Deposito(Base):
    __tablename__ = 'depositos'
    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey('usuarios.id'), nullable=False)
    monto = Column(DECIMAL(18, 4), nullable=False)
    moneda = Column(String, nullable=False, default="ARS")
    comprobante_path = Column(String, nullable=True)
    estado = Column(String, default="pendiente") # pendiente, aprobado, rechazado
    fecha_solicitud = Column(DateTime, default=datetime.datetime.utcnow)
    fecha_aprobacion = Column(DateTime, nullable=True)

    usuario = relationship("Usuario")


class Producto(Base):
    __tablename__ = 'productos'
    id = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False, unique=True)
    commodity = Column(String, nullable=False, index=True)
    especificacion = Column(String, nullable=True)
    mercado = Column(String, nullable=False, index=True)
    segmento_prd = Column(String, nullable=False, index=True)
    activo = Column(Boolean, nullable=False, server_default=sa.text('true'))

    ordenes = relationship("Orden", back_populates="producto")


class Orden(Base):
    __tablename__ = 'ordenes'
    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey('usuarios.id'), nullable=False)
    producto_id = Column(Integer, ForeignKey('productos.id'), nullable=False)
    tipo_orden = Column(Enum(TipoOrdenEnum), nullable=False)
    tipo_ejecucion = Column(Enum(TipoEjecucionEnum), nullable=False)
    precio_limite = Column(DECIMAL(18, 4), nullable=True)
    cantidad_original = Column(DECIMAL(18, 4), nullable=False)
    cantidad_ejecutada = Column(DECIMAL(18, 4), default=0.0)
    estado = Column(Enum(EstadoOrdenEnum), default=EstadoOrdenEnum.abierta)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    producto = relationship("Producto", back_populates="ordenes")
    __table_args__ = (
        Index(
            'idx_ask_open_partial',
            producto_id, precio_limite, timestamp,
            postgresql_where=((estado.in_(['abierta', 'parcialmente_ejecutada'])) & (tipo_orden == 'venta'))
        ),
        Index(
            'idx_bid_open_partial',
            producto_id, precio_limite.desc(), timestamp,
            postgresql_where=((estado.in_(['abierta', 'parcialmente_ejecutada'])) & (tipo_orden == 'compra'))
        ),
    )


class Transaccion(Base):
    __tablename__ = 'transacciones'
    id = Column(Integer, primary_key=True)
    idempotency_key = Column(String, unique=True, nullable=False, index=True)
    orden_compra_id = Column(Integer, ForeignKey('ordenes.id'))
    orden_venta_id = Column(Integer, ForeignKey('ordenes.id'))
    cantidad_ejecutada = Column(DECIMAL(18, 4), nullable=False)
    precio_ejecucion = Column(DECIMAL(18, 4), nullable=False)
    comision_plataforma = Column(DECIMAL(18, 4), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class ProduccionMensual(Base):
    __tablename__ = 'produccion_mensual'
    id = Column(Integer, primary_key=True)
    fecha = Column(DateTime, nullable=False)
    cantidad_tm = Column(DECIMAL(18, 4), nullable=False)
    tipo_azucar = Column(String, nullable=True)

class ConsumoMensual(Base):
    __tablename__ = 'consumo_mensual'
    id = Column(Integer, primary_key=True)
    fecha = Column(DateTime, nullable=False)
    cantidad_tm = Column(DECIMAL(18, 4), nullable=False)

class PrecioHistorico(Base):
    __tablename__ = 'precios_historicos'
    id = Column(Integer, primary_key=True)
    fecha = Column(DateTime, nullable=False)
    precio = Column(DECIMAL(18, 4), nullable=False)
    tipo_precio = Column(String, nullable=False)

class LedgerComision(Base):
    __tablename__ = "ledger_comisiones"
    id = Column(Integer, primary_key=True)
    transaccion_id = Column(Integer, ForeignKey("transacciones.id", ondelete="CASCADE"), unique=True, nullable=False)
    monto = Column(DECIMAL(18, 4), nullable=False)
    moneda = Column(String, nullable=False, default="ARS")
    created_at = Column(DateTime(timezone=False), nullable=False, server_default=func.now())

    __table_args__ = (Index("ix_ledger_comisiones_created_at", "created_at"),)

# --- P2.2 ORM additions: DataIngesta & DataProvenance ---
from sqlalchemy import (Column, BigInteger, Text, Date, DateTime, ForeignKey, CHAR, func, UniqueConstraint, Integer)
from sqlalchemy.orm import relationship

class DataIngesta(Base):
    __tablename__ = "data_ingesta"
    id = Column(
        BigInteger().with_variant(Integer, "sqlite"),
        primary_key=True
    )
    fuente = Column(Text, nullable=False)
    hash_sha256 = Column(CHAR(64), nullable=False, index=True)
    version = Column(Text, nullable=False)
    rango_desde = Column(Date, nullable=True)
    rango_hasta = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("fuente", "hash_sha256", name="uq_data_ingesta_fuente_hash"),
        {"sqlite_autoincrement": True},  # garantiza comportamiento AUTOINCREMENT en SQLite
    )

    provenances = relationship(
        "DataProvenance", back_populates="ingesta", cascade="all, delete-orphan"
    )

class DataProvenance(Base):
    __tablename__ = "data_provenance"
    id = Column(
        BigInteger().with_variant(Integer, "sqlite"),
        primary_key=True
    )
    tabla_destino = Column(Text, nullable=False, index=True)
    data_ingesta_id = Column(
        BigInteger().with_variant(Integer, "sqlite"),
        ForeignKey("data_ingesta.id", ondelete="CASCADE"),
        nullable=False
    )
    transform_hash = Column(CHAR(64), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    ingesta = relationship("DataIngesta", back_populates="provenances")


# --- P2.3 ORM additions: MlModel & MlMetric ---
from sqlalchemy import Boolean, Float
import sqlalchemy as sa

# Usa JSONB en Postgres y JSON estándar en otros motores
try:
    from sqlalchemy.dialects.postgresql import JSONB
    JSON_VARIANT = sa.JSON().with_variant(JSONB, "postgresql")
except ImportError:
    JSON_VARIANT = sa.JSON()

class MlModel(Base):
    __tablename__ = "ml_models"
    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True)
    name = Column(Text, nullable=False)
    version = Column(Text, nullable=False)
    dataset_hash = Column(sa.CHAR(64), nullable=True)
    params = Column(JSON_VARIANT, nullable=True)
    active = Column(Boolean, nullable=False, server_default=sa.text("false"))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("name", "version", name="uq_ml_models_name_version"),
        Index("idx_ml_models_name", "name"),
        Index("idx_ml_models_active", "active"),
    )

    metrics = relationship("MlMetric", back_populates="model", cascade="all, delete-orphan")

class MlMetric(Base):
    __tablename__ = "ml_metrics"
    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True)
    model_id = Column(
        BigInteger().with_variant(Integer, "sqlite"),
        ForeignKey("ml_models.id", ondelete="CASCADE"),
        nullable=False
    )
    split = Column(Text, nullable=False)     # train|val|test|prod
    metric = Column(Text, nullable=False)    # MAPE|MSE|R2|etc.
    value = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    model = relationship("MlModel", back_populates="metrics")

    __table_args__ = (
        Index("idx_ml_metrics_model_id", "model_id"),
        Index("idx_ml_metrics_metric_split_time", "metric", "split", "timestamp"),
    )


# --- P2.3 prerequisite: PredictionProd (tabla de predicciones en producción) ---
class PredictionProd(Base):
    __tablename__ = "predictions_prod"

    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True)
    model_id = Column(
        BigInteger().with_variant(Integer, "sqlite"),
        ForeignKey("ml_models.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    y_true = Column(Float, nullable=False)
    y_pred = Column(Float, nullable=False)
    ts = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # Opcional, para trazar con logs/Loki
    correlation_id = Column(sa.CHAR(32), nullable=True)
    # Dimensiones opcionales para cortes/segmentos
    segment = Column(Text, nullable=True)
    horizon = Column(Integer, nullable=True)

    # Índices útiles para queries por tiempo y por modelo
    __table_args__ = (
        Index("idx_predictions_prod_ts", "ts"),
        Index("idx_predictions_prod_model_ts", "model_id", "ts"),
        {"sqlite_autoincrement": True},
    )

    # Relación a MlModel (si existe)
    model = relationship("MlModel", backref="predictions", lazy="joined", foreign_keys=[model_id])


# --- P2.4 ORM additions: PRD & Policy ---

# Reutilizamos JSON_VARIANT si ya lo definiste; si no:
try:
    from sqlalchemy.dialects.postgresql import JSONB
    JSON_VARIANT = sa.JSON().with_variant(JSONB, "postgresql")
except ImportError:
    JSON_VARIANT = sa.JSON()

class MarketCommissionPolicy(Base):
    __tablename__ = "market_commission_policy"
    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True)
    name = Column(Text, nullable=False)  # p.ej. "default"
    valid_from = Column(DateTime(timezone=True), nullable=False)
    valid_to   = Column(DateTime(timezone=True), nullable=True)  # abierto
    pbase_azucar = Column(Float, nullable=False)
    k_factor     = Column(Float, nullable=False)
    justification = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_by = Column(Text, nullable=True)
    correlation_id = Column(sa.CHAR(32), nullable=True)

    __table_args__ = (
        Index("idx_mcp_name_from", "name", "valid_from"),
        UniqueConstraint("name", "valid_from", name="uq_mcp_name_from"),
        {"sqlite_autoincrement": True},
    )

class PrdSeries(Base):
    __tablename__ = "prd_series"
    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True)
    segment = Column(Text, nullable=True, index=True)  # p.ej. "AR_total" o región
    valid_from = Column(DateTime(timezone=True), nullable=False)
    valid_to   = Column(DateTime(timezone=True), nullable=True)
    prd_value  = Column(Float, nullable=False)  # precio/decisión principal
    stock_open = Column(Float, nullable=False)
    domestic_demand = Column(Float, nullable=False)
    exportable_balance = Column(Float, nullable=False)
    policy_id = Column(
        BigInteger().with_variant(Integer, "sqlite"),
        ForeignKey("market_commission_policy.id", ondelete="RESTRICT"),
        nullable=True
    )
    model_id = Column(
        BigInteger().with_variant(Integer, "sqlite"),
        ForeignKey("ml_models.id", ondelete="SET NULL"),
        nullable=True
    )
    inputs_hash = Column(sa.CHAR(64), nullable=True, index=True)  # hash(pronósticos + stock + params)
    mix = Column(JSON_VARIANT, nullable=True)  # breakdown ventas domésticas/export, etc.
    justification = Column(Text, nullable=True)
    correlation_id = Column(sa.CHAR(32), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        Index("idx_prd_segment_from", "segment", "valid_from"),
        UniqueConstraint("inputs_hash", name="uq_prd_inputs_hash"),
        {"sqlite_autoincrement": True},
    )


# --- P3.2 ORM additions: API Audit Log ---
class ApiAuditLog(Base):
    __tablename__ = "api_audit_log"
    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    correlation_id = Column(sa.CHAR(32), nullable=True, index=True)
    endpoint = Column(Text, nullable=False, index=True)
    method = Column(String(10), nullable=False)
    status_code = Column(Integer, nullable=True)
    user_sub = Column(Text, nullable=True, index=True) # email del usuario
    user_roles = Column(Text, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    client_ip = Column(Text, nullable=True)

    __table_args__ = (
        Index("idx_audit_log_timestamp", "timestamp"),
        {"sqlite_autoincrement": True},
    )

class SystemParameter(Base):
    __tablename__ = "system_parameters"
    key = Column(String, primary_key=True, unique=True)
    value = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class HistorialDemandaZonal(Base):
    __tablename__ = "historial_demanda_zonal"
    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    provincia = Column(String, nullable=False, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False, index=True)
    volumen_demanda = Column(DECIMAL(18, 4), nullable=False)

    __table_args__ = (
        UniqueConstraint("timestamp", "provincia", "producto_id", name="uq_demanda_zonal_snapshot"),
        {"sqlite_autoincrement": True},
    )

class EstadisticasMercadoDiarias(Base):
    __tablename__ = "estadisticas_mercado_diarias"
    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True)
    fecha = Column(Date, nullable=False, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False, index=True)
    vwap = Column(DECIMAL(18, 4), nullable=False)
    volatilidad = Column(DECIMAL(18, 4), nullable=False)
    volumen_total = Column(DECIMAL(18, 4), nullable=False)

    __table_args__ = (
        UniqueConstraint("fecha", "producto_id", name="uq_estadisticas_diarias"),
        {"sqlite_autoincrement": True},
    )



class Warrant(Base):
    __tablename__ = 'warrants'
    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey('usuarios.id'), nullable=False)
    producto_id = Column(Integer, ForeignKey('productos.id'), nullable=False)
    cantidad = Column(DECIMAL(18, 4), nullable=False) # Stored in TONS
    deposito = Column(String, nullable=False)
    ingenio = Column(String, nullable=False)
    fecha_emision = Column(Date, nullable=False)
    fecha_vencimiento = Column(Date, nullable=False)
    estado = Column(String, default="activo") # activo, liberado, vencido

    usuario = relationship("Usuario")
    producto = relationship("Producto")
