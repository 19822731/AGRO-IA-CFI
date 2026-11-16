import os
import warnings
import numpy as np
import pandas as pd
from datetime import datetime

# ML & Deep Learning
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
from xgboost import XGBRegressor
from sklearn.ensemble import RandomForestRegressor
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.optimizers import Adam
from statsmodels.tsa.arima.model import ARIMA
from arch import arch_model

# Configuraciones
warnings.filterwarnings('ignore')
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
tf.get_logger().setLevel('ERROR')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'Datos', 'dataset_maestro_COMPLETO.csv')
OUTPUT_METRICS = os.path.join(BASE_DIR, 'resultados_benchmark_actualizado_2026.csv')
OUTPUT_PREDS = os.path.join(BASE_DIR, 'pronosticos_contrato5_y_11_hoy.csv')

print("="*75)
print("  PIPELINE DE REENTRENAMIENTO Y PREDICCIÓN ACTUALIZADA (Agro-IA 2026)")
print("="*75)

# --- 1. Funciones de Indicadores Técnicos ---
def calculate_rsi(series, window=14):
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def calculate_stochastic(close, high, low, window=14, smooth_k=3):
    low_min = low.rolling(window=window).min()
    high_max = high.rolling(window=window).max()
    k = 100 * ((close - low_min) / (high_max - low_min + 1e-8))
    d = k.rolling(window=smooth_k).mean()
    return k, d

def calculate_atr(high, low, close, window=14):
    hl = high - low
    hc = np.abs(high - close.shift())
    lc = np.abs(low - close.shift())
    tr = pd.DataFrame({'hl': hl, 'hc': hc, 'lc': lc}).max(axis=1)
    return tr.rolling(window=window).mean()

def calculate_ichimoku(high, low, close):
    nine_high = high.rolling(window=9).max(); nine_low = low.rolling(window=9).min()
    tenkan = (nine_high + nine_low) / 2
    tf_high = high.rolling(window=26).max(); tf_low = low.rolling(window=26).min()
    kijun = (tf_high + tf_low) / 2
    senkou_a = ((tenkan + kijun) / 2).shift(26)
    ft_high = high.rolling(window=52).max(); ft_low = low.rolling(window=52).min()
    senkou_b = ((ft_high + ft_low) / 2).shift(26)
    chikou = close.shift(-26)
    return tenkan, kijun, senkou_a, senkou_b, chikou

# --- 2. Carga y Feature Engineering ---
print(f"\n📂 Cargando dataset maestro: {DATA_FILE}")
df_base = pd.read_csv(DATA_FILE, index_col=0, parse_dates=True)
df_base.index.name = 'Date'
print(f"Total filas cargadas: {len(df_base)}. Rango: {df_base.index.min().strftime('%Y-%m-%d')} a {df_base.index.max().strftime('%Y-%m-%d')}")

# Crear Features Contrato #11
df_base['sugar_11_ma_7d'] = df_base['sugar_11'].rolling(window=7).mean()
df_base['sugar_11_ma_30d'] = df_base['sugar_11'].rolling(window=30).mean()
df_base['sugar_11_ma_90d'] = df_base['sugar_11'].rolling(window=90).mean()
df_base['sugar_11_rsi_14d'] = calculate_rsi(df_base['sugar_11'])
for lag in [7, 15, 30, 60, 90]: df_base[f'sugar_11_lag_{lag}d'] = df_base['sugar_11'].shift(lag)
df_base['k_percent_11'], df_base['d_percent_11'] = calculate_stochastic(df_base['sugar_11'], df_base['sugar_11_high'], df_base['sugar_11_low'])
df_base['atr_11'] = calculate_atr(df_base['sugar_11_high'], df_base['sugar_11_low'], df_base['sugar_11'])
df_base['tenkan_11'], df_base['kijun_11'], df_base['senkou_a_11'], df_base['senkou_b_11'], df_base['chikou_11'] = calculate_ichimoku(df_base['sugar_11_high'], df_base['sugar_11_low'], df_base['sugar_11'])

# Crear Features Contrato #5
df_base['sugar_5_ma_7d'] = df_base['sugar_5'].rolling(window=7).mean()
df_base['sugar_5_ma_30d'] = df_base['sugar_5'].rolling(window=30).mean()
df_base['sugar_5_ma_90d'] = df_base['sugar_5'].rolling(window=90).mean()
df_base['sugar_5_rsi_14d'] = calculate_rsi(df_base['sugar_5'])
for lag in [7, 15, 30, 60, 90]: df_base[f'sugar_5_lag_{lag}d'] = df_base['sugar_5'].shift(lag)
df_base['sugar_5_volatilidad_30d'] = df_base['sugar_5'].rolling(window=30).std()

# Exógenas
for lag in [15, 30, 60]:
    if 'oil_wti' in df_base.columns: df_base[f'oil_wti_lag_{lag}d'] = df_base['oil_wti'].shift(lag)
    if 'ethanol_cbot' in df_base.columns: df_base[f'ethanol_cbot_lag_{lag}d'] = df_base['ethanol_cbot'].shift(lag)
    if 'fx_dxy' in df_base.columns: df_base[f'fx_dxy_lag_{lag}d'] = df_base['fx_dxy'].shift(lag)
    if 'white_sugar_premium' in df_base.columns: df_base[f'wsp_lag_{lag}d'] = df_base['white_sugar_premium'].shift(lag)

df_base['mes'] = df_base.index.month
df_base['dia_semana'] = df_base.index.dayofweek
df_base.replace([np.inf, -np.inf], np.nan, inplace=True)

last_date = df_base.index[-1].strftime('%Y-%m-%d')
last_price_11 = df_base['sugar_11'].iloc[-1]
last_price_5 = df_base['sugar_5'].iloc[-1]

# ==============================================================================
# --- 3. REENTRENAMIENTO CONTRATO Nº 11 (XGBoost) ---
# ==============================================================================
print("\n" + "-"*75)
print("  REENTRENAMIENTO: CONTRATO Nº 11 (XGBoost)")
print("-"*75)

features_11 = [
    'sugar_11_lag_30d', 'sugar_11_lag_60d', 'sugar_11_lag_90d',
    'sugar_11_ma_7d', 'sugar_11_ma_30d', 'sugar_11_ma_90d',
    'sugar_11_rsi_14d', 'k_percent_11', 'd_percent_11', 'atr_11',
    'oil_wti_lag_30d', 'oil_wti_lag_60d',
    'ethanol_cbot_lag_30d', 'ethanol_cbot_lag_60d',
    'tenkan_11', 'kijun_11', 'senkou_a_11', 'senkou_b_11', 'mes'
]
features_11 = [f for f in features_11 if f in df_base.columns]

df_11 = df_base.copy()
df_11['target_11_30d'] = df_11['sugar_11'].shift(-30)
df_11_clean = df_11.dropna(subset=features_11 + ['target_11_30d'])

X_11 = df_11_clean[features_11]
y_11 = df_11_clean['target_11_30d']

X_train_11, X_test_11, y_train_11, y_test_11 = train_test_split(X_11, y_11, test_size=0.2, shuffle=False)

# Entrenar XGBoost con hiperparámetros optimizados
xgb_11 = XGBRegressor(
    n_estimators=300,
    max_depth=3,
    learning_rate=0.015,
    subsample=0.7,
    gamma=0.2,
    min_child_weight=5,
    colsample_bytree=1.0,
    objective='reg:squarederror',
    random_state=42
)
xgb_11.fit(X_train_11, y_train_11)

preds_test_11 = xgb_11.predict(X_test_11)
r2_11 = r2_score(y_test_11, preds_test_11)
rmse_11 = np.sqrt(mean_squared_error(y_test_11, preds_test_11))
mae_11 = mean_absolute_error(y_test_11, preds_test_11)

print(f"  Métricas Test Contrato #11 (Horizonte 30 días):")
print(f"    -> R² Score: {r2_11:.4f}")
print(f"    -> RMSE:     {rmse_11:.2f} c/lb")
print(f"    -> MAE:      {mae_11:.2f} c/lb")

# Predicción a 30 días para hoy
latest_x_11 = df_base[features_11].iloc[-1:]
pred_11_30d = float(xgb_11.predict(latest_x_11)[0])
delta_11 = ((pred_11_30d - last_price_11) / last_price_11) * 100
print(f"\n  🎯 Pronóstico Contrato #11 a 30 días:")
print(f"    Precio Actual:     ${last_price_11:.2f} c/lb")
print(f"    Precio Proyectado: ${pred_11_30d:.2f} c/lb ({delta_11:+.2f}%)")

# ==============================================================================
# --- 4. REENTRENAMIENTO CONTRATO Nº 5 (LSTM + ARIMA + GARCH) ---
# ==============================================================================
print("\n" + "-"*75)
print("  REENTRENAMIENTO: CONTRATO Nº 5 (LSTM + ARIMA + GARCH)")
print("-"*75)

TIME_STEPS = 60
features_5 = [col for col in df_base.columns if col not in ['Date', 'target_11_30d'] and not col.startswith('target')]

def train_eval_lstm_arima_garch(horizon):
    print(f"  Procesando horizonte D+{horizon}...")
    df_h = df_base.copy()
    target_col = f'target_5_{horizon}d'
    df_h[target_col] = df_h['sugar_5'].shift(-horizon)
    df_clean = df_h.dropna(subset=features_5 + [target_col])
    
    X = df_clean[features_5]
    y = df_clean[[target_col]]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
    
    scaler_X = MinMaxScaler(); X_train_s = scaler_X.fit_transform(X_train); X_test_s = scaler_X.transform(X_test)
    scaler_y = MinMaxScaler(); y_train_s = scaler_y.fit_transform(y_train); y_test_s = scaler_y.transform(y_test)
    
    def to_seq(X_s, y_s):
        xs, ys = [], []
        for i in range(len(X_s) - TIME_STEPS):
            xs.append(X_s[i:i+TIME_STEPS])
            ys.append(y_s[i+TIME_STEPS])
        return np.array(xs), np.array(ys)
        
    X_tr_seq, y_tr_seq = to_seq(X_train_s, y_train_s)
    X_te_seq, y_te_seq = to_seq(X_test_s, y_test_s)
    
    # 1. LSTM
    model = Sequential([
        LSTM(64, return_sequences=False, input_shape=(X_tr_seq.shape[1], X_tr_seq.shape[2])),
        Dropout(0.1),
        Dense(64, activation='relu'),
        Dense(1)
    ])
    model.compile(optimizer=Adam(learning_rate=0.001), loss='mse')
    model.fit(X_tr_seq, y_tr_seq, epochs=40, batch_size=32, validation_split=0.1,
              callbacks=[EarlyStopping(monitor='val_loss', patience=6, restore_best_weights=True)], verbose=0)
              
    pred_te_s = model.predict(X_te_seq, verbose=0)
    pred_te = scaler_y.inverse_transform(pred_te_s).flatten()
    y_te_orig = scaler_y.inverse_transform(y_te_seq).flatten()
    
    residuals = y_te_orig - pred_te
    err_lstm = np.std(residuals)
    
    # 2. ARIMA sobre residuos
    res_series = pd.Series(residuals)
    try:
        arima_fit = ARIMA(res_series, order=(1, 0, 1)).fit()
        pred_res_arima = arima_fit.predict(start=0, end=len(residuals)-1)
    except:
        arima_fit = ARIMA(res_series, order=(1, 0, 0)).fit()
        pred_res_arima = arima_fit.predict(start=0, end=len(residuals)-1)
        
    final_res = residuals - pred_res_arima
    
    # 3. GARCH sobre residuos finales
    try:
        garch_fit = arch_model(final_res.dropna() * 10, p=1, q=1, vol='Garch', dist='normal').fit(disp='off')
        vol_garch = np.sqrt(garch_fit.forecast(horizon=1).variance.iloc[-1, 0]) / 10
    except:
        vol_garch = np.std(final_res)
        
    # Predicción futura
    last_seq = np.concatenate([X_train_s, X_test_s])[-TIME_STEPS:].reshape(1, TIME_STEPS, X_train_s.shape[1])
    future_lstm_s = model.predict(last_seq, verbose=0)
    future_lstm = scaler_y.inverse_transform(future_lstm_s)[0][0]
    future_arima_res = arima_fit.forecast(steps=1).iloc[0]
    
    final_pred = future_lstm + future_arima_res
    conf_low = final_pred - 1.645 * vol_garch
    conf_high = final_pred + 1.645 * vol_garch
    
    r2_final = r2_score(y_te_orig, pred_te + pred_res_arima)
    
    return {
        'horizon': f'D+{horizon}',
        'pred': final_pred,
        'conf_low': conf_low,
        'conf_high': conf_high,
        'vol_garch': vol_garch,
        'r2': r2_final
    }

# Ejecutar horizontes
horizons = [1, 2, 3, 5, 7, 30]
results_cto5 = []
for h in horizons:
    res = train_eval_lstm_arima_garch(h)
    results_cto5.append(res)

df_res_5 = pd.DataFrame(results_cto5)

print("\n" + "="*75)
print("  TABLA DE PRONÓSTICOS ACTUALIZADOS (Contrato Nº 5 Londres - USD/Ton)")
print("="*75)
print(f"Fecha Base de Datos: {last_date}")
print(f"Último Precio Contrato #5: ${last_price_5:.2f} USD/ton\n")

table_view = []
for _, r in df_res_5.iterrows():
    delta = ((r['pred'] - last_price_5) / last_price_5) * 100
    table_view.append({
        'Horizonte': r['horizon'],
        'Precio Proyectado': f"${r['pred']:.2f}",
        'Variación %': f"{delta:+.2f}%",
        'Banda 90% (GARCH)': f"[${r['conf_low']:.2f} - ${r['conf_high']:.2f}]",
        'R² Score': f"{r['r2']:.4f}"
    })
print(pd.DataFrame(table_view).to_string(index=False))

# Guardar Resultados
df_res_5.to_csv(OUTPUT_PREDS, index=False)

summary_metrics = pd.DataFrame([
    {'Modelo': 'XGBoost Contrato #11 (30d)', 'R2': r2_11, 'RMSE': rmse_11, 'MAE': mae_11, 'Prediccion': pred_11_30d},
    {'Modelo': 'LSTM+ARIMA+GARCH Contrato #5 (7d)', 'R2': df_res_5.loc[df_res_5['horizon']=='D+7', 'r2'].values[0], 'RMSE': None, 'MAE': None, 'Prediccion': df_res_5.loc[df_res_5['horizon']=='D+7', 'pred'].values[0]},
    {'Modelo': 'LSTM+ARIMA+GARCH Contrato #5 (30d)', 'R2': df_res_5.loc[df_res_5['horizon']=='D+30', 'r2'].values[0], 'RMSE': None, 'MAE': None, 'Prediccion': df_res_5.loc[df_res_5['horizon']=='D+30', 'pred'].values[0]}
])
summary_metrics.to_csv(OUTPUT_METRICS, index=False)

print("\n" + "="*75)
print(f"✅ ¡Entrenamiento y predicciones completadas con éxito!")
print(f"Archivos guardados:")
print(f"  - {OUTPUT_METRICS}")
print(f"  - {OUTPUT_PREDS}")
print("="*75)
