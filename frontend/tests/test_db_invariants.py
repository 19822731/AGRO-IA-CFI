# tests/test_db_invariants.py
import os
import pytest

# Omite TODO el módulo si no es Postgres
if not os.environ.get("DATABASE_URL", "").startswith("postgresql"):
    pytest.skip("Pruebas de invariantes requieren PostgreSQL", allow_module_level=True)

from sqlalchemy import text
from sqlalchemy.dialects.postgresql import insert
from decimal import Decimal
import models
import database

def test_partial_indexes_exist(db_session):
    rows = db_session.execute(text("""
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE schemaname='public' AND tablename='ordenes';
    """)).fetchall()
    names = {r[0] for r in rows}
    defs  = {r[1] for r in rows}
    assert "idx_ask_open_partial" in names
    assert "idx_bid_open_partial" in names
    assert any("WHERE" in d and "estado" in d and "tipo_orden" in d for d in defs)

def test_idempotency_key_unique_insert(db_session):
    with db_session.begin():
        t1 = insert(models.Transaccion).values(
            idempotency_key="idem-test-123",
            orden_compra_id=None,
            orden_venta_id=None,
            cantidad_ejecutada=Decimal("0.0000"),
            precio_ejecucion=Decimal("0.0000"),
            comision_plataforma=Decimal("0.0000"),
        ).on_conflict_do_nothing(index_elements=["idempotency_key"])
        r1 = db_session.execute(t1)
        
        t2 = insert(models.Transaccion).values(
            idempotency_key="idem-test-123",
            orden_compra_id=None,
            orden_venta_id=None,
            cantidad_ejecutada=Decimal("0.0000"),
            precio_ejecucion=Decimal("0.0000"),
            comision_plataforma=Decimal("0.0000"),
        ).on_conflict_do_nothing(index_elements=["idempotency_key"])
        r2 = db_session.execute(t2)

        assert r1.rowcount in (1, None)
        assert r2.rowcount in (0, None)