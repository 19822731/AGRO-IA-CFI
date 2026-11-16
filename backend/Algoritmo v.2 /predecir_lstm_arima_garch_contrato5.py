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
from arch import arch_model
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tools.sm_exceptions import ConvergenceWarning
from datetime import datetime
import csv
import ast

# --- 0. Configuración ---
warnings.filterwarnings('ignore', category=ConvergenceWarning)
warnings.filterwarnings('ignore', 'statsmodels.tsa.arima.model.ARIMA', UserWarning)
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
tf.get_logger().setLevel('ERROR')

# --- 1. Definición de Rutas y Parámetros ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'DATOS')
DATA_FILE = os.path.join(DATA_DIR, 'dataset_maestro_COMPLETO.csv')
HISTORIAL_FILE = os.path.join(BASE_DIR, 'historial_rendimiento_lstm_arima_garch.csv')
TIME_STEPS = 60
VALIDATION_SET_SIZE = 0.2

# Hiperparámetros Óptimos para LSTM (Encontrados en Fase 1)
BEST_HPS_LSTM = {
    'units_lstm_1': 128, 'dropout_1': 0.1, 'units_dense': 128, 'learning_rate': 0.0001
}

# --- 2. Funciones del Ciclo de Aprendizaje ---

def caracterizar_datos(df):
    """Calcula un perfil de características básicas de la serie de datos de entrada."""
    print("\n--- Caracterizando datos de entrada ---")
    try:
        serie = df['sugar_5']
        profile = {'data_mean': serie.mean(), 'data_std_dev': serie.std()}
        if len(serie) > 365 * 2:
            decomposition = seasonal_decompose(serie.asfreq('D').interpolate(), model='additive', period=365)
            residuals_var = np.var(decomposition.resid.dropna())
            data_var = np.var(serie)
            profile['data_seasonality_strength'] = max(0, 1 - (residuals_var / data_var)) if data_var > 0 else 0
        else:
            profile['data_seasonality_strength'] = None
        print(f"Perfil de datos: {profile}")
        return profile
    except Exception as e:
        print(f"ADVERTENCIA: No se pudo completar la caracterización de datos: {e}")
        return {'data_mean': None, 'data_std_dev': None, 'data_seasonality_strength': None}

def get_elite_suggestions_arima(history_file, top_n=3):
    """Lee el historial y devuelve las N mejores configuraciones de parámetros ARIMA."""
    print(f"\n--- Analizando 'memoria' de entrenamientos ARIMA desde: {history_file} ---")
    if not os.path.exists(history_file):
        print("No se encontró historial. Se procederá con una búsqueda libre.")
        return []
    try:
        with open(history_file, 'r') as csvfile:
            reader = csv.DictReader(csvfile)
            valid_runs = [row for row in reader if row.get('arima_order')]
            valid_runs.sort(key=lambda x: float(x['final_error_garch']))
        
        suggestions = [ast.literal_eval(run['arima_order']) for run in valid_runs[:top_n]]
        # Eliminar duplicados
        unique_suggestions = [dict(t) for t in {tuple(d.items()) for d in suggestions}]
        print(f"Se han extraído {len(unique_suggestions)} sugerencia(s) de élite para ARIMA.")
        return unique_suggestions
    except Exception as e:
        print(f"ERROR al leer o procesar el historial de sugerencias: {e}")
        return []

def registrar_resultado(timestamp, horizon, results, data_profile):
    """Registra los resultados de la ejecución en el historial CSV."""
    print(f"\n--- Registrando resultados para horizonte D+{horizon} en la 'memoria' ---")
    file_exists = os.path.isfile(HISTORIAL_FILE)
    try:
        # Combinar los resultados del modelo con el perfil de los datos
        row_data = results.copy()
        row_data.update(data_profile)
        row_data['timestamp'] = timestamp.strftime('%Y-%m-%d %H:%M:%S')
        row_data['horizon'] = horizon
        
        # Definir los encabezados dinámicamente
        fieldnames = ['timestamp', 'horizon'] + list(results.keys()) + list(data_profile.keys())
        
        with open(HISTORIAL_FILE, 'a', newline='') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames, extrasaction='ignore')
            if not file_exists:
                writer.writeheader()
            writer.writerow(row_data)
        print("Resultados registrados con éxito.")
    except Exception as e:
        print(f"ERROR al registrar los resultados en la memoria: {e}")

# --- 3. Función de Procesamiento Principal (Modificada) ---
def process_horizon_with_lstm_arima_garch(df, horizon_days, best_hps_lstm, elite_suggestions=None):
    print(f"\n--- Procesando LSTM+ARIMA+GARCH para horizonte de {horizon_days} días ---")
    
    # 1. Preparar datos (igual que antes)
    target_col = f'target_5_{horizon_days}d'; df[target_col] = df['sugar_5'].shift(-horizon_days)
    features = [col for col in df.columns if 'target' not in col]; df_clean = df.dropna(subset=features + [target_col])
    X = df_clean[features]; y = df_clean[[target_col]]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=VALIDATION_SET_SIZE, shuffle=False)
    scaler_X = MinMaxScaler(); X_train_scaled = scaler_X.fit_transform(X_train); X_test_scaled = scaler_X.transform(X_test)
    scaler_y = MinMaxScaler(); y_train_scaled = scaler_y.fit_transform(y_train); y_test_scaled = scaler_y.transform(y_test)
    
    def create_sequences(X, y, time_steps=TIME_STEPS):
        Xs, ys = [], []; [Xs.append(X[i:(i + time_steps)]) for i in range(len(X) - time_steps)]; [ys.append(y[i + time_steps]) for i in range(len(X) - time_steps)]
        return np.array(Xs), np.array(ys)

    X_train_seq, y_train_seq = create_sequences(X_train_scaled, y_train_scaled)
    X_test_seq, y_test_seq = create_sequences(X_test_scaled, y_test_scaled)
    
    if X_train_seq.shape[0] == 0: return None

    # 2. Etapa 1: Entrenar LSTM y obtener residuos
    print("  Etapa 1: Entrenando LSTM..."); model_lstm = Sequential([LSTM(units=best_hps_lstm['units_lstm_1'], return_sequences=False, input_shape=(X_train_seq.shape[1], X_train_seq.shape[2])), Dropout(best_hps_lstm['dropout_1']), Dense(units=best_hps_lstm['units_dense'], activation='relu'), Dense(1)])
    model_lstm.compile(optimizer=Adam(learning_rate=best_hps_lstm['learning_rate']), loss='mean_squared_error')
    model_lstm.fit(X_train_seq, y_train_seq, epochs=100, batch_size=32, validation_data=(X_test_seq, y_test_seq), callbacks=[EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)], verbose=0)
    predictions_val_scaled = model_lstm.predict(X_test_seq, verbose=0); predictions_val = scaler_y.inverse_transform(predictions_val_scaled)
    y_test_orig = scaler_y.inverse_transform(y_test_seq); residuals_val_lstm = (y_test_orig - predictions_val).flatten()
    residuals_val_lstm_series = pd.Series(residuals_val_lstm, index=y_test.index[TIME_STEPS:]); error_std_lstm = np.std(residuals_val_lstm)
    print(f"    -> Error original de LSTM (Std Dev): {error_std_lstm:.2f}")

    # 3. Etapa 2: Búsqueda Inteligente de ARIMA (Explotación + Exploración)
    print("  Etapa 2: Búsqueda Inteligente de ARIMA sobre residuos..."); best_aic, best_order = float("inf"), None
    
    # Fase de Explotación: Probar sugerencias de élite
    if elite_suggestions:
        print("    -> Fase de Explotación: Probando sugerencias de élite...")
        for order_sugg in elite_suggestions:
            try:
                model = ARIMA(residuals_val_lstm_series, order=tuple(order_sugg)); model_fit = model.fit()
                if model_fit.aic < best_aic: best_aic = model_fit.aic; best_order = order_sugg
            except: continue
        if best_order: print(f"    -> Mejor sugerencia de élite: {best_order} con AIC: {best_aic:.2f}")

    # Fase de Exploración: Búsqueda en cuadrícula
    print("    -> Fase de Exploración: Realizando búsqueda en cuadrícula...")
    for p in range(4):
        for d in range(2):
            for q in range(3):
                try:
                    model = ARIMA(residuals_val_lstm_series, order=(p,d,q)); model_fit = model.fit()
                    if model_fit.aic < best_aic: best_aic = model_fit.aic; best_order = (p,d,q)
                except: continue
    print(f"    -> Mejor orden ARIMA encontrado (global): {best_order}")
    
    arima_model_fit = ARIMA(residuals_val_lstm_series, order=best_order).fit()
    predicted_residuals_arima = arima_model_fit.predict(start=residuals_val_lstm_series.index[0], end=residuals_val_lstm_series.index[-1])
    
    # 4. Etapa 3: Entrenar GARCH
    print("  Etapa 3: Entrenando GARCH..."); final_residuals = (residuals_val_lstm_series - predicted_residuals_arima) * 100
    garch_fit = arch_model(final_residuals.dropna(), p=1, q=1, vol='Garch', dist='normal').fit(disp='off')
    forecast_garch = garch_fit.forecast(horizon=1); predicted_volatility = np.sqrt(forecast_garch.variance.iloc[-1, 0]) / 100
    error_std_garch = predicted_volatility; print(f"    -> Volatilidad final (GARCH): {error_std_garch:.2f}")

    # 5. Predicción a futuro (re-entrenando con todos los datos)
    X_full_seq, y_full_seq = create_sequences(np.concatenate([X_train_scaled, X_test_scaled]), np.concatenate([y_train_scaled, y_test_scaled]))
    model_lstm.fit(X_full_seq, y_full_seq, epochs=50, batch_size=32, verbose=0)
    full_preds_scaled = model_lstm.predict(X_full_seq, verbose=0); full_preds = scaler_y.inverse_transform(full_preds_scaled)
    y_full_orig = scaler_y.inverse_transform(y_full_seq); full_residuals_lstm = pd.Series((y_full_orig - full_preds).flatten())
    arima_full_fit = ARIMA(full_residuals_lstm, order=best_order).fit()
    final_full_residuals = (full_residuals_lstm - arima_full_fit.predict(start=full_residuals_lstm.index[0], end=full_residuals_lstm.index[-1])) * 100
    garch_full_fit = arch_model(final_full_residuals.dropna(), p=1, q=1).fit(disp='off')
    last_sequence = np.concatenate([X_train_scaled, X_test_scaled])[-TIME_STEPS:].reshape(1, TIME_STEPS, X_train_scaled.shape[1])
    future_pred_lstm = scaler_y.inverse_transform(model_lstm.predict(last_sequence, verbose=0))[0][0]
    future_residual_pred_arima = arima_full_fit.forecast(steps=1).iloc[0]
    future_error_std = np.sqrt(garch_full_fit.forecast(horizon=1).variance.iloc[-1, 0]) / 100
    final_future_prediction = future_pred_lstm + future_residual_pred_arima
    
    return {'prediction': final_future_prediction, 'final_error_garch': future_error_std, 'initial_error_lstm': error_std_lstm, 'arima_order': best_order}

# --- 4. Ejecución y Presentación ---
if __name__ == "__main__":
    print("\n" + "="*70)
    print("  SISTEMA DE PREDICCIÓN CON APRENDIZAJE (LSTM+ARIMA+GARCH para Cto #5)")
    print("="*70)
    
    # Carga de datos y caracterización una sola vez
    df_base = pd.read_csv(DATA_FILE, index_col=0, parse_dates=True); df_base.index.name = 'Date'
    for col in ['sugar_5', 'sugar_11', 'oil_wti', 'ethanol_cbot', 'fx_brl', 'fx_dxy']:
        if col in df_base.columns:
            for lag in [7, 15, 30, 60]: df_base[f'{col}_lag_{lag}d'] = df_base[col].shift(lag)
            for window in [7, 30, 90]: df_base[f'{col}_ma_{window}d'] = df_base[col].rolling(window=window).mean()
            delta = df_base[col].diff(); gain = (delta.where(delta > 0, 0)).rolling(window=14).mean(); loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean(); rs = gain / loss
            df_base[f'{col}_rsi_14d'] = 100 - (100 / (1 + rs)); df_base[f'{col}_volatilidad_30d'] = df_base[col].rolling(window=30).std()
    df_base['mes'] = df_base.index.month; df_base['dia_de_la_semana'] = df_base.index.dayofweek
    df_base.replace([np.inf, -np.inf], np.nan, inplace=True)
    
    data_profile = caracterizar_datos(df_base)
    
    # Obtener sugerencias de la memoria
    elite_suggestions = get_elite_suggestions_arima(HISTORIAL_FILE)
    
    last_date = df_base.index[-1].strftime('%Y-%m-%d'); last_price = df_base['sugar_5'].iloc[-1]
    print(f"\nFecha de los últimos datos utilizados: {last_date}\nÚltimo precio conocido del Contrato #5: {last_price:.2f}\n")

    # --- Bucle de Predicción y Registro ---
    horizons_to_predict = list(range(1, 8)) + [30]
    all_results = []

    for horizon in horizons_to_predict:
        current_timestamp = datetime.now()
        results = process_horizon_with_lstm_arima_garch(df_base.copy(), horizon, BEST_HPS_LSTM, elite_suggestions)
        
        if results:
            pred = results['prediction']
            err_comb = results['final_error_garch']
            conf_lower = pred - 1.645 * err_comb
            conf_upper = pred + 1.645 * err_comb
            
            print_result = {"Día": f"D+{horizon}", "Predicción": f"{pred:.2f}", "Intervalo (90%)": f"[{conf_lower:.2f} - {conf_upper:.2f}]", "Volatilidad GARCH": f"{err_comb:.2f}"}
            all_results.append(print_result)
            
            # Registrar el resultado en la memoria
            registrar_resultado(current_timestamp, horizon, results, data_profile)
        else:
            print(f"No se pudo generar la predicción para el horizonte D+{horizon}.")

    # --- Presentación Final ---
    if all_results:
        df_results = pd.DataFrame(all_results)
        print("\n" + "="*60)
        print("  RESULTADOS FINALES DE PREDICCIÓN")
        print("="*60)
        print(df_results.to_string(index=False))
    
    print("\n¡Proceso de predicción con aprendizaje completado!")
