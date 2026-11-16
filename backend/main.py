import logging
import uuid
import time
from datetime import datetime, timedelta
from typing import List
from decimal import Decimal
import random
import string
import asyncio
from fastapi import Depends, FastAPI, HTTPException, Request, status, UploadFile, File, Form, WebSocket, WebSocketDisconnect, Query
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import text
from sqlalchemy.orm import Session
import holidays
import pytz
import redis.asyncio as redis
import shutil
from asgi_correlation_id import CorrelationIdMiddleware, correlation_id
from prometheus_fastapi_instrumentator import Instrumentator
from jose import jwt, JWTError
from anyio import to_thread

# Importaciones de nuestros módulos locales
import marketplace_service
import market_data_service
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

# --- WebSocket Connection Manager ---
class ConnectionManager:
    def __init__(self):
        # Dict: product_id -> List[WebSocket]
        self.active_connections: dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, product_id: int):
        await websocket.accept()
        logging.info(f"WebSocket accepted for product {product_id}")
        if product_id not in self.active_connections:
            self.active_connections[product_id] = []
        self.active_connections[product_id].append(websocket)
        logging.info(f"WebSocket added to active connections. Total: {len(self.active_connections.get(product_id, []))}")

    def disconnect(self, websocket: WebSocket, product_id: int):
        if product_id in self.active_connections:
            if websocket in self.active_connections[product_id]:
                self.active_connections[product_id].remove(websocket)
            if not self.active_connections[product_id]:
                del self.active_connections[product_id]

    async def broadcast(self, message: dict, product_id: int):
        if product_id in self.active_connections:
            # Iterate over a copy to avoid modification issues during iteration
            for connection in list(self.active_connections[product_id]):
                try:
                    await connection.send_json(message)
                except Exception:
                    # If sending fails, assume disconnection
                    self.disconnect(connection, product_id)

manager = ConnectionManager()

# --- Redis Subscriber Background Task ---
async def redis_connector():
    """
    Escucha mensajes de Redis (publicados por Celery workers) y los retransmite a los WebSockets.
    """
    r = redis.from_url(settings.REDIS_URL, decode_responses=True)
    pubsub = r.pubsub()
    await pubsub.subscribe("market_updates")
    
    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                try:
                    # El mensaje de Redis esperamos que sea el ID del producto: "product_id:123"
                    data = message["data"]
                    if data.startswith("product_id:"):
                        product_id = int(data.split(":")[1])
                        
                        # Obtener orderbook actualizado desde la DB
                        # Nota: Esto se ejecuta en el loop principal, debe ser rápido o usar to_thread
                        # Para simplificar, hacemos una query síncrona rápida envuelta en to_thread
                        
                        async def fetch_and_broadcast():
                            with SessionLocal() as db:
                                orderbook = marketplace_service.get_order_book(db, product_id)
                                last_trade_price = marketplace_service.get_precio_actual(db, product_id)
                                
                                # Obtener última transacción completa para el ticker
                                # Start Change: Use extended metadata for Epic Match
                                trade_data = marketplace_service.get_last_trade_extended(db, product_id)
                                # End Change
                                
                                msg = {
                                    "type": "ORDER_BOOK_UPDATE",
                                    "product_id": product_id,
                                    "bids": [{"precio": float(x.precio), "cantidad": float(x.cantidad)} for x in orderbook.bids],
                                    "asks": [{"precio": float(x.precio), "cantidad": float(x.cantidad)} for x in orderbook.asks],
                                    "last_trade": trade_data
                                }
                                if trade_data:
                                    logging.info(f"Broadcasting UPDATE with last_trade: {trade_data['id']} ${trade_data['price']}")
                                else:
                                    logging.info("Broadcasting UPDATE without last_trade")
                                    
                                await manager.broadcast(msg, product_id)
                        
                        await fetch_and_broadcast()
                        
                except Exception as e:
                    logging.error(f"Error processing Redis message: {e}")
    except Exception as e:
        logging.error(f"Redis listener error: {e}")
    finally:
        await r.close()



from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(redis_connector())
    yield

# Attach lifespan to the application router (since app is already created)
app.router.lifespan_context = lifespan

@app.websocket("/ws/market/{product_id}")
async def websocket_endpoint(websocket: WebSocket, product_id: int):
    logging.info(f"New WebSocket connection request for product {product_id}")
    try:
        await manager.connect(websocket, product_id)
        logging.info(f"WebSocket connected successfully for product {product_id}")
        try:
            while True:
                # Keep connection alive - handle both messages and disconnection
                try:
                    # Wait for data with a timeout to allow the loop to continue
                    # logging.debug("Waiting for data...")
                    data = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                    logging.info(f"Received data: {data}")
                    # Process any client messages if needed (ping/pong, etc)
                except asyncio.TimeoutError:
                    # No data received, send a ping to keep connection alive
                    try:
                        # logging.debug("Sending ping...")
                        await websocket.send_json({"type": "ping"})
                    except Exception as e:
                        logging.error(f"Error sending ping: {e}")
                        break  # Connection lost
                except WebSocketDisconnect:
                    logging.info(f"WebSocket disconnected normally for product {product_id}")
                    break
                except Exception as e:
                    logging.warning(f"WebSocket receive error: {e}")
                    break
        except Exception as e:
             logging.error(f"Error during connection loop: {e}")
    finally:
        logging.info(f"Cleaning up WebSocket for product {product_id}")
        manager.disconnect(websocket, product_id)

from fastapi.middleware.cors import CORSMiddleware

# --- Middlewares ---

# 0. CORS (Must be first/early)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"], # Allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
            try:
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
            except Exception as e:
                print(f"Error writing audit log: {e}")

        await to_thread.run_sync(_write_audit_log)

# 3. Devolver Correlation ID en la respuesta
@app.middleware("http")
async def add_cid_to_response(request: Request, call_next):
    response = await call_next(request)
    cid = correlation_id.get() or ""
    if cid:
        response.headers["X-Correlation-ID"] = cid
    return response

# 4. Instrumentación# 5. Prometheus Metrics (Comentado por estabilidad)
# app.add_middleware(PrometheusMiddleware, app_name="marketplace_backend")
# Instrumentator().instrument(app).expose(app)

# 5. Montar routers de la aplicación
from app.routes.ml_auditoria import router as ml_router
from app.routes.prd import router as prd_router
from app.routes.ops_audit import router as ops_audit_router
from app.routes.admin_reports import router as admin_reports_router
from app.routes.usuarios import router as usuarios_router
from app.routes.mercado import router as mercado_router
from app.routes.billetera import router as billetera_router
from app.routes.admin_operaciones import router as admin_operaciones_router

app.include_router(ml_router, prefix="/ml", tags=["MLOps"])
app.include_router(prd_router, prefix="/api", tags=["PRD"])
app.include_router(ops_audit_router, tags=["Ops"])
app.include_router(admin_reports_router)
app.include_router(usuarios_router)
app.include_router(mercado_router)
app.include_router(billetera_router)
app.include_router(admin_operaciones_router)


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

@app.get("/test-cors", tags=["Ops"])
def test_cors():
    return {"status": "ok", "cors": "enabled"}
