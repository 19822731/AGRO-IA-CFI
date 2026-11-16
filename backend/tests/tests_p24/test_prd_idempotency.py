# tests_p24/test_prd_idempotency.py
from datetime import datetime, timezone
from fastapi.testclient import TestClient
import models
from security import create_access_token

def _seed_policy(s):
    s.query(models.MarketCommissionPolicy).delete()
    s.commit()
    s.add(models.MarketCommissionPolicy(
        name="default",
        valid_from=datetime.now(timezone.utc),
        pbase_azucar=1.0,
        k_factor=1.0,
        justification="seed"
    ))
    s.commit()

def _mk_operator(s):
    u = s.query(models.Usuario).filter(models.Usuario.email == "operator@test.com").first()
    if not u:
        u = models.Usuario(email="operator@test.com", hashed_password="x", roles="operator")
        s.add(u)
        s.commit()
    return u

def test_prd_run_is_idempotent(client: TestClient, db_session):
    _seed_policy(db_session)
    operator = _mk_operator(db_session)
    token = create_access_token(data={"sub": operator.email}, roles=["operator"])
    headers = {"Authorization": f"Bearer {token}"}

    fixed_timestamp = datetime.now(timezone.utc).isoformat()

    body = {
        "segment": None,
        "stock_open": 120000.0,
        "domestic_demand": 95000.0,
        "forecast_meta": {"horizon_days": 30},
        "policy_name": "default",
        "valid_from": fixed_timestamp
    }

    r1 = client.post("/api/prd/run", json=body, headers=headers)
    assert r1.status_code in (200, 201), r1.text
    id1 = r1.json()["id"]

    r2 = client.post("/api/prd/run", json=body, headers=headers)
    assert r2.status_code in (200, 201), r2.text
    id2 = r2.json()["id"]
    assert id2 == id1

    n = db_session.query(models.PrdSeries).count()
    assert n == 1