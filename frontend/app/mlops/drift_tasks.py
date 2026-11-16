# app/mlops/drift_tasks.py
import os
import sqlalchemy as sa
from sqlalchemy.orm import sessionmaker

# Asegurarse de que el path permita importar desde la raíz del proyecto
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.mlops.drift_service import drift_check, get_active_model, persist_metric
from celery_worker import celery_app

@celery_app.task(name='mlops.check_drift')
def check_drift_task():
    dburl = os.getenv('DATABASE_URL')
    if not dburl:
        return {'error': 'DATABASE_URL not set'}
    engine = sa.create_engine(dburl, pool_pre_ping=True, future=True)
    Session = sessionmaker(bind=engine, future=True)
    with Session() as s:
        days = int(os.getenv('DRIFT_DAYS', '7'))
        thr = float(os.getenv('DRIFT_MAPE_THRESHOLD', '0.15'))
        model = get_active_model(s, name=os.getenv('ML_ACTIVE_NAME'))
        
        sql = os.getenv('DRIFT_SQL')
        if not sql and model:
            backend = engine.url.get_backend_name()
            base = "SELECT y_true, y_pred, ts FROM predictions_prod WHERE y_true IS NOT NULL AND y_pred IS NOT NULL"
            if backend.startswith("sqlite"):
                timeflt = f" AND ts >= datetime('now','-{days} day')"
            else:
                timeflt = f" AND ts >= now() - interval '{days} days'"
            sql = f"{base}{timeflt} AND model_id = {model.id} LIMIT 100000"

        summary = drift_check(engine, threshold=thr, sql=sql, days=days)
        
        if model and summary['mape'] == summary['mape']:
            try:
                persist_metric(s, model_id=model.id, metric='MAPE', value=summary['mape'], split='prod')
            except Exception:
                pass
        return summary
