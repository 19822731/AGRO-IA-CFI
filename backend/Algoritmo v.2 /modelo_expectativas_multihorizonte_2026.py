import os
os.environ['OMP_NUM_THREADS'] = '1'
os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'
import time
import math
import warnings
import numpy as np
import pandas as pd

from xgboost import XGBRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error

warnings.filterwarnings('ignore')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'Datos', 'dataset_maestro_COMPLETO.csv')
CSV_METRICS = os.path.join(BASE_DIR, 'expectativas_multihorizonte_3m_6m_1y_2026.csv')
CSV_PROYECCIONES = os.path.join(BASE_DIR, 'proyecciones_azucar_2026_2027.csv')

print("="*85)
print("  MOTOR DE EXPECTATIVAS ESTRUCTURALES MULTI-HORIZONTE (Agro-IA 2026)")
print("  Horizontes de Pronóstico: 3 Meses (65d), 4 Meses (85d), 6 Meses (130d) y 1 Año (260d)")
print("  Objetivo: Fijar expectativas futuras de Contrato #5 (Londres) y Contrato #11 (NY)")
print("="*85)

# 1. Carga del Dataset Maestro
df_raw = pd.read_csv(DATA_FILE, index_col=0, parse_dates=True)
df_raw.sort_index(inplace=True)

p5 = df_raw['sugar_5']
p11 = df_raw['sugar_11']
wsp = df_raw['white_sugar_premium']

df = pd.DataFrame(index=df_raw.index)

# Precios actuales base
df['p5_current'] = p5
df['p11_current'] = p11

# ==============================================================================
# 2. DEFINICIÓN DE HORIZONTES ESTRUCTURALES Y TARGETS
# ==============================================================================
HORIZONS = {
    '3 Meses (Trimestral)': 65,     # ~65 días hábiles
    '4 Meses (Cuatrimestral)': 85,  # ~85 días hábiles
    '6 Meses (Semestral)': 130,    # ~130 días hábiles
    '1 Año (Anual)': 260           # ~260 días hábiles
}

for name, h in HORIZONS.items():
    # Retornos logarítmicos directos a cada horizonte
    df[f'target_ret5_{h}d'] = np.log(p5.shift(-h) / p5)
    df[f'target_ret11_{h}d'] = np.log(p11.shift(-h) / p11)
    df[f'p5_real_{h}d'] = p5.shift(-h)
    df[f'p11_real_{h}d'] = p11.shift(-h)

# ==============================================================================
# 3. FEATURE ENGINEERING DE CICLO ESTRUCTURAL Y MACRO (SIN RUIDO TÉCNICO DIARIO)
# ==============================================================================

# A. Estacionalidad del Ciclo de Zafra (Centro-Sur de Brasil & Monzón Asiático)
months = df.index.month
df['zafra_sin'] = np.sin(2 * np.pi * months / 12.0)
df['zafra_cos'] = np.cos(2 * np.pi * months / 12.0)
# Meses de plena molienda en Brasil (Mayo a Octubre = 1, Entresafra Diciembre a Marzo = 0)
df['es_plena_zafra_brasil'] = ((months >= 5) & (months <= 10)).astype(float)

# B. Reversión a la Media y Distancia al Costo Estructural (Medias de 100 y 200 días)
df['ratio_p5_ma100'] = (p5 / p5.rolling(100).mean()) - 1.0
df['ratio_p5_ma200'] = (p5 / p5.rolling(200).mean()) - 1.0
df['ratio_p11_ma100'] = (p11 / p11.rolling(100).mean()) - 1.0
df['ratio_p11_ma200'] = (p11 / p11.rolling(200).mean()) - 1.0

# C. Momentum de Mediano y Largo Plazo (Retornos trimestrales y semestrales)
for lag in [20, 60, 120, 250]:
    df[f'ret5_{lag}d'] = np.log(p5 / p5.shift(lag))
    df[f'ret11_{lag}d'] = np.log(p11 / p11.shift(lag))

# D. White Sugar Premium Estructural (Spread Físico Londres - NY)
df['wsp_ratio'] = wsp / p5
df['wsp_ma60'] = df['wsp_ratio'].rolling(60).mean()
df['wsp_zscore_120d'] = (wsp - wsp.rolling(120).mean()) / (wsp.rolling(120).std() + 1e-6)

# E. Paridad de Etanol en Brasil (Eje Fundamental de Oferta Global)
if 'oil_wti' in df_raw.columns and 'fx_brl' in df_raw.columns:
    # Costo del crudo en reales brasileños normalizado
    oil_brl = df_raw['oil_wti'] * df_raw['fx_brl']
    df['ethanol_parity_ratio'] = oil_brl / (p11 * 22.0462 + 1e-6)
    df['ethanol_parity_ma60'] = df['ethanol_parity_ratio'].rolling(60).mean()
    df['ethanol_parity_ret60d'] = np.log(oil_brl / oil_brl.shift(60))

# F. Macro Global: Petróleo, DXY y Divisas
if 'oil_wti' in df_raw.columns:
    df['ret_wti_60d'] = np.log(df_raw['oil_wti'] / df_raw['oil_wti'].shift(60))
    df['ret_wti_120d'] = np.log(df_raw['oil_wti'] / df_raw['oil_wti'].shift(120))
if 'fx_dxy' in df_raw.columns:
    df['ret_dxy_60d'] = np.log(df_raw['fx_dxy'] / df_raw['fx_dxy'].shift(60))
    df['ret_dxy_120d'] = np.log(df_raw['fx_dxy'] / df_raw['fx_dxy'].shift(120))
if 'fx_brl' in df_raw.columns:
    df['ret_brl_60d'] = np.log(df_raw['fx_brl'] / df_raw['fx_brl'].shift(60))
    df['ret_brl_120d'] = np.log(df_raw['fx_brl'] / df_raw['fx_brl'].shift(120))

# G. Volatilidad de Régimen Estructural
df['vol5_60d'] = df['ret5_20d'].rolling(60).std()
df['vol11_60d'] = df['ret11_20d'].rolling(60).std()

# Variables predictivas limpias
feature_cols = [c for c in df.columns if not c.startswith('target_') and not c.startswith('p5_real') and not c.startswith('p11_real') and not c.startswith('p5_current') and not c.startswith('p11_current')]

print(f"Features estructurales seleccionadas: {len(feature_cols)} variables de ciclo.")

# ==============================================================================
# 4. ENTRENAMIENTO Y EVALUACIÓN DIRECTA POR HORIZONTE CON PURGA TEMPORAL
# ==============================================================================
resultados_horizontes = []
modelos_entrenados = {}

# Último día disponible en el dataset para proyectar el futuro real hacia 2027
latest_row = df.iloc[-1]
fecha_actual = df.index[-1].strftime('%Y-%m-%d')
p5_hoy = latest_row['p5_current']
p11_hoy = latest_row['p11_current']
X_hoy = latest_row[feature_cols].values.reshape(1, -1)

proyecciones_futuras = []

print(f"\nFecha base de proyección: {fecha_actual}")
print(f"Precio actual Contrato #5 (Londres):  ${p5_hoy:.2f} USD/ton")
print(f"Precio actual Contrato #11 (Nueva York): {p11_hoy:.2f} c/lb")
print("\n" + "="*85)
print("  EVALUACIÓN DE MODELOS POR HORIZONTE ESTRUCTURAL (Test Fuera de Muestra)")
print("="*85)

for h_name, h_days in HORIZONS.items():
    # Subconjunto limpio para este horizonte
    df_h = df.dropna(subset=feature_cols + [f'target_ret5_{h_days}d', f'target_ret11_{h_days}d']).copy()
    
    # Split cronológico 80% Train / 20% Test con purga temporal de 'h_days'
    split_idx = int(len(df_h) * 0.8)
    train_df = df_h.iloc[:split_idx - h_days] # Purga para evitar overlap de retornos
    test_df = df_h.iloc[split_idx:]
    
    X_train = train_df[feature_cols].values
    X_test = test_df[feature_cols].values
    
    # ------------------ CONTRATO #5 (AZÚCAR BLANCO) ------------------
    y_train_5 = train_df[f'target_ret5_{h_days}d'].values
    y_test_5 = test_df[f'target_ret5_{h_days}d'].values
    p5_curr_te = test_df['p5_current'].values
    p5_real_te = test_df[f'p5_real_{h_days}d'].values
    
    # Modelo XGBoost Estructural para Contrato #5
    # Árboles poco profundos (max_depth=3) y alta regularización para evitar ruido a largo plazo
    xgb_5 = XGBRegressor(
        n_estimators=160,
        max_depth=3,
        learning_rate=0.03,
        subsample=0.80,
        colsample_bytree=0.75,
        reg_alpha=1.5,
        reg_lambda=2.5,
        random_state=42,
        n_jobs=4
    )
    xgb_5.fit(X_train, y_train_5)
    pred_ret_5 = xgb_5.predict(X_test)
    pred_p5_usd = p5_curr_te * np.exp(pred_ret_5)
    
    r2_5 = r2_score(p5_real_te, pred_p5_usd)
    rmse_5 = np.sqrt(mean_squared_error(p5_real_te, pred_p5_usd))
    mae_5 = mean_absolute_error(p5_real_te, pred_p5_usd)
    hit_rate_5 = np.mean(np.sign(pred_ret_5) == np.sign(y_test_5)) * 100.0
    
    # ------------------ CONTRATO #11 (AZÚCAR CRUDO) ------------------
    y_train_11 = train_df[f'target_ret11_{h_days}d'].values
    y_test_11 = test_df[f'target_ret11_{h_days}d'].values
    p11_curr_te = test_df['p11_current'].values
    p11_real_te = test_df[f'p11_real_{h_days}d'].values
    
    xgb_11 = XGBRegressor(
        n_estimators=160,
        max_depth=3,
        learning_rate=0.03,
        subsample=0.80,
        colsample_bytree=0.75,
        reg_alpha=1.5,
        reg_lambda=2.5,
        random_state=42,
        n_jobs=4
    )
    xgb_11.fit(X_train, y_train_11)
    pred_ret_11 = xgb_11.predict(X_test)
    pred_p11_usd = p11_curr_te * np.exp(pred_ret_11)
    
    r2_11 = r2_score(p11_real_te, pred_p11_usd)
    rmse_11 = np.sqrt(mean_squared_error(p11_real_te, pred_p11_usd))
    mae_11 = mean_absolute_error(p11_real_te, pred_p11_usd)
    hit_rate_11 = np.mean(np.sign(pred_ret_11) == np.sign(y_test_11)) * 100.0
    
    # ------------------ PROYECCIÓN OFICIAL A FUTURO ------------------
    # Reentrenamos con el 100% de datos disponibles para maximizar precisión futura
    X_full = df_h[feature_cols].values
    xgb_5.fit(X_full, df_h[f'target_ret5_{h_days}d'].values)
    xgb_11.fit(X_full, df_h[f'target_ret11_{h_days}d'].values)
    
    future_ret_5 = xgb_5.predict(X_hoy)[0]
    future_p5 = p5_hoy * np.exp(future_ret_5)
    
    future_ret_11 = xgb_11.predict(X_hoy)[0]
    future_p11 = p11_hoy * np.exp(future_ret_11)
    
    future_wsp = future_p5 - (future_p11 * 22.0462)
    
    resultados_horizontes.append({
        'Horizonte': h_name,
        'Dias_Habiles': h_days,
        'Cto5_R2': round(r2_5, 4),
        'Cto5_MAE_USD': round(mae_5, 2),
        'Cto5_Hit_Rate': f"{hit_rate_5:.2f}%",
        'Cto11_R2': round(r2_11, 4),
        'Cto11_MAE_clb': round(mae_11, 2),
        'Cto11_Hit_Rate': f"{hit_rate_11:.2f}%"
    })
    
    proyecciones_futuras.append({
        'Horizonte': h_name,
        'Dias': h_days,
        'Cto5_Hoy_USD': round(p5_hoy, 2),
        'Cto5_Pronostico_USD': round(future_p5, 2),
        'Cto5_Var_%': f"{((future_p5/p5_hoy)-1)*100:+.2f}%",
        'Cto11_Hoy_clb': round(p11_hoy, 2),
        'Cto11_Pronostico_clb': round(future_p11, 2),
        'Cto11_Var_%': f"{((future_p11/p11_hoy)-1)*100:+.2f}%",
        'White_Sugar_Premium_USD': round(future_wsp, 2)
    })
    
    print(f"Horizonte: {h_name:25s} | Cto 5: R² = {r2_5:.4f}, MAE = ${mae_5:.2f}, Hit Rate = {hit_rate_5:.2f}% | Cto 11: R² = {r2_11:.4f}, Hit Rate = {hit_rate_11:.2f}%")

df_metrics = pd.DataFrame(resultados_horizontes)
df_metrics.to_csv(CSV_METRICS, index=False)

df_proy = pd.DataFrame(proyecciones_futuras)
df_proy.to_csv(CSV_PROYECCIONES, index=False)

print("\n" + "="*85)
print("  TABLA DE MÉTRICAS DE PRECISIÓN POR HORIZONTE ESTRUCTURAL (2010 - 2026)")
print("="*85)
print(df_metrics.to_string(index=False))

print("\n" + "="*85)
print("  PROYECCIONES OFICIALES DEL MERCADO DE AZÚCAR (2026 - 2027)")
print("="*85)
print(df_proy.to_string(index=False))

print(f"\nResultados guardados en:")
print(f"  - Métricas:      {CSV_METRICS}")
print(f"  - Proyecciones:  {CSV_PROYECCIONES}")
