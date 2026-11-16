# tests_p23/test_ml_auditoria_endpoint.py
from fastapi.testclient import TestClient
import models
import database # Usará la sesión parcheada por el fixture client

def test_auditoria_endpoint_last_metric_and_recompute(client: TestClient, TestingSessionLocal):
    # Datos base
    with TestingSessionLocal() as s:
        # Limpiar datos de pruebas anteriores
        s.query(models.MlMetric).delete()
        s.query(models.PredictionProd).delete()
        s.query(models.MlModel).delete()
        s.commit()

        # Modelo activo
        m = models.MlModel(name="calce", version="v1", active=True)
        s.add(m)
        s.commit()
        s.refresh(m)

        # Última métrica persistida (sin recompute): MAPE = 0.12
        s.add(models.MlMetric(model_id=m.id, split="prod", metric="MAPE", value=0.12))
        s.commit()

        # Predicciones para recompute (MAPE ≈ 0.20 ⇒ drift=True con umbral 0.15)
        rows = [models.PredictionProd(model_id=m.id, y_true=100.0, y_pred=120.0) for _ in range(50)]
        s.add_all(rows)
        s.commit()

    # 1) Sin recompute: devuelve la última métrica persistida
    r = client.get("/ml/auditoria", params={"name": "calce"})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["model"]["name"] == "calce"
    assert abs(data["last_metrics"]["MAPE_prod"] - 0.12) < 1e-9
    assert data["drift"]["drift"] is False

    # 2) Con recompute: calcula sobre predictions_prod (MAPE ≈ 0.20)
    r2 = client.get("/ml/auditoria", params={"name": "calce", "recompute": "true"})
    assert r2.status_code == 200, r2.text
    d2 = r2.json()
    assert d2["drift"]["n"] == 50
    assert d2["drift"]["drift"] is True
    assert abs(d2["drift"]["mape"] - 0.20) < 1e-6