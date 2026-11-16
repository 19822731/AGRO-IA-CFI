import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from statsmodels.tsa.arima.model import ARIMA
import warnings
import os

# --- 0. Configuración ---
warnings.filterwarnings('ignore', 'statsmodels.tsa.arima.model.ARIMA', UserWarning)
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# --- 1. Definición de Rutas y Parámetros (Igual que el campeón) ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'DATOS')
DATA_FILE = os.path.join(DATA_DIR, 'dataset_maestro_COMPLETO.csv')

BEST_PARAMS_30D = {
    'colsample_bytree': 1.0, 'gamma': 0.15, 'learning_rate': 0.015, 'max_depth': 2,
    'min_child_weight': 5, 'n_estimators': 400, 'subsample': 0.65
}
BEST_PARAMS_7D = {
    'subsample': 0.7, 'n_estimators': 400, 'min_child_weight': 4, 'max_depth': 2,
    'learning_rate': 0.015, 'gamma': 0.2, 'colsample_bytree': 0.8
}
VALIDATION_SET_SIZE = 0.2

# --- 2. Carga y Feature Engineering (Igual que el campeón) ---
print("Cargando y preparando datos...")
df_base = pd.read_csv(DATA_FILE, index_col=0, parse_dates=True)
df_base.index.name = 'Date'

# (Se omiten las funciones de indicadores por brevedad, se asume que están definidas como antes)
def calculate_rsi(series, window=14):
    delta = series.diff(); gain = (delta.where(delta > 0, 0)).rolling(window=window).mean(); loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean(); rs = gain / loss; return 100 - (100 / (1 + rs))
def calculate_macd(series, short_window=12, long_window=26, signal_window=9):
    ema_short = series.ewm(span=short_window, adjust=False).mean(); ema_long = series.ewm(span=long_window, adjust=False).mean(); macd_line = ema_short - ema_long; signal_line = macd_line.ewm(span=signal_window, adjust=False).mean(); return macd_line, macd_line - signal_line
def calculate_bollinger_bands(series, window=20, num_std=2):
    rolling_mean = series.rolling(window=window).mean(); rolling_std = series.rolling(window=window).std(); upper_band = rolling_mean + (rolling_std * num_std); lower_band = rolling_mean - (rolling_std * num_std); return upper_band, lower_band
def calculate_atr(high, low, close, window=14):
    tr = pd.concat([high - low, np.abs(high - close.shift()), np.abs(low - close.shift())], axis=1).max(axis=1); return tr.ewm(alpha=1/window, adjust=False).mean()

# Feature Engineering completo
df_base['sugar_11_ma_7d'] = df_base['sugar_11'].rolling(window=7).mean()
df_base['sugar_11_ma_30d'] = df_base['sugar_11'].rolling(window=30).mean()
df_base['sugar_11_ma_90d'] = df_base['sugar_11'].rolling(window=90).mean()
df_base['sugar_11_rsi_14d'] = calculate_rsi(df_base['sugar_11'])
df_base['sugar_11_lag_30d'] = df_base['sugar_11'].shift(30)
df_base['sugar_11_lag_60d'] = df_base['sugar_11'].shift(60)
df_base['sugar_11_lag_90d'] = df_base['sugar_11'].shift(90)
for lag in [30, 60, 90]:
    df_base[f'oil_wti_lag_{lag}d'] = df_base['oil_wti'].shift(lag)
    df_base[f'ethanol_cbot_lag_{lag}d'] = df_base['ethanol_cbot'].shift(lag)
df_base['mes'] = df_base.index.month
df_base['dia_de_la_semana'] = df_base.index.dayofweek
df_base['volatilidad_30d'] = df_base['sugar_11'].rolling(window=30).std()
df_base['macd'], df_base['macd_hist'] = calculate_macd(df_base['sugar_11'])
df_base['bollinger_upper'], df_base['bollinger_lower'] = calculate_bollinger_bands(df_base['sugar_11'])
df_base['atr'] = calculate_atr(df_base['sugar_11_high'], df_base['sugar_11_low'], df_base['sugar_11'])
df_base['spread_11_5'] = df_base['sugar_11'] - df_base['sugar_5']
df_base['spread_ma_30d'] = df_base['spread_11_5'].rolling(window=30).mean()
df_base['ratio_11_5'] = df_base['sugar_11'] / df_base['sugar_5']
df_base['spread_vol_30d'] = df_base['spread_11_5'].rolling(window=30).std()
for window in [30, 60, 90]:
    df_base[f'corr_11_5_{window}d'] = df_base['sugar_11'].rolling(window=window).corr(df_base['sugar_5'])
    df_base[f'corr_11_oil_{window}d'] = df_base['sugar_11'].rolling(window=window).corr(df_base['oil_wti'])
    df_base[f'corr_11_eth_{window}d'] = df_base['sugar_11'].rolling(window=window).corr(df_base['ethanol_cbot'])
df_base.replace([np.inf, -np.inf], np.nan, inplace=True)

# --- 3. Definición de Features y Función de Procesamiento ---
features_base = ['sugar_11_lag_30d', 'sugar_11_lag_60d', 'sugar_11_lag_90d', 'sugar_11_ma_7d', 'sugar_11_ma_30d', 'sugar_11_ma_90d', 'sugar_11_rsi_14d', 'oil_wti_lag_30d', 'oil_wti_lag_60d', 'oil_wti_lag_90d', 'ethanol_cbot_lag_30d', 'ethanol_cbot_lag_60d', 'ethanol_cbot_lag_90d', 'mes', 'dia_de_la_semana', 'volatilidad_30d']
features_sugar5 = ['sugar_5', 'spread_11_5', 'spread_ma_30d', 'ratio_11_5', 'spread_vol_30d', 'corr_11_5_30d', 'corr_11_5_60d', 'corr_11_5_90d']
features_corr_ext = [f'corr_11_oil_{w}d' for w in [30, 60, 90]] + [f'corr_11_eth_{w}d' for w in [30, 60, 90]]
features_macd_bollinger = ['macd', 'macd_hist', 'bollinger_upper', 'bollinger_lower']
features_list_30d = features_base + ['atr'] + features_sugar5 + features_corr_ext
features_list_7d = features_base + features_macd_bollinger + features_sugar5

def process_horizon_with_residual_modeling(df, features, horizon_days, params):
    print(f"\n--- Procesando horizonte de {horizon_days} días con modelado de residuos ---")
    target_col = f'target_11_{horizon_days}d'
    df[target_col] = df['sugar_11'].shift(-horizon_days)
    
    valid_features = [f for f in features if f in df.columns]
    df_clean = df.dropna(subset=valid_features + [target_col])
    
    X = df_clean[valid_features]
    y = df_clean[target_col]
    
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=VALIDATION_SET_SIZE, shuffle=False)
    
    # --- Etapa 1: Entrenar XGBoost y obtener residuos ---
    print("Etapa 1: Entrenando XGBoost y calculando residuos...")
    xgb_model = XGBRegressor(objective='reg:squarederror', random_state=42, **params)
    xgb_model.fit(X_train, y_train)
    predictions_val = xgb_model.predict(X_val)
    residuals_val = y_val - predictions_val
    error_std_xgb = residuals_val.std()
    print(f"  -> Error original de XGBoost (Std Dev): {error_std_xgb:.2f}")

    # --- Etapa 2: Encontrar el orden óptimo de ARIMA y entrenar ---
    print("Etapa 2: Buscando el orden óptimo para ARIMA...")
    
    best_aic, best_order = float("inf"), None
    p_values = range(0, 6)
    d_values = range(0, 2)
    q_values = range(0, 3)
    
    # Grid search para encontrar el mejor orden
    for p in p_values:
        for d in d_values:
            for q in q_values:
                order = (p,d,q)
                try:
                    model = ARIMA(residuals_val, order=order)
                    model_fit = model.fit()
                    if model_fit.aic < best_aic:
                        best_aic = model_fit.aic
                        best_order = order
                except:
                    continue
    
    print(f"  -> Mejor orden ARIMA encontrado: {best_order} con AIC: {best_aic:.2f}")
    
    print("   Entrenando modelo ARIMA con el orden óptimo...")
    arima_model = ARIMA(residuals_val, order=best_order)
    arima_model_fit = arima_model.fit()
    
    # Predecir los residuos para el conjunto de validación
    predicted_residuals = arima_model_fit.predict(start=residuals_val.index[0], end=residuals_val.index[-1])
    
    # --- Etapa 3: Evaluar el rendimiento del modelo combinado ---
    print("Etapa 3: Evaluando el rendimiento del modelo combinado...")
    final_predictions = predictions_val + predicted_residuals
    final_residuals = y_val - final_predictions
    error_std_combined = final_residuals.std()
    print(f"  -> Error del modelo combinado (Std Dev): {error_std_combined:.2f}")

    # --- Etapa 4: Predicción a futuro ---
    print("Etapa 4: Realizando predicción a futuro...")
    # Re-entrenar XGBoost con todos los datos
    xgb_model_full = XGBRegressor(objective='reg:squarederror', random_state=42, **params)
    xgb_model_full.fit(X, y)
    
    # Calcular residuos para todo el dataset para entrenar el ARIMA final
    full_predictions = xgb_model_full.predict(X)
    full_residuals = y - full_predictions
    
    # Re-entrenar ARIMA con todos los residuos usando el mejor orden encontrado
    arima_full_fit = ARIMA(full_residuals, order=best_order).fit()
    
    # Predecir con XGBoost
    latest_data = df.tail(1)[valid_features]
    future_prediction_xgb = xgb_model_full.predict(latest_data)[0]
    
    # Predecir el próximo residuo con ARIMA
    future_residual_pred = arima_full_fit.forecast(steps=1).iloc[0]
    
    # Combinar para la predicción final
    final_future_prediction = future_prediction_xgb + future_residual_pred
    
    return final_future_prediction, error_std_combined, error_std_xgb

# --- 4. Ejecución y Presentación ---
print("\n" + "="*60)
print("      RESULTADOS FINALES (XGBoost + Corrección de Residuos ARIMA)")
print("="*60)

last_date = df_base.index[-1].strftime('%Y-%m-%d')
last_price = df_base['sugar_11'].iloc[-1]

print(f"Fecha de los últimos datos utilizados: {last_date}")
print(f"Último precio conocido del Contrato #11: {last_price:.2f}\n")

# --- Horizonte Detallado a 7 Días ---
print("--- Horizonte Detallado a 7 Días ---")
daily_predictions_7d = []
for day in range(1, 8):
    pred, err_comb, _ = process_horizon_with_residual_modeling(df_base.copy(), features_list_7d, day, BEST_PARAMS_7D)
    if pred is not None:
        conf_lower = pred - 1.645 * err_comb
        conf_upper = pred + 1.645 * err_comb
        daily_predictions_7d.append({
            "Día": f"D+{day}",
            "Predicción": f"{pred:.2f}",
            "Intervalo (90%)": f"[{conf_lower:.2f} - {conf_upper:.2f}]"
        })

# Imprimir la tabla de 7 días
if daily_predictions_7d:
    df_7d = pd.DataFrame(daily_predictions_7d)
    print(df_7d.to_string(index=False))
else:
    print("No se pudieron generar las predicciones para 7 días.")

print("\n" + "-"*60 + "\n")

# --- Horizonte a 30 Días ---
print("--- Horizonte a 30 Días ---")
pred_30d, err_30d_comb, err_30d_xgb = process_horizon_with_residual_modeling(df_base.copy(), features_list_30d, 30, BEST_PARAMS_30D)
print(f"Error original (XGBoost): {err_30d_xgb:.2f}")
print(f"Error con corrección (XGBoost+ARIMA): {err_30d_comb:.2f}")
if pred_30d is not None:
    conf_lower = pred_30d - 1.645 * err_30d_comb
    conf_upper = pred_30d + 1.645 * err_30d_comb
    print(f"Predicción ajustada: {pred_30d:.2f}")
    print(f"  -> Intervalo de confianza (90%): [{conf_lower:.2f} - {conf_upper:.2f}]")

print("\n" + "="*60)
