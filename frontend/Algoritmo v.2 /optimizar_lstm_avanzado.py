import pandas as pd
import numpy as np
import os
import warnings
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.optimizers import Adam, RMSprop # Importamos RMSprop

import keras_tuner as kt

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
OUTPUT_FILE = os.path.join(BASE_DIR, 'resultados_LSTM_AVANZADO.csv')
TUNER_DIR = os.path.join(BASE_DIR, 'keras_tuner_logs_avanzado') # Nueva carpeta de logs

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
# --- Indicadores Externos (Cto #5) ---
for lag in [30, 60, 90]:
    df_base[f'fx_dxy_lag_{lag}d'] = df_base['fx_dxy'].shift(lag)

print("Creando variables objetivo...")
df_base['target_5_30d'] = df_base['sugar_5'].shift(-30)
df_base['seasonal_5'].fillna(method='bfill', inplace=True)
df_base.dropna(inplace=True)
print(f"Dataset listo. Total de filas (post-dropna): {len(df_base)}")

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
TIME_STEPS = 360 # Usamos el mejor lapso que encontramos

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
print(f"Dimensiones de entrada para el Tuner: {X_train_seq.shape}")

# --- 6. Modelo "Plantilla" para KerasTuner (AVANZADO) ---
def build_model(hp):
    model = Sequential()
    
    hp_learning_rate = hp.Choice('learning_rate', values=[1e-3, 1e-4])

    optimizer_choice = hp.Choice('optimizer', values=['adam', 'rmsprop'])
    if optimizer_choice == 'adam':
        optimizer = Adam(learning_rate=hp_learning_rate)
    else:
        optimizer = RMSprop(learning_rate=hp_learning_rate)

    for i in range(hp.Int('num_layers', 1, 2)):
        model.add(LSTM(
            units=hp.Int(f'units_{i}', min_value=32, max_value=96, step=32),
            return_sequences=True 
        ))
        model.add(Dropout(hp.Float(f'dropout_{i}', 0.1, 0.3, step=0.1)))

    model.add(LSTM(
        units=hp.Int('units_final', min_value=32, max_value=96, step=32),
        return_sequences=False
    ))
    model.add(Dropout(hp.Float('dropout_final', 0.1, 0.3, step=0.1)))
    
    model.add(Dense(units=hp.Int('dense_units', 16, 64, step=16), activation='relu'))
    model.add(Dense(1)) 
    
    model.compile(optimizer=optimizer, loss='mean_squared_error')
    return model

# --- 7. Configuración del Sintonizador (Tuner) ---
print("\n--- Configurando KerasTuner (Avanzado) ---")

# --- ¡¡¡INICIO DE LA CORRECCIÓN!!! ---
tuner = kt.RandomSearch(
    build_model,
    objective='val_loss',
    max_trials=15, 
    executions_per_trial=1, 
    directory=TUNER_DIR,
    project_name='lstm_cto5_avanzado',
    overwrite=True  # Usar overwrite=True en lugar de tuner.reload()
)
# --- ¡¡¡FIN DE LA CORRECCIÓN!!! ---

stop_early_tuner = EarlyStopping(monitor='val_loss', patience=5)

# --- 8. Iniciar la Búsqueda (¡ESTO TARDARÁ MUCHO!) ---
print("\n" + "="*50)
print("--- INICIANDO BÚSQUEDA AVANZADA (max_trials=15) ---")
print("...Esto puede tardar MUCHAS HORAS...")
print("="*50)

tuner.search(
    X_train_seq, y_train_seq,
    epochs=15, 
    validation_split=0.2,
    callbacks=[stop_early_tuner],
    verbose=1
)

print("\n" + "="*50)
print("--- BÚSQUEDA COMPLETADA ---")
print("="*50)

# Obtener los mejores hiperparámetros
best_hps = tuner.get_best_hyperparameters(num_trials=1)[0]
print("Los mejores hiperparámetros encontrados son:")
print(f"- Optimizador: {best_hps.get('optimizer')}")
print(f"- Tasa de Aprendizaje: {best_hps.get('learning_rate')}")
print(f"- Capas LSTM: {best_hps.get('num_layers')} (+1 final)")
print(f"- Neuronas Capa Densa: {best_hps.get('dense_units')}")

# --- 9. Entrenar el Mejor Modelo Encontrado ---
print("\n--- Entrenando el Mejor Modelo (LSTM Avanzado) ---")
best_model = tuner.build_model(best_hps)
best_model.summary()

stop_early_final = EarlyStopping(monitor='val_loss', patience=15, restore_best_weights=True)
history = best_model.fit(
    X_train_seq, y_train_seq,
    epochs=100, 
    batch_size=32,
    validation_split=0.2,
    callbacks=[stop_early_final],
    verbose=1
)

# --- 10. Evaluación Final ---
print("\n--- Evaluando el Modelo LSTM Avanzado ---")
predictions_lstm_scaled = best_model.predict(X_test_seq)
predictions_lstm = scaler_y.inverse_transform(predictions_lstm_scaled)
y_test_orig = scaler_y.inverse_transform(y_test_seq)

r2_lstm_tuned = r2_score(y_test_orig, predictions_lstm)
mse_lstm_tuned = mean_squared_error(y_test_orig, predictions_lstm)

print("\n" + "="*60)
print("--- Resultados Finales (XGB vs. LSTM Avanzado) ---")
print("="*60)

try:
    # Cargar los resultados del campeón anterior para comparar
    df_campeones = pd.read_csv('resultados_comparativos_LSTM_360d.csv')
    r2_xgb_5 = df_campeones['XGB Contrato #5'][0]
    mse_xgb_5 = df_campeones['XGB Contrato #5'][1]
except Exception:
    print("No se encontró el archivo de resultados anterior, se usarán ceros para la comparación.")
    r2_xgb_5 = 0
    mse_xgb_5 = 0

results_data = {
    'Métrica': ['R2 Score', 'MSE'],
    'XGB (Campeón Anterior)': [r2_xgb_5, mse_xgb_5],
    'LSTM (Avanzado)': [r2_lstm_tuned, mse_lstm_tuned]
}
results_df = pd.DataFrame(results_data)
print(results_df.to_string(float_format="%.4f"))

results_df.to_csv(OUTPUT_FILE, index=False)
print(f"\nResultados guardados en: {OUTPUT_FILE}")

print("\n¡Proceso de optimización completo!")