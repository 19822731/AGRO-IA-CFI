"""Módulo para la gestión de modelos de predicción de producción y consumo de azúcar.

Este módulo contiene la clase `PredictionModels` que encapsula la lógica para
entrenar, predecir, guardar y cargar modelos de Machine Learning para el pronóstico
mensual de la producción y el consumo de azúcar.
"""

import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from statsmodels.tsa.statespace.sarimax import SARIMAX
from prophet import Prophet
import joblib
import logging

# Configuración básica del logger para este módulo
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PredictionModels:
    """Clase para gestionar los modelos de predicción de producción y consumo.

    Esta clase abstrae la complejidad de los modelos de Machine Learning,
    proporcionando una interfaz unificada para su entrenamiento, uso y persistencia.
    Actualmente soporta RandomForestRegressor para producción y Prophet para consumo.
    """
    def __init__(self):
        """Inicializa una nueva instancia de PredictionModels.

        Establece los modelos de producción y consumo a None, indicando que aún no han sido entrenados.
        """
        self.production_model = None
        self.consumption_model = None

    def train_production_model(self, data: pd.DataFrame, features: list, target: str):
        """Entrena el modelo de predicción de producción mensual.

        Utiliza un RandomForestRegressor para predecir la producción basándose en las características proporcionadas.

        Args:
            data (pd.DataFrame): DataFrame que contiene los datos de entrenamiento.
            features (list): Lista de nombres de columnas a usar como características (variables independientes).
            target (str): Nombre de la columna objetivo (variable dependiente, producción).
        """
        X = data[features]
        y = data[target]
        # Usamos RandomForestRegressor como ejemplo, se puede cambiar a GradientBoostingRegressor o XGBoost
        self.production_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.production_model.fit(X, y)
        logger.info("Modelo de producción entrenado exitosamente.")

    def predict_production(self, new_data: pd.DataFrame) -> pd.Series:
        """Realiza predicciones de producción mensual utilizando el modelo entrenado.

        Args:
            new_data (pd.DataFrame): DataFrame con los nuevos datos para la predicción.
                                     Debe contener las mismas columnas de características usadas en el entrenamiento.

        Returns:
            pd.Series: Serie de Pandas con las predicciones de producción.

        Raises:
            ValueError: Si el modelo de producción no ha sido entrenado antes de intentar predecir.
        """
        if self.production_model is None:
            raise ValueError("El modelo de producción no ha sido entrenado.")
        return pd.Series(self.production_model.predict(new_data))

    def train_consumption_model(self, data: pd.DataFrame, date_col: str, target_col: str):
        """Entrena el modelo de predicción de consumo mensual utilizando Prophet.

        Prophet es adecuado para series temporales con estacionalidad y tendencias.

        Args:
            data (pd.DataFrame): DataFrame con los datos de entrenamiento.
            date_col (str): Nombre de la columna que contiene las fechas (será renombrada a 'ds' para Prophet).
            target_col (str): Nombre de la columna objetivo (será renombrada a 'y' para Prophet).
        """
        # Prophet requiere columnas 'ds' y 'y'
        prophet_df = data[[date_col, target_col]].rename(columns={date_col: 'ds', target_col: 'y'})
        self.consumption_model = Prophet()
        self.consumption_model.fit(prophet_df)
        logger.info("Modelo de consumo entrenado exitosamente.")

    def predict_consumption(self, future_dates: pd.DataFrame) -> pd.DataFrame:
        """Realiza predicciones de consumo mensual utilizando el modelo Prophet entrenado.

        Args:
            future_dates (pd.DataFrame): DataFrame con las fechas futuras para la predicción.
                                         Debe contener una columna 'ds' con las fechas.

        Returns:
            pd.DataFrame: DataFrame con las predicciones de consumo, incluyendo 'ds', 'yhat',
                          'yhat_lower' y 'yhat_upper'.

        Raises:
            ValueError: Si el modelo de consumo no ha sido entrenado antes de intentar predecir.
        """
        if self.consumption_model is None:
            raise ValueError("El modelo de consumo no ha sido entrenado.")
        forecast = self.consumption_model.predict(future_dates)
        return forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]

    def save_models(self, production_model_path: str = 'production_model.joblib',
                    consumption_model_path: str = 'consumption_model.joblib'):
        """Guarda los modelos de producción y consumo entrenados en disco.

        Los modelos se guardan utilizando `joblib` para su posterior carga y reutilización.

        Args:
            production_model_path (str): Ruta completa donde se guardará el modelo de producción.
            consumption_model_path (str): Ruta completa donde se guardará el modelo de consumo.
        """
        if self.production_model:
            joblib.dump(self.production_model, production_model_path)
            logger.info(f"Modelo de producción guardado en {production_model_path}")
        if self.consumption_model:
            joblib.dump(self.consumption_model, consumption_model_path)
            logger.info(f"Modelo de consumo guardado en {consumption_model_path}")

    def load_models(self, production_model_path: str = 'production_model.joblib',
                    consumption_model_path: str = 'consumption_model.joblib'):
        """Carga los modelos de producción y consumo desde disco.

        Intenta cargar los modelos desde las rutas especificadas. Si un archivo no se encuentra,
        se imprime un mensaje de advertencia y el modelo correspondiente permanece como None.

        Args:
            production_model_path (str): Ruta completa desde donde se cargará el modelo de producción.
            consumption_model_path (str): Ruta completa desde donde se cargará el modelo de consumo.
        """
        try:
            self.production_model = joblib.load(production_model_path)
            logger.info(f"Modelo de producción cargado desde {production_model_path}")
        except FileNotFoundError:
            logger.warning(f"No se encontró el modelo de producción en {production_model_path}")
        try:
            self.consumption_model = joblib.load(consumption_model_path)
            logger.info(f"Modelo de consumo cargado desde {consumption_model_path}")
        except FileNotFoundError:
            logger.warning(f"No se encontró el modelo de consumo en {consumption_model_path}")

if __name__ == '__main__':
    # Ejemplo de uso (datos ficticios)
    models = PredictionModels()

    # Datos de ejemplo para producción
    prod_data = pd.DataFrame({
        'feature1': [10, 12, 15, 11, 13, 16, 14, 17, 18, 20],
        'feature2': [5, 6, 7, 5, 6, 8, 7, 9, 9, 10],
        'production': [100, 110, 120, 105, 115, 125, 118, 130, 135, 140]
    })
    models.train_production_model(prod_data, ['feature1', 'feature2'], 'production')
    new_prod_data = pd.DataFrame({
        'feature1': [19, 21],
        'feature2': [10, 11]
    })
    logger.info(f"Predicción de producción: {models.predict_production(new_prod_data)}")

    # Datos de ejemplo para consumo
    cons_data = pd.DataFrame({
        'date': pd.to_datetime(['2023-01-01', '2023-02-01', '2023-03-01', '2023-04-01', '2023-05-01',
                                '2023-06-01', '2023-07-01', '2023-08-01', '2023-09-01', '2023-10-01']),
        'consumption': [50, 55, 60, 52, 58, 63, 60, 65, 68, 70]
    })
    models.train_consumption_model(cons_data, 'date', 'consumption')
    future_dates = models.consumption_model.make_future_dataframe(periods=2, freq='MS')
    logger.info(f"Predicción de consumo:\n{models.predict_consumption(future_dates)}")

    models.save_models()
    loaded_models = PredictionModels()
    loaded_models.load_models()
    logger.info("Modelos cargados y listos para usar.")
