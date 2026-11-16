import logging
import uuid
import time
from datetime import datetime
from typing import List
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import text
from sqlalchemy.orm import Session
import holidays
import pytz
import redis
from asgi_correlation_id import CorrelationIdMiddleware, correlation_id
from prometheus_fastapi_instrumentator import Instrumentator
from jose import jwt, JWTError
from anyio import to_thread

# Importaciones de nuestros módulos locales
import marketplace_service
import models
import schemas
import security
from config import settings
from database import SessionLocal
from logging_config import setup_logging
from security import get_current_user
from app.utils.db_retry import with_db_retry

# --- Configuración Inicial ---
setup_logging()
import celery_signals_publisher  # noqa: F401
app = FastAPI(title="AGRO-IA API")

# --- Middlewares ---

# 1. Correlation ID
app.add_middleware(
    CorrelationIdMiddleware,
    header_name="X-Correlation-ID",
    update_request_header=True,
    generator=lambda: uuid.uuid4().hex,
)

# 2. Middleware de Auditoría (No bloqueante)
EXCLUDED_PATHS = {"/metrics", "/healthz", "/readyz"}

@app.middleware("http")
async def audit_log_middleware(request: Request, call_next):
    if request.url.path in EXCLUDED_PATHS:
        return await call_next(request)

    t0 = time.perf_counter()
    status_code = 500
    try:
        response = await call_next(request)
        status_code = response.status_code
        return response
    finally:
        latency_ms = int((time.perf_counter() - t0) * 1000)
        cid = correlation_id.get()
        
        # IP segura: si usas proxy inverso confiable, toma el primer IP de X-Forwarded-For
        xff = request.headers.get("x-forwarded-for")
        client_ip = (xff.split(",")[0].strip() if xff else (request.client.host if request.client else None))

        user_sub = roles_csv = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
                user_sub = payload.get("sub")
                roles_csv = ",".join(payload.get("roles", []))
            except JWTError:
                pass # Token inválido, no se loguea info de usuario

        def _write_audit_log():
            with SessionLocal() as db:
                entry = models.ApiAuditLog(
                    correlation_id=cid,
                    endpoint=request.url.path,
                    method=request.method,
                    status_code=status_code,
                    user_sub=user_sub,
                    user_roles=roles_csv,
                    latency_ms=latency_ms,
                    client_ip=client_ip,
                )
                db.add(entry)
                with_db_retry(db.commit, max_attempts=3)

        await to_thread.run_sync(_write_audit_log)

# 3. Devolver Correlation ID en la respuesta
@app.middleware("http")
async def add_cid_to_response(request: Request, call_next):
    response = await call_next(request)
    cid = correlation_id.get() or ""
    if cid:
        response.headers["X-Correlation-ID"] = cid
    return response

# 4. Instrumentación de Prometheus
instrumentator = Instrumentator(excluded_handlers=["/metrics"])
instrumentator.instrument(app).expose(app)

# 5. Montar routers de la aplicación
from app.routes.ml_auditoria import router as ml_router
from app.routes.prd import router as prd_router
from app.routes.ops_audit import router as ops_audit_router
from app.routes.admin_reports import router as admin_reports_router # New Import

app.include_router(ml_router, prefix="/ml", tags=["MLOps"])
app.include_router(prd_router, prefix="/api", tags=["PRD"])
app.include_router(ops_audit_router, tags=["Ops"])
app.include_router(admin_reports_router) # New Include


# --- Dependencias ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Healthchecks ---
_redis_client = None
def get_redis():
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.from_url(settings.REDIS_URL)
    return _redis_client

def _db_ok() -> bool:
    try:
        with SessionLocal() as s:
            s.execute(text("SELECT 1"))
        return True
    except Exception:
        return False

def _redis_ok() -> bool:
    try:
        get_redis().ping()
        return True
    except Exception:
        return False

@app.get("/healthz", tags=["ops"])
def liveness():
    logging.getLogger(__name__).info("Health check OK")
    return {"status": "ok"}

@app.get("/readyz", tags=["ops"])
def readiness():
    db_ok = _db_ok()
    cache_ok = _redis_ok()
    ok = db_ok and cache_ok
    code = status.HTTP_200_OK if ok else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse({"db": db_ok, "redis": cache_ok}, status_code=code)


# --- Endpoints ---

@app.post("/usuarios/", response_model=schemas.UsuarioLeer, tags=["Usuarios"])
def endpoint_crear_usuario(usuario: schemas.UsuarioCrear, db: Session = Depends(get_db)):
    db_user = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado.")
    hashed_password = security.get_password_hash(usuario.password)
    db_user = models.Usuario(email=usuario.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/auth/token", response_model=schemas.Token, tags=["Usuarios"])
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email o contraseña incorrectos")
    
    roles = user.roles.split(",") if user.roles else []
    access_token = security.create_access_token(data={"sub": user.email}, roles=roles)
    return {"access_token": access_token, "token_type": "bearer"}

# TODO: These endpoints are broken due to refactoring of marketplace_service.py
# They need to be fixed or removed.
@app.get("/mercado/precio-actual/{producto_id}", response_model=schemas.PrecioReferencia, tags=["Mercado"])
def endpoint_get_precio_actual(producto_id: int, db: Session = Depends(get_db)):
    precio = marketplace_service.get_precio_actual(db, producto_id)
    if precio is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No hay transacciones para este producto.")
    
    return schemas.PrecioReferencia(
        producto_id=producto_id,
        precio=precio,
        timestamp=datetime.now(pytz.utc)
    )

@app.get("/mercado/precio-referencia-dinamico/{producto_id}", response_model=schemas.PrecioReferencia, tags=["Mercado"])
def endpoint_get_precio_referencia_dinamico(producto_id: int, db: Session = Depends(get_db)):
    prd = marketplace_service.get_precio_referencia_dinamico(db, producto_id)
    if prd is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Precio de Referencia Dinámico no disponible para este producto.")
    
    return schemas.PrecioReferencia(
        producto_id=producto_id,
        precio=prd,
        timestamp=datetime.now(pytz.utc)
    )

@app.post("/mercado/ordenes/", response_model=schemas.OrdenLeer, tags=["Mercado"])
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
    
    db_orden = marketplace_service.crear_orden(db=db, orden=orden, usuario_id=current_user.id)
    return db_orden

@app.delete("/mercado/ordenes/{orden_id}", response_model=schemas.OrdenLeer, tags=["Mercado"])
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


@app.get("/mercado/productos/{producto_id}/orderbook", response_model=schemas.OrderBookResponse, tags=["Mercado"])
def endpoint_get_order_book(
    producto_id: int,
    db: Session = Depends(get_db)
):
    order_book = marketplace_service.get_order_book(db=db, producto_id=producto_id)
    return order_book

@app.get("/mercado/historial/ordenes", response_model=List[schemas.OrdenLeer], tags=["Mercado"])
def endpoint_get_user_orders(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    orders = marketplace_service.get_user_orders(db=db, usuario_id=current_user.id)
    return orders

@app.get("/mercado/historial/transacciones", response_model=List[schemas.TransaccionHistorial], tags=["Mercado"])
def endpoint_get_user_transactions(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    transactions = marketplace_service.get_user_transactions(db=db, usuario_id=current_user.id)
    return transactions
