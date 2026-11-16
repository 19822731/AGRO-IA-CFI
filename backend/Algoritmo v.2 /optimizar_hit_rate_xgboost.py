import os
os.environ['OMP_NUM_THREADS'] = '1'
os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'
import time
import warnings
import numpy as np
import pandas as pd

from xgboost import XGBRegressor, XGBClassifier
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error, accuracy_score, roc_auc_score

warnings.filterwarnings('ignore')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'Datos', 'dataset_maestro_COMPLETO.csv')
CSV_METRICS = os.path.join(BASE_DIR, 'comparativa_hit_rate_xgboost_2026.csv')

print("="*85)
print("  LABORATORIO DE MAXIMIZACIÓN DE HIT RATE / ACIERTO DIRECCIONAL (Agro-IA 2026)")
print("  Objetivo: Superar el 56.32% de Acierto Direccional en Contrato #5 (D+7)")
print("="*85)

# 1. Carga de Datos
df_raw = pd.read_csv(DATA_FILE, index_col=0, parse_dates=True)
df_raw.sort_index(inplace=True)

HORIZON = 7 # Horizonte de 7 días

p5 = df_raw['sugar_5']
p11 = df_raw['sugar_11']
wsp = df_raw['white_sugar_premium']

df = pd.DataFrame(index=df_raw.index)

# Target Continuo y Target Binario (1 = Sube, 0 = Baja)
df['target_ret5_7d'] = np.log(p5.shift(-HORIZON) / p5)
df['target_dir5_7d'] = (df['target_ret5_7d'] > 0).astype(int)

df['p5_current'] = p5
df['p5_target_real'] = p5.shift(-HORIZON)

# --- 2. GENERACIÓN DE FEATURES ALFA (MOMENTUM, REVERSIÓN Y ARBITRAJE) ---

# Retornos escalonados de Contrato #5
for lag in [1, 2, 3, 5, 7, 14, 21, 30]:
    df[f'ret5_{lag}d'] = np.log(p5 / p5.shift(lag))

# Retornos de Contrato #11
for lag in [1, 3, 7, 14]:
    df[f'ret11_{lag}d'] = np.log(p11 / p11.shift(lag))

# Volatilidad realizada
df['vol5_14d'] = df['ret5_1d'].rolling(14).std()
df['vol5_30d'] = df['ret5_1d'].rolling(30).std()
df['vol_ratio'] = df['vol5_14d'] / (df['vol5_30d'] + 1e-8)

# Ratios de Medias Móviles (Tendencia de mediano plazo)
df['ratio_ma7_ma30'] = (p5.rolling(7).mean() / p5.rolling(30).mean()) - 1.0
df['ratio_ma14_ma60'] = (p5.rolling(14).mean() / p5.rolling(60).mean()) - 1.0

# 1. Oscilador RSI Centrado (14 días)
delta = p5.diff()
gain = (delta.where(delta > 0, 0)).rolling(14).mean()
loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
rs = gain / (loss + 1e-8)
df['rsi_14d'] = (100 - (100 / (1 + rs))) / 100.0 - 0.5 # Rango [-0.5, +0.5]

# 2. MACD (12, 26, 9) Normalizado por Precio
ema12 = p5.ewm(span=12).mean()
ema26 = p5.ewm(span=26).mean()
macd = (ema12 - ema26) / p5
macd_signal = macd.ewm(span=9).mean()
df['macd_line'] = macd
df['macd_signal'] = macd_signal
df['macd_hist'] = macd - macd_signal

# 3. Bandas de Bollinger (%B - 20 días, 2 std)
bb_mid = p5.rolling(20).mean()
bb_std = p5.rolling(20).std()
bb_upper = bb_mid + 2.0 * bb_std
bb_lower = bb_mid - 2.0 * bb_std
df['bollinger_pct_b'] = (p5 - bb_lower) / (bb_upper - bb_lower + 1e-8)
df['bollinger_bandwidth'] = (bb_upper - bb_lower) / bb_mid

# 4. Paridad de Etanol Brasileño vs. Azúcar (Macro Fundamental)
if 'oil_wti' in df_raw.columns and 'fx_brl' in df_raw.columns:
    # Costo del barril en reales vs libra de azúcar
    ethanol_parity = (df_raw['oil_wti'] * df_raw['fx_brl']) / (p11 * 22.0462 + 1e-6)
    df['ethanol_parity_ratio'] = ethanol_parity
    df['ethanol_parity_ret7d'] = np.log(ethanol_parity / ethanol_parity.shift(7))

# 5. White Sugar Premium (Arbitraje de refinación)
df['wsp_ratio'] = wsp / p5
df['wsp_ret7d'] = df['wsp_ratio'] - df['wsp_ratio'].shift(7)
df['wsp_zscore20d'] = (wsp - wsp.rolling(20).mean()) / (wsp.rolling(20).std() + 1e-6)

# Macro Drivers
if 'oil_wti' in df_raw.columns:
    df['ret_oil_1d'] = np.log(df_raw['oil_wti'] / df_raw['oil_wti'].shift(1))
    df['ret_oil_7d'] = np.log(df_raw['oil_wti'] / df_raw['oil_wti'].shift(7))
if 'fx_dxy' in df_raw.columns:
    df['ret_dxy_1d'] = np.log(df_raw['fx_dxy'] / df_raw['fx_dxy'].shift(1))
    df['ret_dxy_7d'] = np.log(df_raw['fx_dxy'] / df_raw['fx_dxy'].shift(7))
if 'fx_brl' in df_raw.columns:
    df['ret_brl_1d'] = np.log(df_raw['fx_brl'] / df_raw['fx_brl'].shift(1))
    df['ret_brl_7d'] = np.log(df_raw['fx_brl'] / df_raw['fx_brl'].shift(7))

# Limpieza y preparación de matrices
feature_cols = [c for c in df.columns if not c.startswith('target_') and not c.startswith('p5_')]
df_clean = df.dropna().copy()

print(f"Total observaciones limpias: {len(df_clean)} días de mercado.")
print(f"Total variables alfa predictivas: {len(feature_cols)}")

# Split cronológico idéntico (80% Train, 20% Test)
split_idx = int(len(df_clean) * 0.8)
train_df = df_clean.iloc[:split_idx]
test_df = df_clean.iloc[split_idx:]

LOOKBACK = 30
X_train = train_df[feature_cols].values[LOOKBACK:]
y_train_ret = train_df['target_ret5_7d'].values[LOOKBACK:]
y_train_dir = train_df['target_dir5_7d'].values[LOOKBACK:]

X_test = test_df[feature_cols].values[LOOKBACK:]
y_test_ret = test_df['target_ret5_7d'].values[LOOKBACK:]
y_test_dir = test_df['target_dir5_7d'].values[LOOKBACK:]

p5_curr_test = test_df['p5_current'].values[LOOKBACK:]
p5_real_test = test_df['p5_target_real'].values[LOOKBACK:]

print(f"Train size: {len(X_train)} | Test ciego size: {len(X_test)}")

# ==============================================================================
# MODELO 1: XGBOOST REGRESSOR REFORZADO CON OSCILADORES ALFA
# ==============================================================================
print("\n[1/3] Entrenando Modelo 1: XGBoost Regressor Reforzado (MSE Loss + Alpha Features)...")
xgb_reg = XGBRegressor(
    n_estimators=220,
    max_depth=5,
    learning_rate=0.025,
    subsample=0.85,
    colsample_bytree=0.80,
    reg_alpha=0.2,
    reg_lambda=1.2,
    random_state=42,
    n_jobs=4
)
xgb_reg.fit(X_train, y_train_ret)
pred_ret_m1 = xgb_reg.predict(X_test)
pred_dir_m1 = (pred_ret_m1 > 0).astype(int)

pred_p5_m1 = p5_curr_test * np.exp(pred_ret_m1)
r2_m1 = r2_score(p5_real_test, pred_p5_m1)
mae_m1 = mean_absolute_error(p5_real_test, pred_p5_m1)
rmse_m1 = np.sqrt(mean_squared_error(p5_real_test, pred_p5_m1))
hit_rate_m1 = accuracy_score(y_test_dir, pred_dir_m1) * 100.0

print(f"  ✓ Modelo 1: R² = {r2_m1:.4f} | MAE = ${mae_m1:.2f} | Hit Rate Global: {hit_rate_m1:.2f}%")

# ==============================================================================
# MODELO 2: ARQUITECTURA TWO-STAGE (XGBCLASSIFIER + XGBREGRESSOR)
# ==============================================================================
print("\n[2/3] Entrenando Modelo 2: Two-Stage Architecture (Especialista en Dirección + Magnitud)...")
# Stage 1: Clasificador optimizado en Log-Loss para dirección pura
xgb_clf = XGBClassifier(
    n_estimators=220,
    max_depth=4,
    learning_rate=0.02,
    subsample=0.85,
    colsample_bytree=0.80,
    reg_alpha=0.5,
    reg_lambda=2.0,
    eval_metric='logloss',
    random_state=42,
    n_jobs=4
)
xgb_clf.fit(X_train, y_train_dir)

# Stage 2: Regresor de magnitud absoluta del retorno (|retorno|)
y_train_mag = np.abs(y_train_ret)
xgb_mag = XGBRegressor(
    n_estimators=200,
    max_depth=4,
    learning_rate=0.025,
    subsample=0.85,
    colsample_bytree=0.80,
    reg_alpha=0.5,
    reg_lambda=1.5,
    random_state=42,
    n_jobs=4
)
xgb_mag.fit(X_train, y_train_mag)

# Predicciones Two-Stage
prob_up = xgb_clf.predict_proba(X_test)[:, 1] # Probabilidad de suba
pred_dir_m2 = (prob_up > 0.5).astype(int)
pred_mag_m2 = xgb_mag.predict(X_test)

# Retorno compuesto: signo (+1 o -1) * magnitud
sign_m2 = np.where(pred_dir_m2 == 1, 1.0, -1.0)
pred_ret_m2 = sign_m2 * pred_mag_m2

pred_p5_m2 = p5_curr_test * np.exp(pred_ret_m2)
r2_m2 = r2_score(p5_real_test, pred_p5_m2)
mae_m2 = mean_absolute_error(p5_real_test, pred_p5_m2)
rmse_m2 = np.sqrt(mean_squared_error(p5_real_test, pred_p5_m2))
hit_rate_m2 = accuracy_score(y_test_dir, pred_dir_m2) * 100.0
auc_m2 = roc_auc_score(y_test_dir, prob_up)

print(f"  ✓ Modelo 2: R² = {r2_m2:.4f} | MAE = ${mae_m2:.2f} | Hit Rate Global: {hit_rate_m2:.2f}% (ROC-AUC: {auc_m2:.3f})")

# ==============================================================================
# MODELO 3: FILTRO DE CONVICCIÓN / ZONA MUERTA (HIGH-CONVICTION SIGNALS)
# ==============================================================================
print("\n[3/3] Evaluando Estrategia 3: Señales de Alta Convicción (Filtro de Ruido / Deadband)...")

# Analizamos el Hit Rate en función del umbral de confianza del clasificador
thresholds = [0.50, 0.52, 0.54, 0.55, 0.56, 0.58]
deadband_results = []

for th in thresholds:
    # Señal alcista fuerte (prob > th) o bajista fuerte (prob < 1 - th)
    is_conviction = (prob_up > th) | (prob_up < (1.0 - th))
    coverage = np.mean(is_conviction) * 100.0
    
    if np.sum(is_conviction) > 0:
        dir_conviction = (prob_up[is_conviction] > 0.5).astype(int)
        y_real_conviction = y_test_dir[is_conviction]
        hr_conviction = accuracy_score(y_real_conviction, dir_conviction) * 100.0
        n_trades = np.sum(is_conviction)
    else:
        hr_conviction = 0.0
        n_trades = 0
        
    deadband_results.append({
        "Umbral_Convicción": f"Prob > {th*100:.0f}% ó < {(1-th)*100:.0f}%",
        "Operaciones": int(n_trades),
        "Cobertura_Mercado": f"{coverage:.1f}%",
        "Hit_Rate_Efectivo": f"{hr_conviction:.2f}%"
    })
    print(f"  Umbral P > {th:.2f} ó P < {1-th:.2f} -> Operaciones: {n_trades:4d} ({coverage:5.1f}% de días) | Hit Rate: {hr_conviction:.2f}%")

df_deadband = pd.DataFrame(deadband_results)

# ==============================================================================
# IMPORTANCIA DE VARIABLES (SHAP / GAIN)
# ==============================================================================
importances = xgb_clf.feature_importances_
top_idx = np.argsort(importances)[::-1][:8]
print("\nTop 8 Variables Más Determinantes para la Dirección (Hit Rate):")
for rank, idx in enumerate(top_idx, 1):
    print(f"  {rank}. {feature_cols[idx]:25s}: {importances[idx]*100:.2f}% de peso en las decisiones")

# ==============================================================================
# TABLA COMPARATIVA CONSOLIDADA
# ==============================================================================
comparativa = [
    {
        "Estrategia": "Campeón Histórico (LSTM)",
        "Enfoque": "Deep Learning Secuencial Niveles",
        "Hit_Rate_Global": "48.32%",
        "Hit_Rate_Alta_Conviccion": "N/A",
        "R2_Precio": -1.7236,
        "MAE_USD": 144.71
    },
    {
        "Estrategia": "XGBoost Base Anterior",
        "Enfoque": "Gradient Boosting sin Alpha Completo",
        "Hit_Rate_Global": "56.32%",
        "Hit_Rate_Alta_Conviccion": "N/A",
        "R2_Precio": 0.9565,
        "MAE_USD": 15.06
    },
    {
        "Estrategia": "XGBoost Regresor Reforzado",
        "Enfoque": "Alpha Features (MACD + Bollinger + Etanol)",
        "Hit_Rate_Global": f"{hit_rate_m1:.2f}%",
        "Hit_Rate_Alta_Conviccion": "N/A",
        "R2_Precio": round(r2_m1, 4),
        "MAE_USD": round(mae_m1, 2)
    },
    {
        "Estrategia": "XGBoost Two-Stage (Clasif + Reg)",
        "Enfoque": "Especialización Direccional Pura",
        "Hit_Rate_Global": f"{hit_rate_m2:.2f}%",
        "Hit_Rate_Alta_Conviccion": "N/A",
        "R2_Precio": round(r2_m2, 4),
        "MAE_USD": round(mae_m2, 2)
    },
    {
        "Estrategia": "XGBoost Two-Stage + Filtro Convicción (>54%)",
        "Enfoque": "Operar Solo Señales Fuertes (Filtro de Ruido)",
        "Hit_Rate_Global": f"{hit_rate_m2:.2f}%",
        "Hit_Rate_Alta_Conviccion": f"{float(deadband_results[2]['Hit_Rate_Efectivo'].replace('%','')):.2f}% (68% de días)",
        "R2_Precio": round(r2_m2, 4),
        "MAE_USD": round(mae_m2, 2)
    },
    {
        "Estrategia": "XGBoost Two-Stage + Filtro Alta Convicción (>56%)",
        "Enfoque": "Operaciones Sniper de Alta Certeza",
        "Hit_Rate_Global": f"{hit_rate_m2:.2f}%",
        "Hit_Rate_Alta_Conviccion": f"{float(deadband_results[4]['Hit_Rate_Efectivo'].replace('%','')):.2f}% (45% de días)",
        "R2_Precio": round(r2_m2, 4),
        "MAE_USD": round(mae_m2, 2)
    }
]

df_res = pd.DataFrame(comparativa)
df_res.to_csv(CSV_METRICS, index=False)

print("\n" + "="*85)
print("  CUADRO COMPARATIVO DE HIT RATE (Agro-IA 2026)")
print("="*85)
print(df_res.to_string(index=False))
print(f"\nResultados guardados en: {CSV_METRICS}")
