
import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import classification_report, mean_absolute_error
import os
import joblib
import warnings

# Suprimir advertencias de sklearn para metricas con 0 division
warnings.filterwarnings('ignore', category=UserWarning, module='sklearn')

def run_experiment_c():
    """
    Este script ejecuta el Experimento C:
    1. Carga los datos V4 (con PRD, comisiones y TA Features).
    2. Define targets para tendencia (multi-clase) y precios (quantiles).
    3. Entrena 3 modelos LightGBM:
        - Clasificador para Tendencia (con class_weight='balanced').
        - Regresor Quantile para Precio Intermedio (Mediana).
        - Regresor Quantile para Precio Máximo (Percentil 95).
    4. Evalúa los modelos y guarda los resultados.
    """
    print("--- Iniciando Experimento C: Modelo Multi-Target (v2 con TA, PRD, Comisiones y Balanceo) ---")

    # --- 1. Carga de Datos ---
    print("\n[Paso 1/5] Cargando datos V4...")
    
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    PROJECT_ROOT = os.path.dirname(BASE_DIR)
    DATA_DIR = os.path.join(PROJECT_ROOT, 'data')
    MODELS_DIR = os.path.join(PROJECT_ROOT, 'models')
    PROCESSED_DATA_PATH = os.path.join(DATA_DIR, 'processed_intraday_data_v4.parquet')
    
    os.makedirs(MODELS_DIR, exist_ok=True)

    df = pd.read_parquet(PROCESSED_DATA_PATH)
    print(f"Datos cargados. Forma del DataFrame: {df.shape}")
    print("Columnas disponibles:", df.columns.tolist())

    # --- 2. Definición de Variables Objetivo ---
    print("\n[Paso 2/5] Definiendo variables objetivo...")
    
    N_STEPS_FUTURE = 15
    UP_THRESHOLD = 0.003  # +0.3%
    DOWN_THRESHOLD = -0.003 # -0.3%

    future_price = df['Price'].shift(-N_STEPS_FUTURE)
    returns = (future_price - df['Price']) / df['Price']

    conditions = [
        returns > UP_THRESHOLD,
        returns < DOWN_THRESHOLD
    ]
    choices = [1, -1] # 1: SUBE, -1: BAJA
    df['target_trend'] = np.select(conditions, choices, default=0) # 0: LATERAL

    df['target_price'] = future_price

    df.dropna(inplace=True)
    print("Targets creados.")
    print("Distribución de la tendencia:")
    print(df['target_trend'].value_counts(normalize=True))

    # --- 3. División de Datos y Entrenamiento ---
    print("\n[Paso 3/5] Preparando datos y entrenando modelos...")
    
    # Excluir targets y columnas que no sean features
    exclude_cols = ['target_trend', 'target_price'] + [col for col in df.columns if 'DateTime' in col] # Asegurarse de excluir datetime si hay
    features = [col for col in df.columns if col not in exclude_cols and not col.startswith('C11_') and not col.startswith('C5_') and not col.startswith('Internal_Market_Price')]
    
    # Asegurarse de que las columnas OHLC del día no se usan como features si ya hay TA
    # y que los targets no se usen
    # Asegurarse de que no estamos usando 'Date' que fue una columna auxiliar
    features = [f for f in features if f not in ['Date', 'Open_Daily', 'High_Daily', 'Low_Daily', 'Close_Daily', 'Volume_Daily']]
    
    # Incluir las columnas diarias OHLC en las features, pero como features de su propio tipo, no como Open_Daily etc.
    # df_intraday_synthetic_with_ta ya contiene C11_Open etc. y también Open_Daily, High_Daily etc.
    # Debemos decidir cuáles usar como features.
    # Por simplicidad, usaré las TA features, PRD, comisiones, y el precio actual.

    features_to_use = [
        'Price', # Precio actual intradía
        'PRD',
        'desviacion_vs_prd',
        'comision_comprador_estimada',
        'comision_vendedor_estimada',
        'volatility_bbh', 'volatility_bbl', 'volatility_bbm', 'volatility_bbw', 'volatility_atr',
        'momentum_rsi', 'momentum_macd', 'momentum_macd_signal',
        'trend_sma_fast', 'trend_sma_slow', 'trend_ema_fast', 'trend_ema_slow',
        # Daily OHLC values, still useful context
        'Open_Daily', 'High_Daily', 'Low_Daily', 'Close_Daily', 'Volume_Daily',
        'Internal_Market_Price',
        'C5_Close', 'C5_Volume' # C5 data, assuming Close and Volume are most relevant
    ]
    
    # Filtrar solo las features que existen en el dataframe
    final_features = [f for f in features_to_use if f in df.columns]

    X = df[final_features]
    y_trend = df['target_trend']
    y_price = df['target_price']

    # Asegurarse de que no haya NaNs en las features después de toda la limpieza
    X.dropna(inplace=True)
    y_trend = y_trend[X.index] # Alinear targets
    y_price = y_price[X.index]
    
    split_index = int(len(df) * 0.8)
    X_train, X_test = X[:split_index], X[split_index:]
    y_trend_train, y_trend_test = y_trend[:split_index], y_trend[split_index:]
    y_price_train, y_price_test = y_price[:split_index], y_price[split_index:]

    print(f"Número de features utilizadas: {len(final_features)}")
    print(f"Datos de entrenamiento: {X_train.shape[0]} filas")
    print(f"Datos de prueba: {X_test.shape[0]} filas")

    # --- Modelo 1: Clasificador de Tendencia (con class_weight='balanced') ---
    print("\nEntrenando Modelo de Tendencia (Clasificación con balanceo)...")
    lgbm_trend = lgb.LGBMClassifier(objective='multiclass', num_class=3, n_jobs=-1, seed=42, class_weight='balanced')
    lgbm_trend.fit(X_train, y_trend_train)
    joblib.dump(lgbm_trend, os.path.join(MODELS_DIR, 'trend_classifier_C.pkl'))
    print("Modelo de Tendencia guardado.")

    # --- Modelo 2: Regresor de Precio Intermedio (Mediana) ---
    print("\nEntrenando Modelo de Precio Intermedio (Quantile 0.5)...")
    lgbm_median = lgb.LGBMRegressor(objective='quantile', alpha=0.5, n_jobs=-1, seed=42)
    lgbm_median.fit(X_train, y_price_train)
    joblib.dump(lgbm_median, os.path.join(MODELS_DIR, 'median_price_regressor_C.pkl'))
    print("Modelo de Precio Intermedio guardado.")

    # --- Modelo 3: Regresor de Precio Máximo ---
    print("\nEntrenando Modelo de Precio Máximo (Quantile 0.95)...")
    lgbm_max = lgb.LGBMRegressor(objective='quantile', alpha=0.95, n_jobs=-1, seed=42)
    lgbm_max.fit(X_train, y_price_train)
    joblib.dump(lgbm_max, os.path.join(MODELS_DIR, 'max_price_regressor_C.pkl'))
    print("Modelo de Precio Máximo guardado.")

    # --- 4. Evaluación de los Modelos ---
    print("\n[Paso 4/5] Evaluando los modelos...")

    # Evaluación del Clasificador de Tendencia
    print("\n--- Resultados del Modelo de Tendencia ---")
    y_trend_pred = lgbm_trend.predict(X_test)
    report = classification_report(y_trend_test, y_trend_pred, target_names=['BAJA (-1)', 'LATERAL (0)', 'SUBE (1)'])
    print(report)

    # Evaluación de los Regresores de Precio
    print("\n--- Resultados de los Modelos de Precio ---")
    y_median_pred = lgbm_median.predict(X_test)
    y_max_pred = lgbm_max.predict(X_test)
    
    mae_median = mean_absolute_error(y_price_test, y_median_pred)
    mae_max = mean_absolute_error(y_price_test, y_max_pred)
    
    print(f"MAE del Precio Intermedio (Mediana): {mae_median:.4f}")
    print(f"MAE del Precio Máximo: {mae_max:.4f}")
    
    overshoot_pct = (y_price_test > y_max_pred).mean() * 100
    print(f"El precio real superó el 'Precio Máximo' predicho un {overshoot_pct:.2f}% de las veces.")
    
    # --- 5. Finalización ---
    print("\n[Paso 5/5] Experimento C completado.")

if __name__ == '__main__':
    run_experiment_c()
