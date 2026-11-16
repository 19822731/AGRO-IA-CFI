# tests_p3/test_ops_audit_auth.py
from fastapi.testclient import TestClient
from security import create_access_token
import models
import database # Usará la sesión parcheada por el fixture client

def _mk_user(email, roles="viewer"):
    with database.SessionLocal() as s:
        u = s.query(models.Usuario).filter(models.Usuario.email == email).first()
        if not u:
            u = models.Usuario(email=email, hashed_password="x", roles=roles)
            s.add(u)
            s.commit()
        return u

def test_ops_audit_requires_admin(client: TestClient):
    _mk_user("viewer@x.com", roles="viewer")
    _mk_user("admin@x.com", roles="admin")

    t_viewer = create_access_token({"sub":"viewer@x.com"}, roles=["viewer"])
    t_admin  = create_access_token({"sub":"admin@x.com"}, roles=["admin"])

    r_forbidden = client.get("/ops/audit", headers={"Authorization": f"Bearer {t_viewer}"})
    assert r_forbidden.status_code == 403

    r_ok = client.get("/ops/audit", headers={"Authorization": f"Bearer {t_admin}"})
    assert r_ok.status_code == 200
    assert isinstance(r_ok.json(), list)