# tests_p3/test_audit_persistence.py
from fastapi.testclient import TestClient
from datetime import datetime, timezone
from security import create_access_token
import models
import database # Usará la sesión parcheada por el fixture client

def _ensure_admin(email="admin@test.com"):
    with database.SessionLocal() as s:
        u = s.query(models.Usuario).filter(models.Usuario.email == email).first()
        if not u:
            u = models.Usuario(email=email, hashed_password="x", roles="admin")
            s.add(u)
            s.commit()
        return u

def test_audit_logs_latency_and_ip(client: TestClient):
    admin = _ensure_admin()
    token = create_access_token(data={"sub": admin.email}, roles=["admin"])

    headers = {
        "Authorization": f"Bearer {token}",
        "X-Forwarded-For": "1.2.3.4"
    }
    r = client.get("/ops/audit?limit=1", headers=headers)
    assert r.status_code == 200

    with database.SessionLocal() as s:
        row = (
            s.query(models.ApiAuditLog)
            .order_by(models.ApiAuditLog.id.desc())
            .first()
        )
        assert row is not None, "No se encontró registro de auditoría"
        assert row.endpoint.endswith("/ops/audit")
        assert row.status_code == 200
        assert row.user_sub == admin.email
        assert "admin" in (row.user_roles or "")
        assert row.client_ip == "1.2.3.4"
        assert row.latency_ms is not None and row.latency_ms >= 0