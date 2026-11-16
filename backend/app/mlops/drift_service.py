# app/mlops/drift_service.py
from typing import List, Tuple, Optional, Dict, Any
from datetime import datetime, timezone
import os
import sqlalchemy as sa
from sqlalchemy.orm import Session

try:
    from prometheus_client import Gauge
    ML_MAPE_PROD = Gauge('ml_mape_prod', 'MAPE en producción (fracción)')
    ML_DRIFT_FLAG = Gauge('ml_drift_flag', 'Drift (0/1)')
    ML_LAST_AUDIT_TS = Gauge('ml_last_audit_timestamp', 'Última auditoría (epoch)')
except Exception:
    ML_MAPE_PROD = ML_DRIFT_FLAG = ML_LAST_AUDIT_TS = None

# Asegurarse de que el path permita importar desde la raíz del proyecto
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from models import MlModel, MlMetric

def compute_mape(y_true: List[float], y_pred: List[float], ignore_zeros: bool=True, eps=1e-8) -> float:
    if not y_true or len(y_true) != len(y_pred):
        return float('nan')
    num, den = 0.0, 0
    for yt, yp in zip(y_true, y_pred):
        if yt == 0 and ignore_zeros:
            continue
        num += abs((yt - yp) / (yt or eps))
        den += 1
    return (num / den) if den > 0 else float('nan')

def _default_sql(dialect: str, days: int) -> str:
    return (f"""SELECT y_true,y_pred,ts
                FROM predictions_prod
                WHERE ts >= now() - interval '{days} days'
                  AND y_true IS NOT NULL AND y_pred IS NOT NULL
                LIMIT 100000"""
            if dialect.startswith('postgres') else
            f"""SELECT y_true,y_pred,ts FROM predictions_prod
                WHERE ts >= datetime('now','-{days} day')
                  AND y_true IS NOT NULL AND y_pred IS NOT NULL
                LIMIT 100000""")

def _fetch_pairs(engine: sa.Engine, sql: Optional[str], days: int) -> Tuple[List[float], List[float]]:
    query = sql or _default_sql(engine.url.get_backend_name(), days)
    ys, ps = [], []
    with engine.connect() as c:
        for yt, yp, _ in c.execute(sa.text(query)):
            ys.append(float(yt))
            ps.append(float(yp))
    return ys, ps

def drift_check(engine: sa.Engine, threshold: Optional[float] = None, sql: Optional[str] = None, days: int = 7) -> Dict[str, Any]:
    thr = threshold if threshold is not None else float(os.getenv('DRIFT_MAPE_THRESHOLD', '0.15'))
    ys, ps = _fetch_pairs(engine, sql, days)
    mape = compute_mape(ys, ps)
    drift = (mape >= thr) if (mape == mape) else False
    now = datetime.now(timezone.utc).timestamp()
    try:
        if ML_MAPE_PROD:
            ML_MAPE_PROD.set(0.0 if mape != mape else mape)
        if ML_DRIFT_FLAG:
            ML_DRIFT_FLAG.set(1.0 if drift else 0.0)
        if ML_LAST_AUDIT_TS:
            ML_LAST_AUDIT_TS.set(now)
    except Exception:
        pass
    return {'mape': mape, 'n': len(ys), 'threshold': thr, 'drift': drift, 'timestamp': now}

def get_active_model(session: Session, name: Optional[str] = None):
    q = session.query(MlModel).filter(MlModel.active == True)
    if name:
        q = q.filter(MlModel.name == name)
    return q.order_by(MlModel.created_at.desc()).first()

def persist_metric(session: Session, model_id: int, metric: str, value: float, split='prod') -> int:
    obj = MlMetric(model_id=model_id, split=split, metric=metric, value=float(value))
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj.id
