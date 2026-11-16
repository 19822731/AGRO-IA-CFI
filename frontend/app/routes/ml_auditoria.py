# app/routes/ml_auditoria.py
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
import os
import sqlalchemy as sa
from sqlalchemy.orm import sessionmaker, Session

# Asegurarse de que el path permita importar desde la raíz del proyecto
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.mlops.drift_service import drift_check, get_active_model
from models import MlMetric
from database import SessionLocal

router = APIRouter()

def _get_session() -> Session:
    if SessionLocal:
        return SessionLocal()
    dburl = os.getenv('DATABASE_URL')
    if not dburl:
        raise HTTPException(500, 'DATABASE_URL no configurado')
    engine = sa.create_engine(dburl, pool_pre_ping=True, future=True)
    return sessionmaker(bind=engine, future=True)()

class AuditResponse(BaseModel):
    model: Optional[Dict[str, Any]]
    last_metrics: Dict[str, Optional[float]]
    drift: Dict[str, Any]

@router.get('/auditoria', response_model=AuditResponse)
def auditoria(name: Optional[str] = Query(None), recompute: bool = False, session: Session = Depends(_get_session)):
    model = get_active_model(session, name=name)
    model_dict = None if not model else {
        'id': model.id, 'name': model.name, 'version': model.version, 'dataset_hash': getattr(model, 'dataset_hash', None),
        'active': bool(model.active), 'created_at': getattr(model, 'created_at', None), 'params': getattr(model, 'params', None)
    }
    last = {'MAPE_prod': None}
    if model:
        m = (session.query(MlMetric)
             .filter(MlMetric.model_id == model.id, MlMetric.split == 'prod', MlMetric.metric == 'MAPE')
             .order_by(MlMetric.timestamp.desc()).first())
        if m:
            last['MAPE_prod'] = float(m.value)
    if recompute:
        dburl = os.getenv('DATABASE_URL')
        if not dburl:
            raise HTTPException(500, 'DATABASE_URL no configurado para recompute')
        drift = drift_check(sa.create_engine(dburl, pool_pre_ping=True, future=True))
    else:
        thr = float(os.getenv('DRIFT_MAPE_THRESHOLD', '0.15'))
        mp = last['MAPE_prod']
        drift = {'mape': mp, 'threshold': thr, 'drift': (mp is not None and mp >= thr), 'n': None, 'timestamp': None}
    try:
        session.close()
    except Exception:
        pass
    return AuditResponse(model=model_dict, last_metrics=last, drift=drift)
