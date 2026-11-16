
import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.metrics import mean_squared_error, mean_absolute_error
import matplotlib.pyplot as plt
import os

def run_experiment_a():
    """
    Este script ejecuta el flujo de trabajo del notebook:
    1. Carga los datos procesados.
    2. Define los targets de predicción.
    3. Entrena un modelo LightGBM para predecir el precio.
    4. Evalúa el modelo e imprime los resultados.
    5. Guarda un gráfico de la predicción.
    """
    print("--- Iniciando Experimento A: LightGBM para Regresión de Precio ---")

    # --- 1. Carga y Preparación de Datos ---
    print("\n[Paso 1/5] Cargando y preparando datos...")
    
    # Configurar rutas
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    PROJECT_ROOT = os.path.dirname(BASE_DIR)
    DATA_DIR = os.path.join(PROJECT_ROOT, 'data')
    SIMULATIONS_DIR = os.path.join(PROJECT_ROOT, 'simulations')
    PROCESSED_DATA_PATH = os.path.join(DATA_DIR, 'processed_intraday_data.parquet')
    
    # Crear directorio de simulaciones si no existe
    os.makedirs(SIMULATIONS_DIR, exist_ok=True)

    # Cargar datos
    df = pd.read_parquet(PROCESSED_DATA_PATH)
    print(f"Datos cargados. Forma del DataFrame: {df.shape}")

    # --- 2. Definición de Variables Objetivo (Target) ---
    print("\n[Paso 2/5] Definiendo variables objetivo...")
    
    N_STEPS_FUTURE = 15
    RETURN_THRESHOLD = 0.005

    df['target_price'] = df['Price'].shift(-N_STEPS_FUTURE)
    
    future_price = df['target_price']
    current_price = df['Price']
    returns = (future_price - current_price) / current_price
    df['target_signal'] = (returns > RETURN_THRESHOLD).astype(int)

    df.dropna(inplace=True)
    print(f"Targets creados. Nueva forma del DataFrame: {df.shape}")

    # --- 3. División de Datos y Entrenamiento ---
    print("\n[Paso 3/5] Dividiendo datos y entrenando el modelo...")

    features = ['Price', 'Open_Daily', 'High_Daily', 'Low_Daily', 'Close_Daily', 'Volume_Daily', 'SMA_10',
                'C5_Open', 'C5_High', 'C5_Low', 'C5_Close', 'C5_Volume', 'Internal_Market_Price']
    target_regression = 'target_price'

    X = df[features]
    y = df[target_regression]

    split_index = int(len(df) * 0.8)
    X_train, X_test = X[:split_index], X[split_index:]
    y_train, y_test = y[:split_index], y[split_index:]

    print(f"Datos de entrenamiento: {X_train.shape[0]} filas")
    print(f"Datos de prueba: {X_test.shape[0]} filas")

    lgbm_regressor = lgb.LGBMRegressor(
        objective='regression_l1',
        n_estimators=1000,
        learning_rate=0.05,
        num_leaves=31,
        n_jobs=-1,
        seed=42
    )

    lgbm_regressor.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        eval_metric='mae',
        callbacks=[lgb.early_stopping(100, verbose=True)]
    )
    print("Entrenamiento completado.")

    # --- 4. Evaluación del Modelo ---
    print("\n[Paso 4/5] Evaluando el modelo...")
    y_pred = lgbm_regressor.predict(X_test)

    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100

    print("\n--- Resultados de la Evaluación (Regresión de Precio) ---")
    print(f"Mean Absolute Error (MAE):      {mae:.4f}")
    print(f"Root Mean Squared Error (RMSE): {rmse:.4f}")
    print(f"Mean Absolute Percentage Error (MAPE): {mape:.2f}%")
    print("------------------------------------------------------")

    # --- 5. Guardar Gráfico de Resultados ---
    print("\n[Paso 5/5] Guardando gráfico de resultados...")
    
    plt.style.use('seaborn-v0_8-whitegrid')
    fig, ax = plt.subplots(figsize=(15, 7))

    sample_size = 2000
    y_test_sample = y_test.iloc[-sample_size:]
    y_pred_sample = y_pred[-sample_size:]

    ax.plot(y_test_sample.index, y_test_sample, label='Precio Real', color='royalblue', lw=2)
    ax.plot(y_test_sample.index, pd.Series(y_pred_sample, index=y_test_sample.index), label='Precio Predicho', color='darkorange', lw=2, linestyle='--')

    ax.set_title('Comparación de Precio Real vs. Predicho (Muestra de Prueba)', fontsize=16)
    ax.set_xlabel('Fecha y Hora', fontsize=12)
    ax.set_ylabel('Precio', fontsize=12)
    ax.legend(fontsize=12)
    ax.grid(True)
    
    plot_path = os.path.join(SIMULATIONS_DIR, 'experiment_A_regression_results.png')
    plt.savefig(plot_path)
    print(f"Gráfico guardado en: {plot_path}")
    print("\n--- Experimento A Completado ---")

if __name__ == '__main__':
    run_experiment_a()
