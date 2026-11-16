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
from sklearn.preprocessing import MinMaxScaler
from statsmodels.tsa.arima.model import ARIMA

# --- 0. Configuración ---
warnings.filterwarnings('ignore', 'statsmodels.tsa.arima.model.ARIMA', UserWarning)
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
tf.get_logger().setLevel('ERROR')

# --- 1. Definición de Rutas y Parámetros ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'DATOS')
DATA_FILE = os.path.join(DATA_DIR, 'dataset_maestro_COMPLETO.csv')
TIME_STEPS = 60
VALIDATION_SET_SIZE = 0.2

# Hiperparámetros Óptimos para LSTM (Encontrados en Fase 1)
BEST_HPS_LSTM = {
    'units_lstm_1': 128,
    'dropout_1': 0.1,
    'units_dense': 128,
    'learning_rate': 0.0001
}

# --- 2. Carga y Feature Engineering ---
print(f"Cargando dataset maestro: {DATA_FILE}")
df_base = pd.read_csv(DATA_FILE, index_col=0, parse_dates=True)
df_base.index.name = 'Date'
print("Creando características para el Contrato #5...")

# (La ingeniería de características es la misma que en el script anterior)
for col in ['sugar_5', 'sugar_11', 'oil_wti', 'ethanol_cbot', 'fx_brl', 'fx_dxy']:
    if col in df_base.columns:
        for lag in [7, 15, 30, 60]: df_base[f'{col}_lag_{lag}d'] = df_base[col].shift(lag)
        for window in [7, 30, 90]: df_base[f'{col}_ma_{window}d'] = df_base[col].rolling(window=window).mean()
        delta = df_base[col].diff(); gain = (delta.where(delta > 0, 0)).rolling(window=14).mean(); loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean(); rs = gain / loss
        df_base[f'{col}_rsi_14d'] = 100 - (100 / (1 + rs)); df_base[f'{col}_volatilidad_30d'] = df_base[col].rolling(window=30).std()
df_base['mes'] = df_base.index.month; df_base['dia_de_la_semana'] = df_base.index.dayofweek
df_base.replace([np.inf, -np.inf], np.nan, inplace=True)

# --- 3. Función de Procesamiento Principal (LSTM + ARIMA) ---
def process_horizon_with_lstm_arima(df, horizon_days, best_hps):
    print(f"\n--- Procesando LSTM+ARIMA para horizonte de {horizon_days} días ---")
    
    # 1. Preparar datos (igual que antes)
    target_col = f'target_5_{horizon_days}d'
    df[target_col] = df['sugar_5'].shift(-horizon_days)
    features = [col for col in df.columns if 'target' not in col]
    df_clean = df.dropna(subset=features + [target_col])
    X = df_clean[features]; y = df_clean[[target_col]]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=VALIDATION_SET_SIZE, shuffle=False)
    scaler_X = MinMaxScaler(); X_train_scaled = scaler_X.fit_transform(X_train); X_test_scaled = scaler_X.transform(X_test)
    scaler_y = MinMaxScaler(); y_train_scaled = scaler_y.fit_transform(y_train); y_test_scaled = scaler_y.transform(y_test)
    
    def create_sequences(X, y, time_steps=TIME_STEPS):
        Xs, ys = [], []
        for i in range(len(X) - time_steps):
            Xs.append(X[i:(i + time_steps)])
            ys.append(y[i + time_steps])
        return np.array(Xs), np.array(ys)

    X_train_seq, y_train_seq = create_sequences(X_train_scaled, y_train_scaled)
    X_test_seq, y_test_seq = create_sequences(X_test_scaled, y_test_scaled)
    
    if X_train_seq.shape[0] == 0: return None, None, None

    # 2. Entrenar LSTM y obtener residuos
    print("  Etapa 1: Entrenando LSTM y calculando residuos...")
    model_lstm = Sequential([
        LSTM(units=best_hps['units_lstm_1'], return_sequences=False, input_shape=(X_train_seq.shape[1], X_train_seq.shape[2])),
        Dropout(best_hps['dropout_1']),
        Dense(units=best_hps['units_dense'], activation='relu'),
        Dense(1)
    ])
    model_lstm.compile(optimizer=Adam(learning_rate=best_hps['learning_rate']), loss='mean_squared_error')
    model_lstm.fit(X_train_seq, y_train_seq, epochs=100, batch_size=32, validation_data=(X_test_seq, y_test_seq), callbacks=[EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)], verbose=0)
    
    predictions_val_scaled = model_lstm.predict(X_test_seq, verbose=0)
    predictions_val = scaler_y.inverse_transform(predictions_val_scaled)
    y_test_orig = scaler_y.inverse_transform(y_test_seq)
    
    residuals_val = (y_test_orig - predictions_val).flatten()
    residuals_val_series = pd.Series(residuals_val, index=y_test.index[TIME_STEPS:])
    error_std_lstm = np.std(residuals_val)
    print(f"    -> Error original de LSTM (Std Dev): {error_std_lstm:.2f}")

    # 3. Encontrar el orden óptimo de ARIMA y entrenar
    print("  Etapa 2: Buscando el orden óptimo para ARIMA...")
    best_aic, best_order = float("inf"), None
    for p in range(4):
        for d in range(2):
            for q in range(3):
                try:
                    model = ARIMA(residuals_val_series, order=(p,d,q)); model_fit = model.fit()
                    if model_fit.aic < best_aic: best_aic = model_fit.aic; best_order = (p,d,q)
                except: continue
    print(f"    -> Mejor orden ARIMA encontrado: {best_order}")
    
    arima_model_fit = ARIMA(residuals_val_series, order=best_order).fit()
    predicted_residuals = arima_model_fit.predict(start=residuals_val_series.index[0], end=residuals_val_series.index[-1])
    
    # 4. Evaluar el modelo combinado
    final_predictions = predictions_val.flatten() + predicted_residuals
    final_residuals = y_test_orig.flatten() - final_predictions
    error_std_combined = np.std(final_residuals)
    print(f"    -> Error del modelo combinado (Std Dev): {error_std_combined:.2f}")

    # 5. Predicción a futuro
    # Re-entrenar LSTM con todos los datos
    X_full_seq, y_full_seq = create_sequences(np.concatenate([X_train_scaled, X_test_scaled]), np.concatenate([y_train_scaled, y_test_scaled]))
    model_lstm.fit(X_full_seq, y_full_seq, epochs=50, batch_size=32, verbose=0) # Re-entrenamiento más corto
    
    # Calcular residuos para todo el dataset
    full_preds_scaled = model_lstm.predict(X_full_seq, verbose=0)
    full_preds = scaler_y.inverse_transform(full_preds_scaled)
    y_full_orig = scaler_y.inverse_transform(y_full_seq)
    full_residuals = pd.Series((y_full_orig - full_preds).flatten())

    # Re-entrenar ARIMA con todos los residuos
    arima_full_fit = ARIMA(full_residuals, order=best_order).fit()
    
    # Predecir con LSTM
    last_sequence = np.concatenate([X_train_scaled, X_test_scaled])[-TIME_STEPS:].reshape(1, TIME_STEPS, X_train_scaled.shape[1])
    future_pred_lstm_scaled = model_lstm.predict(last_sequence, verbose=0)
    future_pred_lstm = scaler_y.inverse_transform(future_pred_lstm_scaled)[0][0]
    
    # Predecir el residuo
    future_residual_pred = arima_full_fit.forecast(steps=1).iloc[0]
    
    final_future_prediction = future_pred_lstm + future_residual_pred
    
    return final_future_prediction, error_std_combined, error_std_lstm

# --- 4. Ejecución y Presentación ---
print("\n" + "="*60)
print("      RESULTADOS FINALES (LSTM+ARIMA Óptimo para Contrato #5)")
print("="*60)
last_date = df_base.index[-1].strftime('%Y-%m-%d'); last_price = df_base['sugar_5'].iloc[-1]
print(f"Fecha de los últimos datos utilizados: {last_date}\nÚltimo precio conocido del Contrato #5: {last_price:.2f}\n")

# --- Horizonte Detallado a 7 Días ---
print("--- Horizonte Detallado a 7 Días (LSTM+ARIMA) ---")
daily_preds = []
for day in range(1, 8):
    pred, err_comb, err_lstm = process_horizon_with_lstm_arima(df_base.copy(), day, BEST_HPS_LSTM)
    if pred is not None:
        conf_lower = pred - 1.645 * err_comb; conf_upper = pred + 1.645 * err_comb
        daily_preds.append({"Día": f"D+{day}", "Predicción": f"{pred:.2f}", "Intervalo (90%)": f"[{conf_lower:.2f} - {conf_upper:.2f}]", "Error LSTM": f"{err_lstm:.2f}", "Error Híbrido": f"{err_comb:.2f}"})
if daily_preds:
    print(pd.DataFrame(daily_preds).to_string(index=False))
else:
    print("No se pudieron generar las predicciones para 7 días.")

print("\n" + "-"*60 + "\n")

# --- Horizonte a 30 Días ---
print("--- Horizonte a 30 Días (LSTM+ARIMA) ---")
pred_30d, err_30d_comb, err_30d_lstm = process_horizon_with_lstm_arima(df_base.copy(), 30, BEST_HPS_LSTM)
if pred_30d is not None:
    conf_lower = pred_30d - 1.645 * err_30d_comb; conf_upper = pred_30d + 1.645 * err_30d_comb
    print(f"Error original (LSTM): {err_30d_lstm:.2f}"); print(f"Error con corrección (LSTM+ARIMA): {err_30d_comb:.2f}")
    print(f"Predicción ajustada: {pred_30d:.2f}"); print(f"  -> Intervalo de confianza (90%): [{conf_lower:.2f} - {conf_upper:.2f}]")

print("\n" + "="*60)
