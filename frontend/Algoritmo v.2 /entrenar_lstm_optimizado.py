import pandas as pd
import numpy as np
import os
import warnings
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.optimizers import Adam
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.preprocessing import MinMaxScaler
from statsmodels.tsa.seasonal import seasonal_decompose

# Ignorar advertencias
warnings.filterwarnings('ignore')
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# --- 1. Definición de Rutas ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'DATOS')
DATA_FILE = os.path.join(DATA_DIR, 'dataset_maestro_COMPLETO.csv')
OUTPUT_FILE = os.path.join(BASE_DIR, 'resultados_LSTM_OPTIMIZADO_FINAL.csv')

# --- 2. Funciones de Indicadores Técnicos (Omitidas por brevedad) ---
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

# --- 3. Carga y Preparación de Datos (Solo Cto #5) ---
print(f"Cargando dataset maestro: {DATA_FILE}")
try:
    df_base = pd.read_csv(DATA_FILE, index_col=0, parse_dates=True)
    df_base.index.name = 'Date'
except Exception as e:
    print(f"Error al cargar {DATA_FILE}: {e}")
    exit()

print("Creando características (solo para Cto #5)...")
# (Omitido por brevedad, igual al script anterior)
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
for lag in [30, 60, 90]:
    df_base[f'fx_dxy_lag_{lag}d'] = df_base['fx_dxy'].shift(lag)
df_base['target_5_30d'] = df_base['sugar_5'].shift(-30)
df_base['seasonal_5'].fillna(method='bfill', inplace=True)
df_base.dropna(inplace=True)

# --- 4. Definición de Features y Split (Cto #5) ---
features_5_list = [
    'sugar_5_lag_30d', 'sugar_5_lag_60d', 'sugar_5_lag_90d',
    'sugar_5_ma_7d', 'sugar_5_ma_30d', 'sugar_5_ma_90d',
    'sugar_5_rsi_14d', 'seasonal_5',
    'fx_dxy_lag_30d', 'fx_dxy_lag_60d', 'fx_dxy_lag_90d',
    'sugar_5_bb_width', 'sugar_5_bb_percent_b',
    'tenkan_5', 'kijun_5', 'senkou_a_5', 'senkou_b_5', 'chikou_5'
]
features_5 = [f for f in features_5_list if f in df_base.columns]

X = df_base[features_5]
y = df_base['target_5_30d']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

# --- 5. Preparación de Datos para LSTM (Usando 360d) ---
print("\n--- Preparando datos para LSTM (Usando 360 días) ---")
TIME_STEPS = 360

def create_sequences(X, y, time_steps=TIME_STEPS):
    Xs, ys = [], []
    for i in range(len(X) - time_steps):
        Xs.append(X[i:(i + time_steps)])
        ys.append(y[i + time_steps])
    return np.array(Xs), np.array(ys)

scaler_X = MinMaxScaler()
X_train_scaled = scaler_X.fit_transform(X_train)
X_test_scaled = scaler_X.transform(X_test)
scaler_y = MinMaxScaler()
y_train_scaled = scaler_y.fit_transform(y_train.values.reshape(-1, 1))
y_test_scaled = scaler_y.transform(y_test.values.reshape(-1, 1))

X_train_seq, y_train_seq = create_sequences(X_train_scaled, y_train_scaled)
X_test_seq, y_test_seq = create_sequences(X_test_scaled, y_test_scaled)
print(f"Dimensiones de entrada: {X_train_seq.shape}")

# --- 6. Construir el Modelo Ganador (¡NUEVO!) ---
# Aplicamos manualmente los hiperparámetros que encontró la búsqueda:
# - Optimizador: adam
# - Tasa de Aprendizaje: 0.001
# - Capas LSTM: 1 (+1 final)
# - Neuronas Capa Densa: 32
# (Los 'units' y 'dropout' de las capas LSTM no se imprimieron, 
#  usaremos los valores de la mejor "prueba" que sí funcionó, ej. 96 y 0.1)

print("\n--- Construyendo el Modelo Optimizado (basado en la búsqueda) ---")

best_model = Sequential()
best_model.add(LSTM(
    units=96, # Asumimos un valor alto de la búsqueda
    return_sequences=False, # <-- Solo 1 capa LSTM (como dijo la búsqueda "Capas LSTM: 1")
    input_shape=(X_train_seq.shape[1], X_train_seq.shape[2])
))
best_model.add(Dropout(0.1)) # Usamos un dropout bajo
best_model.add(Dense(units=32, activation='relu')) # <-- 32 neuronas (como dijo la búsqueda)
best_model.add(Dense(1)) # Capa de salida

best_model.compile(
    optimizer=Adam(learning_rate=0.001), # <-- Tasa de aprendizaje (como dijo la búsqueda)
    loss='mean_squared_error'
)

best_model.summary()

# --- 7. Entrenar el Mejor Modelo ---
print("\n--- Entrenando el Mejor Modelo (LSTM Optimizado) ---")

stop_early_final = EarlyStopping(monitor='val_loss', patience=15, restore_best_weights=True)
history = best_model.fit(
    X_train_seq, y_train_seq,
    epochs=100, # Entrenar hasta 100 épocas
    batch_size=32,
    validation_split=0.2,
    callbacks=[stop_early_final],
    verbose=1
)

# --- 8. Evaluación Final ---
print("\n--- Evaluando el Modelo LSTM Optimizado ---")
predictions_lstm_scaled = best_model.predict(X_test_seq)
predictions_lstm = scaler_y.inverse_transform(predictions_lstm_scaled)
y_test_orig = scaler_y.inverse_transform(y_test_seq)

r2_lstm_tuned = r2_score(y_test_orig, predictions_lstm)
mse_lstm_tuned = mean_squared_error(y_test_orig, predictions_lstm)

print("\n" + "="*60)
print("--- Resultados Finales (XGB vs. LSTM Optimizado) ---")
print("="*60)

try:
    df_campeones = pd.read_csv('resultados_comparativos_LSTM_360d.csv')
    r2_xgb_5 = df_campeones['XGB Contrato #5'][0]
    mse_xgb_5 = df_campeones['XGB Contrato #5'][1]
except Exception:
    print("No se encontró el archivo 'resultados_comparativos_LSTM_360d.csv', se usarán ceros.")
    r2_xgb_5 = 0
    mse_xgb_5 = 0

results_data = {
    'Métrica': ['R2 Score', 'MSE'],
    'XGB (Campeón Anterior)': [r2_xgb_5, mse_xgb_5],
    'LSTM (Optimizado)': [r2_lstm_tuned, mse_lstm_tuned]
}
results_df = pd.DataFrame(results_data)
print(results_df.to_string(float_format="%.4f"))

results_df.to_csv(OUTPUT_FILE, index=False)
print(f"\nResultados guardados en: {OUTPUT_FILE}")

print("\n¡Proceso de optimización completo!")