# app/routes/ops_audit.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

# Asegurarse de que el path permita importar desde la raíz del proyecto
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from database import SessionLocal
import models
from security import require_role

router = APIRouter(dependencies=[Depends(require_role("admin"))])

def _get_session():
    db = SessionLocal()
    try: 
        yield db
    finally: 
        db.close()

@router.get("/ops/audit")
def query_audit(
    cid: str | None = None,
    sub: str | None = None,
    status: int | None = None,
    endpoint: str | None = None,
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(_get_session),
):
    q = db.query(models.ApiAuditLog).order_by(models.ApiAuditLog.id.desc())
    if cid: q = q.filter(models.ApiAuditLog.correlation_id == cid)
    if sub: q = q.filter(models.ApiAuditLog.user_sub == sub)
    if status: q = q.filter(models.ApiAuditLog.status_code == status)
    if endpoint: q = q.filter(models.ApiAuditLog.endpoint.like(f"%{endpoint}%"))
    rows = q.offset(offset).limit(limit).all()
    return [
        {
            "id": r.id,
            "ts": r.timestamp,
            "cid": r.correlation_id,
            "ep": r.endpoint,
            "m": r.method,
            "sc": r.status_code,
            "sub": r.user_sub,
            "roles": r.user_roles,
            "lat_ms": r.latency_ms,
            "ip": r.client_ip,
        }
        for r in rows
    ]
