import os
os.environ['OMP_NUM_THREADS'] = '1'
os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'
import time
import math
import warnings
import numpy as np
import pandas as pd

from xgboost import XGBRegressor
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error

warnings.filterwarnings('ignore')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'Datos', 'dataset_maestro_COMPLETO.csv')
NOAA_FILE = os.path.join(BASE_DIR, 'Datos', 'noaa_oni_monthly.csv')
USDA_FILE = os.path.join(BASE_DIR, 'Datos', 'usda_sugar_balance.csv')

CSV_METRICS = os.path.join(BASE_DIR, 'comparativa_expectativas_fase1_vs_fase2_2026.csv')
CSV_PROYECCIONES = os.path.join(BASE_DIR, 'proyecciones_azucar_fundamentales_2026_2027.csv')

print("="*85)
print("  FASE 2: ENTRENAMIENTO DE MODELO MULTI-HORIZONTE CON DATOS FUNDAMENTALES")
print("  Ingesta: NOAA El Niño/La Niña (ENSO) + Balance Mundial de Azúcar (USDA FAS PSD)")
print("  Horizontes: 3 Meses (65d), 4 Meses (85d), 6 Meses (130d) y 1 Año (260d)")
print("="*85)

# 1. Carga y Alineación Antirruido (Sin Lookahead Bias vía merge_asof)
df_daily = pd.read_csv(DATA_FILE)
# La primera columna es la fecha
date_col = df_daily.columns[0]
df_daily.rename(columns={date_col: 'Fecha'}, inplace=True)
df_daily['Fecha'] = pd.to_datetime(df_daily['Fecha'])
df_daily.sort_values('Fecha', inplace=True)
df_daily.reset_index(drop=True, inplace=True)

df_noaa = pd.read_csv(NOAA_FILE)
df_noaa['Fecha'] = pd.to_datetime(df_noaa['Fecha'])
df_noaa.sort_values('Fecha', inplace=True)
df_noaa.reset_index(drop=True, inplace=True)

df_usda = pd.read_csv(USDA_FILE)
df_usda['Fecha'] = pd.to_datetime(df_usda['Fecha'])
df_usda.sort_values('Fecha', inplace=True)
df_usda.reset_index(drop=True, inplace=True)

# Merge asof hacia atrás: cada día 't' solo ve el dato de NOAA o USDA publicado con anterioridad
df_merged = pd.merge_asof(df_daily, df_noaa[['Fecha', 'oni_anom', 'oni_anom_change_3m', 'oni_is_el_nino', 'oni_is_la_nina']], on='Fecha', direction='backward')
df_merged = pd.merge_asof(df_merged, df_usda[['Fecha', 'usda_stocks_to_use_pct', 'usda_surplus_deficit_mt', 'usda_stocks_var_yoy', 'usda_brazil_share_pct']], on='Fecha', direction='backward')

df_merged.set_index('Fecha', inplace=True)
print(f"Dataset maestro enriquecido: {df_merged.shape[0]} días con variables climáticas y de oferta/demanda.")

# 2. Variables Base y Targets
HORIZONS = {
    '3 Meses (Trimestral)': 65,
    '4 Meses (Cuatrimestral)': 85,
    '6 Meses (Semestral)': 130,
    '1 Año (Anual)': 260
}

p5 = df_merged['sugar_5']
p11 = df_merged['sugar_11']
wsp = df_merged['white_sugar_premium']

df = pd.DataFrame(index=df_merged.index)
df['p5_current'] = p5
df['p11_current'] = p11

for name, h in HORIZONS.items():
    df[f'target_ret5_{h}d'] = np.log(p5.shift(-h) / p5)
    df[f'target_ret11_{h}d'] = np.log(p11.shift(-h) / p11)
    df[f'p5_real_{h}d'] = p5.shift(-h)
    df[f'p11_real_{h}d'] = p11.shift(-h)

# 3. FEATURE ENGINEERING ESTRUCTURAL + FUNDAMENTAL

# A. Ciclo de Zafra
months = df.index.month
df['zafra_sin'] = np.sin(2 * np.pi * months / 12.0)
df['zafra_cos'] = np.cos(2 * np.pi * months / 12.0)
df['es_plena_zafra_brasil'] = ((months >= 5) & (months <= 10)).astype(float)

# B. Ratios de Largo Plazo (Distancia a MA100 y MA200)
df['ratio_p5_ma100'] = (p5 / p5.rolling(100).mean()) - 1.0
df['ratio_p5_ma200'] = (p5 / p5.rolling(200).mean()) - 1.0
df['ratio_p11_ma100'] = (p11 / p11.rolling(100).mean()) - 1.0
df['ratio_p11_ma200'] = (p11 / p11.rolling(200).mean()) - 1.0

# C. Momentum Estructural
for lag in [20, 60, 120, 250]:
    df[f'ret5_{lag}d'] = np.log(p5 / p5.shift(lag))
    df[f'ret11_{lag}d'] = np.log(p11 / p11.shift(lag))

# D. White Sugar Premium
df['wsp_ratio'] = wsp / p5
df['wsp_ma60'] = df['wsp_ratio'].rolling(60).mean()
df['wsp_zscore_120d'] = (wsp - wsp.rolling(120).mean()) / (wsp.rolling(120).std() + 1e-6)

# E. Paridad de Etanol Brasil y Macro
if 'oil_wti' in df_merged.columns and 'fx_brl' in df_merged.columns:
    oil_brl = df_merged['oil_wti'] * df_merged['fx_brl']
    df['ethanol_parity_ratio'] = oil_brl / (p11 * 22.0462 + 1e-6)
    df['ethanol_parity_ma60'] = df['ethanol_parity_ratio'].rolling(60).mean()
    df['ethanol_parity_ret60d'] = np.log(oil_brl / oil_brl.shift(60))

if 'oil_wti' in df_merged.columns:
    df['ret_wti_60d'] = np.log(df_merged['oil_wti'] / df_merged['oil_wti'].shift(60))
    df['ret_wti_120d'] = np.log(df_merged['oil_wti'] / df_merged['oil_wti'].shift(120))
if 'fx_dxy' in df_merged.columns:
    df['ret_dxy_60d'] = np.log(df_merged['fx_dxy'] / df_merged['fx_dxy'].shift(60))
    df['ret_dxy_120d'] = np.log(df_merged['fx_dxy'] / df_merged['fx_dxy'].shift(120))
if 'fx_brl' in df_merged.columns:
    df['ret_brl_60d'] = np.log(df_merged['fx_brl'] / df_merged['fx_brl'].shift(60))
    df['ret_brl_120d'] = np.log(df_merged['fx_brl'] / df_merged['fx_brl'].shift(120))

df['vol5_60d'] = df['ret5_20d'].rolling(60).std()
df['vol11_60d'] = df['ret11_20d'].rolling(60).std()

# --- F. NUEVAS FEATURES FUNDAMENTALES (NOAA ENSO & USDA PSD) ---
df['oni_anom'] = df_merged['oni_anom']
df['oni_anom_change_3m'] = df_merged['oni_anom_change_3m']
df['oni_is_el_nino'] = df_merged['oni_is_el_nino']
df['oni_is_la_nina'] = df_merged['oni_is_la_nina']

df['usda_stocks_to_use_pct'] = df_merged['usda_stocks_to_use_pct']
df['usda_stocks_to_use_zscore'] = (df['usda_stocks_to_use_pct'] - df['usda_stocks_to_use_pct'].rolling(250, min_periods=30).mean()) / (df['usda_stocks_to_use_pct'].rolling(250, min_periods=30).std() + 1e-6)
df['usda_surplus_deficit_mt'] = df_merged['usda_surplus_deficit_mt']
df['usda_stocks_var_yoy'] = df_merged['usda_stocks_var_yoy']
df['usda_brazil_share_pct'] = df_merged['usda_brazil_share_pct']

# Features limpias
feature_cols = [c for c in df.columns if not c.startswith('target_') and not c.startswith('p5_real') and not c.startswith('p11_real') and not c.startswith('p5_current') and not c.startswith('p11_current')]

print(f"Total features finales con Fundamentales: {len(feature_cols)}")

# ==============================================================================
# 4. ENTRENAMIENTO Y EVALUACIÓN COMPARATIVA (FASE 1 vs FASE 2)
# ==============================================================================
fase1_benchmarks = {
    '3 Meses (Trimestral)':   {'c5_r2': 0.6168, 'c5_mae': 47.52, 'c5_hr': 43.02, 'c11_r2': 0.5226, 'c11_mae': 2.19, 'c11_hr': 54.33},
    '4 Meses (Cuatrimestral)': {'c5_r2': 0.5256, 'c5_mae': 51.29, 'c5_hr': 44.83, 'c11_r2': 0.5030, 'c11_mae': 2.23, 'c11_hr': 54.04},
    '6 Meses (Semestral)':     {'c5_r2': 0.2680, 'c5_mae': 70.49, 'c5_hr': 37.19, 'c11_r2': 0.3545, 'c11_mae': 2.66, 'c11_hr': 56.20},
    '1 Año (Anual)':           {'c5_r2': -1.0184, 'c5_mae': 109.53, 'c5_hr': 29.51, 'c11_r2': -0.5544, 'c11_mae': 4.08, 'c11_hr': 49.26}
}

comparativa_fases = []
proyecciones_fase2 = []

latest_row = df.iloc[-1]
fecha_actual = df.index[-1].strftime('%Y-%m-%d')
p5_hoy = latest_row['p5_current']
p11_hoy = latest_row['p11_current']
X_hoy = latest_row[feature_cols].values.reshape(1, -1)

print("\n" + "="*85)
print("  EVALUANDO MODELOS CON PURGA TEMPORAL (FASE 2: CON FUNDAMENTALES)")
print("="*85)

for h_name, h_days in HORIZONS.items():
    df_h = df.dropna(subset=feature_cols + [f'target_ret5_{h_days}d', f'target_ret11_{h_days}d']).copy()
    
    split_idx = int(len(df_h) * 0.8)
    train_df = df_h.iloc[:split_idx - h_days] # Purga temporal
    test_df = df_h.iloc[split_idx:]
    
    X_train = train_df[feature_cols].values
    X_test = test_df[feature_cols].values
    
    # Contrato #5
    y_train_5 = train_df[f'target_ret5_{h_days}d'].values
    y_test_5 = test_df[f'target_ret5_{h_days}d'].values
    p5_curr_te = test_df['p5_current'].values
    p5_real_te = test_df[f'p5_real_{h_days}d'].values
    
    xgb_5 = XGBRegressor(
        n_estimators=180,
        max_depth=3,
        learning_rate=0.03,
        subsample=0.80,
        colsample_bytree=0.75,
        reg_alpha=2.0,
        reg_lambda=3.0,
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
    
    # Contrato #11
    y_train_11 = train_df[f'target_ret11_{h_days}d'].values
    y_test_11 = test_df[f'target_ret11_{h_days}d'].values
    p11_curr_te = test_df['p11_current'].values
    p11_real_te = test_df[f'p11_real_{h_days}d'].values
    
    xgb_11 = XGBRegressor(
        n_estimators=180,
        max_depth=3,
        learning_rate=0.03,
        subsample=0.80,
        colsample_bytree=0.75,
        reg_alpha=2.0,
        reg_lambda=3.0,
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
    
    f1 = fase1_benchmarks[h_name]
    diff_r2_5 = r2_5 - f1['c5_r2']
    diff_mae_5 = mae_5 - f1['c5_mae']
    diff_r2_11 = r2_11 - f1['c11_r2']
    diff_mae_11 = mae_11 - f1['c11_mae']
    
    comparativa_fases.append({
        'Horizonte': h_name,
        'Cto5_R2_Fase1': f1['c5_r2'],
        'Cto5_R2_Fase2': round(r2_5, 4),
        'Mejora_R2_Cto5': f"{diff_r2_5:+.4f}",
        'Cto5_MAE_F1': f"${f1['c5_mae']:.2f}",
        'Cto5_MAE_F2': f"${mae_5:.2f}",
        'Cto11_R2_F1': f1['c11_r2'],
        'Cto11_R2_F2': round(r2_11, 4),
        'Mejora_R2_Cto11': f"{diff_r2_11:+.4f}",
        'Cto11_HitRate_F2': f"{hit_rate_11:.2f}%"
    })
    
    # Proyección con todo el historial
    X_full = df_h[feature_cols].values
    xgb_5.fit(X_full, df_h[f'target_ret5_{h_days}d'].values)
    xgb_11.fit(X_full, df_h[f'target_ret11_{h_days}d'].values)
    
    fut_ret_5 = xgb_5.predict(X_hoy)[0]
    fut_p5 = p5_hoy * np.exp(fut_ret_5)
    
    fut_ret_11 = xgb_11.predict(X_hoy)[0]
    fut_p11 = p11_hoy * np.exp(fut_ret_11)
    
    fut_wsp = fut_p5 - (fut_p11 * 22.0462)
    
    proyecciones_fase2.append({
        'Horizonte': h_name,
        'Dias': h_days,
        'Cto5_Actual_USD': round(p5_hoy, 2),
        'Cto5_Pronostico_USD': round(fut_p5, 2),
        'Cto5_Var_%': f"{((fut_p5/p5_hoy)-1)*100:+.2f}%",
        'Cto11_Actual_clb': round(p11_hoy, 2),
        'Cto11_Pronostico_clb': round(fut_p11, 2),
        'Cto11_Var_%': f"{((fut_p11/p11_hoy)-1)*100:+.2f}%",
        'White_Sugar_Premium_USD': round(fut_wsp, 2)
    })
    
    print(f"Horizonte: {h_name:25s} | Cto 5 R²: {f1['c5_r2']:.4f} -> {r2_5:.4f} ({diff_r2_5:+.4f}) | Cto 11 R²: {f1['c11_r2']:.4f} -> {r2_11:.4f} ({diff_r2_11:+.4f}) | Hit Rate 11: {hit_rate_11:.2f}%")

df_comp = pd.DataFrame(comparativa_fases)
df_comp.to_csv(CSV_METRICS, index=False)

df_proy2 = pd.DataFrame(proyecciones_fase2)
df_proy2.to_csv(CSV_PROYECCIONES, index=False)

print("\n" + "="*85)
print("  COMPARATIVA OFICIAL: FASE 1 (SOLO MACRO/PRECIOS) VS. FASE 2 (CON FUNDAMENTALES)")
print("="*85)
print(df_comp.to_string(index=False))

print("\n" + "="*85)
print("  PROYECCIONES REFINADAS CON FUNDAMENTALES (2026 - 2027)")
print("="*85)
print(df_proy2.to_string(index=False))

print(f"\nArchivos guardados en:")
print(f"  - {CSV_METRICS}")
print(f"  - {CSV_PROYECCIONES}")
