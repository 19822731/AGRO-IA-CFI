import pytest
import pandas as pd
from src.prediction_models import PredictionModels

@pytest.fixture
def prediction_models_instance():
    return PredictionModels()

def test_train_and_predict_production_model(prediction_models_instance):
    prod_data = pd.DataFrame({
        'feature1': [10, 12, 15, 11, 13, 16, 14, 17, 18, 20],
        'feature2': [5, 6, 7, 5, 6, 8, 7, 9, 9, 10],
        'production': [100, 110, 120, 105, 115, 125, 118, 130, 135, 140]
    })
    prediction_models_instance.train_production_model(prod_data, ['feature1', 'feature2'], 'production')
    assert prediction_models_instance.production_model is not None

    new_prod_data = pd.DataFrame({
        'feature1': [19, 21],
        'feature2': [10, 11]
    })
    predictions = prediction_models_instance.predict_production(new_prod_data)
    assert len(predictions) == 2
    assert all(isinstance(p, float) for p in predictions)

def test_predict_production_model_not_trained(prediction_models_instance):
    new_prod_data = pd.DataFrame({
        'feature1': [19, 21],
        'feature2': [10, 11]
    })
    with pytest.raises(ValueError, match="El modelo de producción no ha sido entrenado."):
        prediction_models_instance.predict_production(new_prod_data)

def test_train_and_predict_consumption_model(prediction_models_instance):
    cons_data = pd.DataFrame({
        'date': pd.to_datetime(['2023-01-01', '2023-02-01', '2023-03-01', '2023-04-01', '2023-05-01']),
        'consumption': [50, 55, 60, 52, 58]
    })
    prediction_models_instance.train_consumption_model(cons_data, 'date', 'consumption')
    assert prediction_models_instance.consumption_model is not None

    future_dates = prediction_models_instance.consumption_model.make_future_dataframe(periods=1, freq='MS')
    predictions_df = prediction_models_instance.predict_consumption(future_dates)
    assert 'yhat' in predictions_df.columns
    assert len(predictions_df) == len(cons_data) + 1

def test_predict_consumption_model_not_trained(prediction_models_instance):
    future_dates = pd.DataFrame({'ds': [pd.to_datetime('2024-01-01')]})
    with pytest.raises(ValueError, match="El modelo de consumo no ha sido entrenado."):
        prediction_models_instance.predict_consumption(future_dates)

def test_save_and_load_models(prediction_models_instance, tmp_path):
    prod_data = pd.DataFrame({
        'feature1': [10, 12],
        'feature2': [5, 6],
        'production': [100, 110]
    })
    prediction_models_instance.train_production_model(prod_data, ['feature1', 'feature2'], 'production')

    cons_data = pd.DataFrame({
        'date': pd.to_datetime(['2023-01-01', '2023-02-01']),
        'consumption': [50, 55]
    })
    prediction_models_instance.train_consumption_model(cons_data, 'date', 'consumption')

    prod_path = tmp_path / "prod_model.joblib"
    cons_path = tmp_path / "cons_model.joblib"
    prediction_models_instance.save_models(str(prod_path), str(cons_path))

    loaded_models = PredictionModels()
    loaded_models.load_models(str(prod_path), str(cons_path))

    assert loaded_models.production_model is not None
    assert loaded_models.consumption_model is not None
