import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, RandomizedSearchCV, GridSearchCV
from sklearn.metrics import mean_squared_error, r2_score
from xgboost import XGBRegressor
import warnings
import os

# Ignorar advertencias
warnings.filterwarnings('ignore')

# --- 1. Definición de Rutas ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'DATOS')
DATA_FILE = os.path.join(DATA_DIR, 'dataset_maestro_COMPLETO.csv')
OUTPUT_FILE = os.path.join(BASE_DIR, 'resultados_optimizacion_xgb_cto11.csv')

# --- 2. Funciones de Indicadores Técnicos ---
def calculate_rsi(series, window=14):
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def calculate_stochastic_oscillator(close, high, low, window=14, smooth_k=3):
    low_min = low.rolling(window=window).min()
    high_max = high.rolling(window=window).max()
    k_percent = 100 * ((close - low_min) / (high_max - low_min))
    d_percent = k_percent.rolling(window=smooth_k).mean()
    return k_percent, d_percent

def calculate_atr(high, low, close, window=14):
    high_low = high - low
    high_close = np.abs(high - close.shift())
    low_close = np.abs(low - close.shift())
    tr = pd.DataFrame({'hl': high_low, 'hc': high_close, 'lc': low_close}).max(axis=1)
    atr = tr.rolling(window=window).mean()
    return atr

def calculate_ichimoku(high, low, close):
    nine_period_high = high.rolling(window=9).max()
    nine_period_low = low.rolling(window=9).min()
    tenkan_sen = (nine_period_high + nine_period_low) / 2
    twenty_six_period_high = high.rolling(window=26).max()
    twenty_six_period_low = low.rolling(window=26).min()
    kijun_sen = (twenty_six_period_high + twenty_six_period_low) / 2
    senkou_span_a = ((tenkan_sen + kijun_sen) / 2).shift(26)
    fifty_two_period_high = high.rolling(window=52).max()
    fifty_two_period_low = low.rolling(window=52).min()
    senkou_span_b = ((fifty_two_period_high + fifty_two_period_low) / 2).shift(26)
    chikou_span = close.shift(-26)
    return tenkan_sen, kijun_sen, senkou_span_a, senkou_span_b, chikou_span

# --- 3. Carga de Datos y Feature Engineering (Completo) ---
print(f"Cargando dataset maestro: {DATA_FILE}")
try:
    df_base = pd.read_csv(DATA_FILE, index_col=0, parse_dates=True)
    df_base.index.name = 'Date'
    print("Dataset cargado exitosamente.")
except Exception as e:
    print(f"Error al cargar {DATA_FILE}: {e}")
    exit()

print("Creando características de ingeniería completas...")
# --- Indicadores Contrato #11 ---
df_base['sugar_11_ma_7d'] = df_base['sugar_11'].rolling(window=7).mean()
df_base['sugar_11_ma_30d'] = df_base['sugar_11'].rolling(window=30).mean()
df_base['sugar_11_ma_90d'] = df_base['sugar_11'].rolling(window=90).mean()
df_base['sugar_11_rsi_14d'] = calculate_rsi(df_base['sugar_11'])
df_base['sugar_11_lag_30d'] = df_base['sugar_11'].shift(30)
df_base['sugar_11_lag_60d'] = df_base['sugar_11'].shift(60)
df_base['sugar_11_lag_90d'] = df_base['sugar_11'].shift(90)
df_base['k_percent_11'], df_base['d_percent_11'] = calculate_stochastic_oscillator(df_base['sugar_11'], df_base['sugar_11_high'], df_base['sugar_11_low'])
df_base['atr_11'] = calculate_atr(df_base['sugar_11_high'], df_base['sugar_11_low'], df_base['sugar_11'])
df_base['tenkan_11'], df_base['kijun_11'], df_base['senkou_a_11'], df_base['senkou_b_11'], df_base['chikou_11'] = calculate_ichimoku(df_base['sugar_11_high'], df_base['sugar_11_low'], df_base['sugar_11'])

# --- Indicadores Externos ---
for lag in [30, 60, 90]:
    df_base[f'oil_wti_lag_{lag}d'] = df_base['oil_wti'].shift(lag)
    df_base[f'ethanol_cbot_lag_{lag}d'] = df_base['ethanol_cbot'].shift(lag)

# --- 4. Creación de Variables Objetivo y Limpieza ---
print("Creando variables objetivo...")
df_base['target_11_30d'] = df_base['sugar_11'].shift(-30)
df_base.dropna(inplace=True)
print(f"Dataset listo. Total de filas (post-dropna): {len(df_base)}")

# --- 5. Definición de Features y Split de Datos ---
features_11_list = [
    'sugar_11_lag_30d', 'sugar_11_lag_60d', 'sugar_11_lag_90d',
    'sugar_11_ma_7d', 'sugar_11_ma_30d', 'sugar_11_ma_90d',
    'sugar_11_rsi_14d',
    'k_percent_11', 'd_percent_11',
    'atr_11',
    'oil_wti_lag_30d', 'oil_wti_lag_60d', 'oil_wti_lag_90d',
    'ethanol_cbot_lag_30d', 'ethanol_cbot_lag_60d', 'ethanol_cbot_lag_90d',
    'tenkan_11', 'kijun_11', 'senkou_a_11', 'senkou_b_11', 'chikou_11'
]
features_11 = [f for f in features_11_list if f in df_base.columns]
print(f"Usando {len(features_11)} features para el modelo.")

X = df_base[features_11]
y = df_base['target_11_30d']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

# --- 5. Optimización de Hiperparámetros con GridSearchCV Enfocada ---
print("\n--- Iniciando optimización de AJUSTE FINO para XGBoost (Contrato #11) ---")
print("Usando GridSearchCV con una parrilla enfocada alrededor de los mejores parámetros encontrados.")

# Parrilla de ajuste fino centrada en los resultados de la búsqueda aleatoria anterior
# Best params: {'subsample': 0.7, 'n_estimators': 300, 'min_child_weight': 5, 'max_depth': 3, 'learning_rate': 0.01, 'gamma': 0.2, 'colsample_bytree': 1.0}
param_grid = {
    'n_estimators': [300, 350, 400],
    'max_depth': [2, 3, 4],
    'learning_rate': [0.01, 0.015, 0.02],
    'subsample': [0.65, 0.7, 0.75],
    'gamma': [0.15, 0.2, 0.25],
    'min_child_weight': [4, 5, 6],
    'colsample_bytree': [0.9, 1.0]
}

# Inicializar el modelo
xgb = XGBRegressor(objective='reg:squarederror', random_state=42)

# Configurar GridSearchCV
grid_search = GridSearchCV(
    estimator=xgb,
    param_grid=param_grid,
    cv=3,
    n_jobs=-1,
    scoring='r2',
    verbose=2
)

# Ejecutar la búsqueda
grid_search.fit(X_train, y_train)

# --- 6. Resultados de la Optimización ---
print("\n--- Resultados de la Optimización de Ajuste Fino ---")
print(f"Mejores Hiperparámetros encontrados: {grid_search.best_params_}")
print(f"Mejor R2 Score (en validación cruzada): {grid_search.best_score_:.4f}")

# --- 7. Evaluación del Modelo Óptimo en el Conjunto de Prueba ---
print("\n--- Evaluación del Modelo de Ajuste Fino en el Conjunto de Prueba ---")

# Obtener el mejor modelo
best_xgb_model = grid_search.best_estimator_

# Realizar predicciones
predictions = best_xgb_model.predict(X_test)

# Calcular métricas finales
final_r2 = r2_score(y_test, predictions)
final_mse = mean_squared_error(y_test, predictions)

print(f"R2 Score Final (en test set): {final_r2:.4f}")
print(f"MSE Final (en test set): {final_mse:.4f}")

# --- 8. Guardar Resultados ---
results_data = {
    'model': ['XGBoost_FineTuned_Optimized_Cto11'],
    'best_r2_cv': [grid_search.best_score_],
    'final_r2_test': [final_r2],
    'final_mse_test': [final_mse],
    'best_params': [str(grid_search.best_params_)]
}
results_df = pd.DataFrame(results_data)
results_df.to_csv(OUTPUT_FILE, index=False)
print(f"\nResultados de la optimización guardados en: {OUTPUT_FILE}")

print("\n¡Proceso de optimización completado!")
