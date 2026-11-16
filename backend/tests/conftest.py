# tests/conftest.py
import os
import sys
from pathlib import Path

# 1) PYTHONPATH + forzar DB de tests ANTES de importar la app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
TEST_DB = Path(__file__).parent / "_test.sqlite"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB}"  # fuerza SQLite en tests

import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

@pytest.fixture(scope="session", autouse=True)
def _setup_db():
    # Crear e inyectar engine/SessionLocal de pruebas en el módulo `database`
    import database

    url = os.environ["DATABASE_URL"]
    is_sqlite = url.startswith("sqlite")
    connect_args = {"check_same_thread": False} if is_sqlite else {}

    engine = create_engine(url, future=True, connect_args=connect_args)
    SessionLocal = sessionmaker(bind=engine, future=True, expire_on_commit=False)

    database.engine = engine
    database.SessionLocal = SessionLocal

    if is_sqlite:
        @event.listens_for(engine, "connect")
        def _fk_on(dbapi_conn, _):
            cur = dbapi_conn.cursor()
            cur.execute("PRAGMA foreign_keys=ON")
            cur.close()

    # IMPORTAR Base DESPUÉS de inyectar engine/SessionLocal
    from models import Base
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)

@pytest.fixture()
def db_session():
    import database
    s = database.SessionLocal()
    try:
        yield s
    finally:
        s.close()

@pytest.fixture()
def TestingSessionLocal():
    """
    Fixture de compatibilidad para tests antiguos.
    Devuelve el sessionmaker para que puedan hacer TestingSessionLocal() y obtener una sesión.
    """
    import database
    return database.SessionLocal

@pytest.fixture()
def client():
    from main import app
    from app.routes import prd as prd_router
    from app.routes import ops_audit as ops_audit_router
    from app.routes import ml_auditoria as ml_router
    from security import get_db as security_get_db

    # Un *nuevo* SessionLocal por request (no reciclar uno global)
    def _override():
        import database
        db = database.SessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[prd_router._get_session] = _override
    app.dependency_overrides[ops_audit_router._get_session] = _override
    app.dependency_overrides[ml_router._get_session]  = _override
    app.dependency_overrides[security_get_db]         = _override

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
