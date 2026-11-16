import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
from statsmodels.tsa.seasonal import seasonal_decompose
import warnings
import os

# --- Modelos ---
from xgboost import XGBRegressor
from sklearn.preprocessing import MinMaxScaler
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping

# Ignorar advertencias
warnings.filterwarnings('ignore')
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' # Ocultar logs de TensorFlow

# --- 1. Definición de Rutas ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'DATOS')
DATA_FILE = os.path.join(DATA_DIR, 'dataset_maestro_COMPLETO.csv')
# --- ¡CAMBIO AQUÍ! ---
OUTPUT_FILE = os.path.join(BASE_DIR, 'resultados_comparativos_LSTM_360d.csv')

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
    return tenkan_sen, kijun_sen, senkou_span_a, senkou_span_b, chikou_span

# --- 3. Carga de Datos (Corregido) ---
print(f"Cargando dataset maestro: {DATA_FILE}")
try:
    df_base = pd.read_csv(DATA_FILE, index_col=0, parse_dates=True)
    df_base.index.name = 'Date'
    print("Dataset cargado exitosamente.")
except Exception as e:
    print(f"Error al cargar {DATA_FILE}: {e}")
    exit()

# --- 4. Ingeniería de Características (Sin cambios) ---
print("Creando características de ingeniería...")
# (Se omite el código idéntico de la V2 por brevedad, se asume que está aquí)
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

df_base['seasonal_11'].fillna(method='bfill', inplace=True)
df_base['seasonal_5'].fillna(method='bfill', inplace=True)

df_base.dropna(inplace=True)
print(f"Dataset listo. Total de filas (post-dropna): {len(df_base)}")

if len(df_base) < 100:
    print("ERROR: No hay suficientes datos para entrenar.")
    exit()

# --- 6. Definición de Features ---
features_11_list = [
    'sugar_11_lag_30d', 'sugar_11_lag_60d', 'sugar_11_lag_90d',
    'sugar_11_ma_7d', 'sugar_11_ma_30d', 'sugar_11_ma_90d',
    'sugar_11_rsi_14d', 'seasonal_11',
    'k_percent_11', 'd_percent_11', 'atr_11',
    'oil_wti_lag_30d', 'oil_wti_lag_60d', 'oil_wti_lag_90d',
    'ethanol_cbot_lag_30d', 'ethanol_cbot_lag_60d', 'ethanol_cbot_lag_90d',
    'tenkan_11', 'kijun_11', 'senkou_a_11', 'senkou_b_11', 'chikou_11'
]
features_11 = [f for f in features_11_list if f in df_base.columns]

features_5_list = [
    'sugar_5_lag_30d', 'sugar_5_lag_60d', 'sugar_5_lag_90d',
    'sugar_5_ma_7d', 'sugar_5_ma_30d', 'sugar_5_ma_90d',
    'sugar_5_rsi_14d', 'seasonal_5',
    'fx_dxy_lag_30d', 'fx_dxy_lag_60d', 'fx_dxy_lag_90d',
    'sugar_5_bb_width', 'sugar_5_bb_percent_b',
    'tenkan_5', 'kijun_5', 'senkou_a_5', 'senkou_b_5', 'chikou_5'
]
features_5 = [f for f in features_5_list if f in df_base.columns]

# --- 7. Split de Datos (Estándar) ---
X_11 = df_base[features_11]
y_11 = df_base['target_11_30d']
X_train_11, X_test_11, y_train_11, y_test_11 = train_test_split(X_11, y_11, test_size=0.2, shuffle=False)

X_5 = df_base[features_5]
y_5 = df_base['target_5_30d']
X_train_5, X_test_5, y_train_5, y_test_5 = train_test_split(X_5, y_5, test_size=0.2, shuffle=False)

# --- 8. Entrenamiento RF y XGB (Rápidos) ---
print("\n--- Entrenando Modelo [Random Forest] para Contrato #11 ---")
model_rf_11 = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
model_rf_11.fit(X_train_11, y_train_11)
predictions_rf_11 = model_rf_11.predict(X_test_11)
r2_rf_11 = r2_score(y_test_11, predictions_rf_11)
mse_rf_11 = mean_squared_error(y_test_11, predictions_rf_11)

print("\n--- Entrenando Modelo [XGBoost] para Contrato #11 ---")
model_xgb_11 = XGBRegressor(n_estimators=100, random_state=42, n_jobs=-1, objective='reg:squarederror')
model_xgb_11.fit(X_train_11, y_train_11)
predictions_xgb_11 = model_xgb_11.predict(X_test_11)
r2_xgb_11 = r2_score(y_test_11, predictions_xgb_11)
mse_xgb_11 = mean_squared_error(y_test_11, predictions_xgb_11)

print("\n--- Entrenando Modelo [Random Forest] para Contrato #5 ---")
model_rf_5 = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
model_rf_5.fit(X_train_5, y_train_5)
predictions_rf_5 = model_rf_5.predict(X_test_5)
r2_rf_5 = r2_score(y_test_5, predictions_rf_5)
mse_rf_5 = mean_squared_error(y_test_5, predictions_rf_5)

print("\n--- Entrenando Modelo [XGBoost] para Contrato #5 ---")
model_xgb_5 = XGBRegressor(n_estimators=100, random_state=42, n_jobs=-1, objective='reg:squarederror')
model_xgb_5.fit(X_train_5, y_train_5)
predictions_xgb_5 = model_xgb_5.predict(X_test_5)
r2_xgb_5 = r2_score(y_test_5, predictions_xgb_5)
mse_xgb_5 = mean_squared_error(y_test_5, predictions_xgb_5)

# --- 9. Preparación de Datos para LSTM (¡NUEVO!) ---
print("\n--- Preparando datos para LSTM ---")

# --- ¡¡¡CAMBIO CLAVE AQUÍ!!! ---
TIME_STEPS = 360 # Mirar 360 días (aprox 1.5 años) hacia atrás
# --- ¡¡¡FIN DEL CAMBIO!!! ---

# --- Función para crear secuencias ---
def create_sequences(X, y, time_steps=TIME_STEPS):
    Xs, ys = [], []
    for i in range(len(X) - time_steps):
        Xs.append(X[i:(i + time_steps)])
        ys.append(y[i + time_steps])
    return np.array(Xs), np.array(ys)

# --- Preprocesamiento LSTM Contrato #11 ---
scaler_X_11 = MinMaxScaler()
X_train_11_scaled = scaler_X_11.fit_transform(X_train_11)
X_test_11_scaled = scaler_X_11.transform(X_test_11)
scaler_y_11 = MinMaxScaler()
y_train_11_scaled = scaler_y_11.fit_transform(y_train_11.values.reshape(-1, 1))
y_test_11_scaled = scaler_y_11.transform(y_test_11.values.reshape(-1, 1))

X_train_seq_11, y_train_seq_11 = create_sequences(X_train_11_scaled, y_train_11_scaled)
X_test_seq_11, y_test_seq_11 = create_sequences(X_test_11_scaled, y_test_11_scaled)

# --- Preprocesamiento LSTM Contrato #5 ---
scaler_X_5 = MinMaxScaler()
X_train_5_scaled = scaler_X_5.fit_transform(X_train_5)
X_test_5_scaled = scaler_X_5.transform(X_test_5)
scaler_y_5 = MinMaxScaler()
y_train_5_scaled = scaler_y_5.fit_transform(y_train_5.values.reshape(-1, 1))
y_test_5_scaled = scaler_y_5.transform(y_test_5.values.reshape(-1, 1))

X_train_seq_5, y_train_seq_5 = create_sequences(X_train_5_scaled, y_train_5_scaled)
X_test_seq_5, y_test_seq_5 = create_sequences(X_test_5_scaled, y_test_5_scaled)

# --- 10. Construcción y Entrenamiento Modelo LSTM ---
def build_lstm_model(input_shape):
    model = Sequential()
    model.add(LSTM(50, return_sequences=True, input_shape=input_shape))
    model.add(Dropout(0.2))
    model.add(LSTM(50, return_sequences=False))
    model.add(Dropout(0.2))
    model.add(Dense(25))
    model.add(Dense(1))
    model.compile(optimizer='adam', loss='mean_squared_error')
    return model

# --- LSTM Contrato #11 ---
print(f"\n--- Entrenando Modelo [LSTM] para Contrato #11 (360 días) ---")
print(f"Dimensiones de entrada: {X_train_seq_11.shape}") # Debería ser (..., 360, 22)
model_lstm_11 = build_lstm_model(input_shape=(X_train_seq_11.shape[1], X_train_seq_11.shape[2]))
early_stop = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)
model_lstm_11.fit(X_train_seq_11, y_train_seq_11,
                  epochs=20, batch_size=32, validation_split=0.1,
                  callbacks=[early_stop], verbose=1)

predictions_lstm_scaled_11 = model_lstm_11.predict(X_test_seq_11)
predictions_lstm_11 = scaler_y_11.inverse_transform(predictions_lstm_scaled_11)
y_test_orig_11 = scaler_y_11.inverse_transform(y_test_seq_11)

r2_lstm_11 = r2_score(y_test_orig_11, predictions_lstm_11)
mse_lstm_11 = mean_squared_error(y_test_orig_11, predictions_lstm_11)

# --- LSTM Contrato #5 ---
print(f"\n--- Entrenando Modelo [LSTM] para Contrato #5 (360 días) ---")
print(f"Dimensiones de entrada: {X_train_seq_5.shape}") # Debería ser (..., 360, 18)
model_lstm_5 = build_lstm_model(input_shape=(X_train_seq_5.shape[1], X_train_seq_5.shape[2]))
early_stop_5 = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)
model_lstm_5.fit(X_train_seq_5, y_train_seq_5,
                 epochs=20, batch_size=32, validation_split=0.1,
                 callbacks=[early_stop_5], verbose=1)

predictions_lstm_scaled_5 = model_lstm_5.predict(X_test_seq_5)
predictions_lstm_5 = scaler_y_5.inverse_transform(predictions_lstm_scaled_5)
y_test_orig_5 = scaler_y_5.inverse_transform(y_test_seq_5)

r2_lstm_5 = r2_score(y_test_orig_5, predictions_lstm_5)
mse_lstm_5 = mean_squared_error(y_test_orig_5, predictions_lstm_5)

# --- 11. Reporte Final Comparativo ---
print("\n" + "="*60)
# --- ¡CAMBIO AQUÍ! ---
print("--- Resultados Comparativos (RF vs. XGB vs. LSTM-360d) ---")
print("="*60)

results_data = {
    'Métrica': ['R2 Score', 'MSE'],
    'RF Contrato #11': [r2_rf_11, mse_rf_11],
    'XGB Contrato #11': [r2_xgb_11, mse_xgb_11],
    'LSTM-360d Cto #11': [r2_lstm_11, mse_lstm_11], # NUEVO
    'RF Contrato #5': [r2_rf_5, mse_rf_5],
    'XGB Contrato #5': [r2_xgb_5, mse_xgb_5],
    'LSTM-360d Cto #5': [r2_lstm_5, mse_lstm_5] # NUEVO
}
results_df = pd.DataFrame(results_data)
print(results_df.to_string(float_format="%.4f"))

# Guardar resultados
results_df.to_csv(OUTPUT_FILE, index=False)
print(f"\nResultados guardados en: {OUTPUT_FILE}")

print("\n¡Proceso de análisis completo!")