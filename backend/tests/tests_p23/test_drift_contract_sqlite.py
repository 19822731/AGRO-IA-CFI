# tests_p23/test_drift_contract_sqlite.py
import os, sys, math
from datetime import datetime

# Importar desde la raíz del proyecto
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker

from models import Base, MlModel, PredictionProd
from app.mlops.drift_service import drift_check

def _sqlite_engine():
    engine = create_engine("sqlite:///:memory:", future=True)
    @event.listens_for(engine, "connect")
    def _fk_on(dbapi_connection, connection_record):
        cur = dbapi_connection.cursor()
        cur.execute("PRAGMA foreign_keys=ON")
        cur.close()
    return engine

def test_drift_check_sqlite_contract():
    # Engine + schema
    engine = _sqlite_engine()
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine, future=True)

    with Session() as s:
        # Modelo activo
        m = MlModel(name="calce", version="v1", active=True)
        s.add(m); s.commit(); s.refresh(m)

        # Caso A: bajo error => no drift (MAPE ~ 0.05)
        rows = [PredictionProd(model_id=m.id, y_true=100.0, y_pred=105.0) for _ in range(50)]
        s.add_all(rows); s.commit()

        res = drift_check(engine, threshold=0.15, sql="SELECT y_true, y_pred, ts FROM predictions_prod")
        assert res["n"] == 50
        assert res["drift"] is False
        assert abs(res["mape"] - 0.05) < 1e-6

        # Reset tabla
        s.execute(text("DELETE FROM predictions_prod")); s.commit()

        # Caso B: alto error => drift (MAPE ~ 0.40)
        rows = [PredictionProd(model_id=m.id, y_true=100.0, y_pred=140.0) for _ in range(50)]
        s.add_all(rows); s.commit()

        res = drift_check(engine, threshold=0.15, sql="SELECT y_true, y_pred, ts FROM predictions_prod")
        assert res["n"] == 50
        assert res["drift"] is True
        assert abs(res["mape"] - 0.40) < 1e-6
