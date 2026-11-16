import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
from statsmodels.tsa.seasonal import seasonal_decompose
import warnings
import os

# Ignorar advertencias
warnings.filterwarnings('ignore')

# --- 1. Definición de Rutas ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'DATOS')
DATA_FILE = os.path.join(DATA_DIR, 'dataset_maestro_COMPLETO.csv')
OUTPUT_FILE = os.path.join(BASE_DIR, 'resultados_campeon_v2.csv')

# --- 2. Funciones de Indicadores Técnicos (Sin cambios) ---
def calculate_rsi(series, window=14):
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def calculate_bollinger_bands(series, window=20):
    sma = series.rolling(window=window).mean()
    std = series.rolling(window=window).std()
    upper_band = sma + (std * 2)
    lower_band = sma - (std * 2)
    return upper_band, lower_band, sma

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
    # Corrección: chikou_span no se usa en los return de ichimoku en los scripts anteriores
    return tenkan_sen, kijun_sen, senkou_span_a, senkou_span_b, chikou_span

# --- 3. Carga de Datos ---
print(f"Cargando dataset maestro: {DATA_FILE}")
try:
    # --- ¡¡AQUÍ ESTÁ LA CORRECCIÓN!! ---
    # Le decimos que use la PRIMERA COLUMNA (índice 0) como el índice de fecha
    df_base = pd.read_csv(DATA_FILE, index_col=0, parse_dates=True)
    df_base.index.name = 'Date' # Renombramos el índice por consistencia
    # --- FIN DE LA CORRECCIÓN ---
    
    if df_base.empty:
        raise ValueError("El archivo de datos está vacío.")
    print("Dataset cargado exitosamente.")
except FileNotFoundError:
    print(f"--- ERROR ---")
    print(f"No se encontró el archivo: {DATA_FILE}")
    print("Asegúrate de haber ejecutado primero el script 'crear_dataset_maestro_v2.py'.")
    exit()
except Exception as e:
    print(f"Error al cargar {DATA_FILE}: {e}")
    exit()

# --- 4. Ingeniería de Características (Adaptada a los nuevos nombres) ---
print("Creando características de ingeniería...")

# --- Indicadores Contrato #11 ---
df_base['sugar_11_ma_7d'] = df_base['sugar_11'].rolling(window=7).mean()
df_base['sugar_11_ma_30d'] = df_base['sugar_11'].rolling(window=30).mean()
df_base['sugar_11_ma_90d'] = df_base['sugar_11'].rolling(window=90).mean()
df_base['sugar_11_rsi_14d'] = calculate_rsi(df_base['sugar_11'])
df_base['sugar_11_lag_30d'] = df_base['sugar_11'].shift(30)
df_base['sugar_11_lag_60d'] = df_base['sugar_11'].shift(60)
df_base['sugar_11_lag_90d'] = df_base['sugar_11'].shift(90)
result_11 = seasonal_decompose(df_base['sugar_11'].asfreq('D').interpolate(), model='additive', period=365)
df_base['seasonal_11'] = result_11.seasonal.reindex(df_base.index)
df_base['k_percent_11'], df_base['d_percent_11'] = calculate_stochastic_oscillator(df_base['sugar_11'], df_base['sugar_11_high'], df_base['sugar_11_low'])
df_base['atr_11'] = calculate_atr(df_base['sugar_11_high'], df_base['sugar_11_low'], df_base['sugar_11'])
df_base['tenkan_11'], df_base['kijun_11'], df_base['senkou_a_11'], df_base['senkou_b_11'], df_base['chikou_11'] = calculate_ichimoku(df_base['sugar_11_high'], df_base['sugar_11_low'], df_base['sugar_11'])

# --- Indicadores Contrato #5 ---
df_base['sugar_5_ma_7d'] = df_base['sugar_5'].rolling(window=7).mean()
df_base['sugar_5_ma_30d'] = df_base['sugar_5'].rolling(window=30).mean()
df_base['sugar_5_ma_90d'] = df_base['sugar_5'].rolling(window=90).mean()
df_base['sugar_5_rsi_14d'] = calculate_rsi(df_base['sugar_5'])
df_base['sugar_5_lag_30d'] = df_base['sugar_5'].shift(30)
df_base['sugar_5_lag_60d'] = df_base['sugar_5'].shift(60)
df_base['sugar_5_lag_90d'] = df_base['sugar_5'].shift(90)
result_5 = seasonal_decompose(df_base['sugar_5'].asfreq('D').interpolate(), model='additive', period=365)
df_base['seasonal_5'] = result_5.seasonal.reindex(df_base.index)
upper_5, lower_5, sma_5 = calculate_bollinger_bands(df_base['sugar_5'])
df_base['sugar_5_bb_width'] = (upper_5 - lower_5) / sma_5
df_base['sugar_5_bb_percent_b'] = (df_base['sugar_5'] - lower_5) / (upper_5 - lower_5)
df_base['tenkan_5'], df_base['kijun_5'], df_base['senkou_a_5'], df_base['senkou_b_5'], df_base['chikou_5'] = calculate_ichimoku(df_base['sugar_5_high'], df_base['sugar_5_low'], df_base['sugar_5'])

# --- Indicadores Externos (Adaptados) ---
for lag in [30, 60, 90]:
    df_base[f'fx_dxy_lag_{lag}d'] = df_base['fx_dxy'].shift(lag)
    df_base[f'oil_wti_lag_{lag}d'] = df_base['oil_wti'].shift(lag)
    df_base[f'ethanol_cbot_lag_{lag}d'] = df_base['ethanol_cbot'].shift(lag)

# --- 5. Creación de Variables Objetivo y DropNA Global ---
print("Creando variables objetivo...")
df_base['target_11_30d'] = df_base['sugar_11'].shift(-30)
df_base['target_5_30d'] = df_base['sugar_5'].shift(-30)

# Rellenar NaNs de estacionalidad (inicio del dataset) antes de dropear
df_base['seasonal_11'].fillna(method='bfill', inplace=True)
df_base['seasonal_5'].fillna(method='bfill', inplace=True)

df_base.dropna(inplace=True)
print(f"Dataset listo. Total de filas (post-dropna): {len(df_base)}")

if len(df_base) < 100:
    print("\n--- ERROR ---")
    print("No hay suficientes datos superpuestos (después de crear lags y eliminar NaNs) para entrenar el modelo.")
    print("Esto puede pasar si los historiales de los archivos no coinciden lo suficiente.")
    exit()

# --- 6. Entrenamiento de Modelos Campeones (Listas de Features Adaptadas) ---

# --- Modelo Campeón para Contrato #11 ---
print("\n--- Entrenando Modelo Campeón para Contrato #11 ---")
features_11 = [
    'sugar_11_lag_30d', 'sugar_11_lag_60d', 'sugar_11_lag_90d',
    'sugar_11_ma_7d', 'sugar_11_ma_30d', 'sugar_11_ma_90d',
    'sugar_11_rsi_14d', 'seasonal_11',
    'k_percent_11', 'd_percent_11',
    'atr_11',
    'oil_wti_lag_{lag}d', # Corregido: error de variable f-string, debe ser literal
    'oil_wti_lag_30d', 'oil_wti_lag_60d', 'oil_wti_lag_90d',
    'ethanol_cbot_lag_30d', 'ethanol_cbot_lag_60d', 'ethanol_cbot_lag_90d',
    'tenkan_11', 'kijun_11', 'senkou_a_11', 'senkou_b_11', 'chikou_11'
]
# Limpiar la lista de features por si acaso
features_11 = [f for f in features_11 if '{' not in f and f in df_base.columns]


y_11 = df_base['target_11_30d']
X_11 = df_base[features_11]
X_train_11, X_test_11, y_train_11, y_test_11 = train_test_split(X_11, y_11, test_size=0.2, shuffle=False)

model_11 = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
model_11.fit(X_train_11, y_train_11)
predictions_11 = model_11.predict(X_test_11)

r2_11 = r2_score(y_test_11, predictions_11)
mse_11 = mean_squared_error(y_test_11, predictions_11)

# --- Modelo Campeón para Contrato #5 ---
print("\n--- Entrenando Modelo Campeón para Contrato #5 ---")
features_5 = [
    'sugar_5_lag_30d', 'sugar_5_lag_60d', 'sugar_5_lag_90d',
    'sugar_5_ma_7d', 'sugar_5_ma_30d', 'sugar_5_ma_90d',
    'sugar_5_rsi_14d', 'seasonal_5',
    'fx_dxy_lag_30d', 'fx_dxy_lag_60d', 'fx_dxy_lag_90d',
    'sugar_5_bb_width', 'sugar_5_bb_percent_b',
    'tenkan_5', 'kijun_5', 'senkou_a_5', 'senkou_b_5', 'chikou_5'
]
y_5 = df_base['target_5_30d']
X_5 = df_base[features_5]
X_train_5, X_test_5, y_train_5, y_test_5 = train_test_split(X_5, y_5, test_size=0.2, shuffle=False)

model_5 = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
model_5.fit(X_train_5, y_train_5)
predictions_5 = model_5.predict(X_test_5)

r2_5 = r2_score(y_test_5, predictions_5)
mse_5 = mean_squared_error(y_test_5, predictions_5)

# --- 7. Reporte Final ---
print("\n--- Resultados del Modelo Campeón (Dataset v2) ---")
results_data = {
    'Métrica': ['R2 Score', 'MSE'],
    'Contrato #11': [r2_11, mse_11],
    'Contrato #5': [r2_5, mse_5]
}
results_df = pd.DataFrame(results_data)
print(results_df)

# Guardar resultados en la carpeta 'algoritmo'
results_df.to_csv(OUTPUT_FILE, index=False)
print(f"\nResultados guardados en: {OUTPUT_FILE}")

print("\n¡Proceso de análisis completado!")