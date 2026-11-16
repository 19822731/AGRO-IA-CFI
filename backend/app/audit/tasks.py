# app/audit/tasks.py
import os
from datetime import datetime, timedelta, timezone
from celery import Celery
from prometheus_client import Gauge, Counter

# Asegurarse de que el path permita importar desde la raíz del proyecto
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from database import SessionLocal
from models import ApiAuditLog
from app.utils.db_retry import with_db_retry
from celery_worker import celery_app

AUDIT_PURGE_LAST_RUN_TS = Gauge("audit_purge_last_run_ts", "Last purge Unix ts")
AUDIT_PURGE_DELETED_TOTAL = Counter("audit_purge_deleted_total", "Rows deleted by audit purge")

@celery_app.task(name="audit.purge_old")
def purge_old_audit_logs():
    days = int(os.getenv("AUDIT_RETENTION_DAYS", "180"))
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    deleted_count = 0
    
    with SessionLocal() as s:
        def _delete_op():
            # Esta función interna es la que se pasará al helper de reintentos
            deleted = (
                s.query(ApiAuditLog)
                .filter(ApiAuditLog.timestamp < cutoff)
                .delete(synchronize_session=False)
            )
            s.commit()
            return deleted
        
        deleted_count = with_db_retry(_delete_op)

    if deleted_count > 0:
        AUDIT_PURGE_DELETED_TOTAL.inc(deleted_count)
    
    AUDIT_PURGE_LAST_RUN_TS.set(datetime.now(timezone.utc).timestamp())
    return {"deleted": deleted_count, "cutoff": cutoff.isoformat()}
