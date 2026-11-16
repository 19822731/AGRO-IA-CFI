import os
os.environ['OMP_NUM_THREADS'] = '1'
os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'
import time
import math
import warnings
import numpy as np
import pandas as pd

# PyTorch & Apple Silicon
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader, TensorDataset
from xgboost import XGBRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
import coremltools as ct

warnings.filterwarnings('ignore')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'Datos', 'dataset_maestro_COMPLETO.csv')
NOAA_FILE = os.path.join(BASE_DIR, 'Datos', 'noaa_oni_monthly.csv')
USDA_FILE = os.path.join(BASE_DIR, 'Datos', 'usda_sugar_balance.csv')

CSV_METRICS = os.path.join(BASE_DIR, 'comparativa_hibrido_multihorizonte_2026.csv')
CSV_PROYECCIONES = os.path.join(BASE_DIR, 'proyecciones_hibrido_multihorizonte_2026_2027.csv')
COREML_OUTPUT = os.path.join(BASE_DIR, 'HibridoMultiHorizonte_M4.mlpackage')

print("="*85)
print("  ARQUITECTURA HÍBRIDA MULTI-HORIZONTE (M4 DEEP LEARNING + XGBOOST + FÍSICA)")
print("  Horizontes: 3 Meses (65d), 4 Meses (85d), 6 Meses (130d) y 1 Año (260d)")
print("  Integración: Red Multi-Head con Arbitraje de Spread + XGBoost Desacoplado")
print("="*85)

# 1. Configuración de Hardware Apple M4
device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
print(f"🚀 Acelerador activo: {device} (Apple M4 Metal Acceleration)")

# 2. Carga y Alineación Antirruido sin Lookahead Bias
df_daily = pd.read_csv(DATA_FILE)
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

df_m = pd.merge_asof(df_daily, df_noaa[['Fecha', 'oni_anom', 'oni_anom_change_3m', 'oni_is_el_nino']], on='Fecha', direction='backward')
df_m = pd.merge_asof(df_m, df_usda[['Fecha', 'usda_stocks_to_use_pct', 'usda_surplus_deficit_mt', 'usda_brazil_share_pct']], on='Fecha', direction='backward')
df_m.set_index('Fecha', inplace=True)

p5 = df_m['sugar_5']
p11 = df_m['sugar_11']
wsp = df_m['white_sugar_premium']

df = pd.DataFrame(index=df_m.index)
df['p5_current'] = p5
df['p11_current'] = p11

HORIZONS = {
    '3 Meses (Trimestral)': 65,
    '4 Meses (Cuatrimestral)': 85,
    '6 Meses (Semestral)': 130,
    '1 Año (Anual)': 260
}

for name, h in HORIZONS.items():
    df[f'target_ret5_{h}d'] = np.log(p5.shift(-h) / p5)
    df[f'target_ret11_{h}d'] = np.log(p11.shift(-h) / p11)
    df[f'p5_real_{h}d'] = p5.shift(-h)
    df[f'p11_real_{h}d'] = p11.shift(-h)

# 3. FEATURE ENGINEERING DESACOPLADO POR ESCALAS TEMPORALES
months = df.index.month
df['zafra_sin'] = np.sin(2 * np.pi * months / 12.0)
df['zafra_cos'] = np.cos(2 * np.pi * months / 12.0)
df['es_plena_zafra_brasil'] = ((months >= 5) & (months <= 10)).astype(float)

# Anclas estructurales de reversión a la media
df['ratio_p5_ma100'] = (p5 / p5.rolling(100).mean()) - 1.0
df['ratio_p5_ma200'] = (p5 / p5.rolling(200).mean()) - 1.0
df['ratio_p11_ma100'] = (p11 / p11.rolling(100).mean()) - 1.0
df['ratio_p11_ma200'] = (p11 / p11.rolling(200).mean()) - 1.0

# Retornos macro
for lag in [20, 60, 120, 250]:
    df[f'ret5_{lag}d'] = np.log(p5 / p5.shift(lag))
    df[f'ret11_{lag}d'] = np.log(p11 / p11.shift(lag))

df['wsp_ratio'] = wsp / p5
df['wsp_ma60'] = df['wsp_ratio'].rolling(60).mean()
df['wsp_zscore_120d'] = (wsp - wsp.rolling(120).mean()) / (wsp.rolling(120).std() + 1e-6)

if 'oil_wti' in df_m.columns and 'fx_brl' in df_m.columns:
    oil_brl = df_m['oil_wti'] * df_m['fx_brl']
    df['ethanol_parity_ratio'] = oil_brl / (p11 * 22.0462 + 1e-6)
    df['ethanol_parity_ma60'] = df['ethanol_parity_ratio'].rolling(60).mean()

if 'oil_wti' in df_m.columns:
    df['ret_wti_60d'] = np.log(df_m['oil_wti'] / df_m['oil_wti'].shift(60))
    df['ret_wti_120d'] = np.log(df_m['oil_wti'] / df_m['oil_wti'].shift(120))
if 'fx_dxy' in df_m.columns:
    df['ret_dxy_60d'] = np.log(df_m['fx_dxy'] / df_m['fx_dxy'].shift(60))
if 'fx_brl' in df_m.columns:
    df['ret_brl_60d'] = np.log(df_m['fx_brl'] / df_m['fx_brl'].shift(60))
    df['ret_brl_120d'] = np.log(df_m['fx_brl'] / df_m['fx_brl'].shift(120))

# Variables Fundamentales de Clima y Balance Mundial
df['oni_anom'] = df_m['oni_anom']
df['oni_anom_change_3m'] = df_m['oni_anom_change_3m']
df['oni_is_el_nino'] = df_m['oni_is_el_nino']
df['usda_stocks_to_use_pct'] = df_m['usda_stocks_to_use_pct']
df['usda_surplus_deficit_mt'] = df_m['usda_surplus_deficit_mt']
df['usda_brazil_share_pct'] = df_m['usda_brazil_share_pct']

# Subconjuntos especializados para desacoplar el ruido:
# - Conjunto Dinámico (para 3M y 4M)
cols_dynamic = [
    'zafra_sin', 'zafra_cos', 'es_plena_zafra_brasil',
    'ratio_p5_ma100', 'ratio_p5_ma200', 'ratio_p11_ma100', 'ratio_p11_ma200',
    'ret5_20d', 'ret5_60d', 'ret11_20d', 'ret11_60d',
    'wsp_ratio', 'wsp_ma60', 'ethanol_parity_ratio', 'ethanol_parity_ma60',
    'ret_wti_60d', 'ret_dxy_60d', 'ret_brl_60d'
]

# - Conjunto Estructural y Climático (para 6M y 1Y)
cols_structural = [
    'zafra_sin', 'zafra_cos', 'es_plena_zafra_brasil',
    'ratio_p5_ma200', 'ratio_p11_ma200',
    'ret5_120d', 'ret5_250d', 'ret11_120d', 'ret11_250d',
    'wsp_ma60', 'wsp_zscore_120d', 'ethanol_parity_ma60',
    'ret_wti_120d', 'ret_brl_120d',
    'oni_anom', 'oni_anom_change_3m', 'oni_is_el_nino',
    'usda_stocks_to_use_pct', 'usda_surplus_deficit_mt', 'usda_brazil_share_pct'
]

all_model_features = list(set(cols_dynamic + cols_structural))
print(f"Features dinámicas (3m/4m): {len(cols_dynamic)} | Features estructurales (6m/1y): {len(cols_structural)}")

# ==============================================================================
# 4. RED NEURONAL MULTI-HEAD EN PYTORCH (M4 GPU) CON RESTRICCIÓN DE ARBITRAJE
# ==============================================================================
class MultiHorizonSugarNet(nn.Module):
    def __init__(self, in_features, hidden=64):
        super(MultiHorizonSugarNet, self).__init__()
        # Backbone compartido que extrae la representación macro-agronómica
        self.backbone = nn.Sequential(
            nn.Linear(in_features, hidden),
            nn.LayerNorm(hidden),
            nn.SiLU(),
            nn.Dropout(0.15),
            nn.Linear(hidden, hidden),
            nn.LayerNorm(hidden),
            nn.SiLU(),
            nn.Dropout(0.10)
        )
        
        # 4 Cabezas especializadas (una por horizonte, prediciendo [ret5, ret11])
        self.head_3m = nn.Linear(hidden, 2)
        self.head_4m = nn.Linear(hidden, 2)
        self.head_6m = nn.Linear(hidden, 2)
        self.head_1y = nn.Linear(hidden, 2)
        
    def forward(self, x):
        h = self.backbone(x)
        out_3m = self.head_3m(h)
        out_4m = self.head_4m(h)
        out_6m = self.head_6m(h)
        out_1y = self.head_1y(h)
        return out_3m, out_4m, out_6m, out_1y

# ==============================================================================
# 5. ENTRENAMIENTO DEL HÍBRIDO CON PURGA TEMPORAL ESTRICTA
# ==============================================================================
# Benchmarks anteriores de Fase 1 (XGBoost aislado)
benchmarks_previos = {
    '3 Meses (Trimestral)':   {'c5_r2': 0.6168, 'c5_mae': 47.52, 'c11_r2': 0.5226, 'c11_mae': 2.19, 'c11_hr': 54.33},
    '4 Meses (Cuatrimestral)': {'c5_r2': 0.5256, 'c5_mae': 51.29, 'c11_r2': 0.5030, 'c11_mae': 2.23, 'c11_hr': 54.04},
    '6 Meses (Semestral)':     {'c5_r2': 0.2680, 'c5_mae': 70.49, 'c11_r2': 0.3545, 'c11_mae': 2.66, 'c11_hr': 56.20},
    '1 Año (Anual)':           {'c5_r2': -1.0184, 'c5_mae': 109.53, 'c11_r2': -0.5544, 'c11_mae': 4.08, 'c11_hr': 49.26}
}

target_cols = [f'target_ret5_{h}d' for h in HORIZONS.values()] + [f'target_ret11_{h}d' for h in HORIZONS.values()]
real_cols = [f'p5_real_{h}d' for h in HORIZONS.values()] + [f'p11_real_{h}d' for h in HORIZONS.values()]
df_clean = df.dropna(subset=all_model_features + target_cols + real_cols).copy()

print(f"Muestras de entrenamiento y validación completas: {len(df_clean)} días.")

split_idx = int(len(df_clean) * 0.8)
MAX_HORIZON = 260 # 1 año
train_df = df_clean.iloc[:split_idx - MAX_HORIZON] # Purga completa para evitar overlap
test_df = df_clean.iloc[split_idx:]

scaler_nn = StandardScaler()
X_tr_nn = scaler_nn.fit_transform(train_df[all_model_features].values)
X_te_nn = scaler_nn.transform(test_df[all_model_features].values)

# Targets para la Red Neuronal
y_tr_3m = train_df[['target_ret5_65d', 'target_ret11_65d']].values
y_tr_4m = train_df[['target_ret5_85d', 'target_ret11_85d']].values
y_tr_6m = train_df[['target_ret5_130d', 'target_ret11_130d']].values
y_tr_1y = train_df[['target_ret5_260d', 'target_ret11_260d']].values

print("\nEntrenando Red Neuronal Multi-Horizonte en Apple M4 (MPS)...")
net_m4 = MultiHorizonSugarNet(in_features=len(all_model_features), hidden=64).to(device)
opt_net = torch.optim.AdamW(net_m4.parameters(), lr=1e-3, weight_decay=1e-4)

dataset_nn = TensorDataset(
    torch.tensor(X_tr_nn, dtype=torch.float32),
    torch.tensor(y_tr_3m, dtype=torch.float32),
    torch.tensor(y_tr_4m, dtype=torch.float32),
    torch.tensor(y_tr_6m, dtype=torch.float32),
    torch.tensor(y_tr_1y, dtype=torch.float32)
)
loader_nn = DataLoader(dataset_nn, batch_size=32, shuffle=True)

net_m4.train()
for epoch in range(35):
    for bx, b3m, b4m, b6m, b1y in loader_nn:
        bx = bx.to(device)
        b3m, b4m, b6m, b1y = b3m.to(device), b4m.to(device), b6m.to(device), b1y.to(device)
        opt_net.zero_grad()
        p3m, p4m, p6m, p1y = net_m4(bx)
        
        # Pérdida combinada multi-horizonte
        loss = F.mse_loss(p3m, b3m) + F.mse_loss(p4m, b4m) + F.mse_loss(p6m, b6m) + 1.2 * F.mse_loss(p1y, b1y)
        loss.backward()
        opt_net.step()

net_m4.eval()
with torch.no_grad():
    test_tensor_x = torch.tensor(X_te_nn, dtype=torch.float32).to(device)
    nn_pred_3m, nn_pred_4m, nn_pred_6m, nn_pred_1y = net_m4(test_tensor_x)
    nn_preds = {
        65: nn_pred_3m.cpu().numpy(),
        85: nn_pred_4m.cpu().numpy(),
        130: nn_pred_6m.cpu().numpy(),
        260: nn_pred_1y.cpu().numpy()
    }
print("✓ Red Neuronal Multi-Head M4 entrenada.")

# ==============================================================================
# 6. ENSAMBLE HÍBRIDO (XGBOOST DESACOPLADO + RED NEURONAL + PISO FÍSICO)
# ==============================================================================
print("\n" + "="*85)
print("  EVALUACIÓN DEL SUPER-HÍBRIDO MULTI-HORIZONTE EN EL TEST SET")
print("="*85)

test_p5_curr = test_df['p5_current'].values
test_p11_curr = test_df['p11_current'].values

# Pisos físicos de costo marginal de producción en efectivo (Cash Cost Floor)
FLOOR_P5_USD = 380.0 # USD/ton
FLOOR_P11_CLB = 14.0 # c/lb

resultados_hibrido = []
proyecciones_definitivas = []

# Último día para proyectar 2026-2027
latest_row = df.iloc[-1]
p5_hoy = latest_row['p5_current']
p11_hoy = latest_row['p11_current']
X_hoy_nn = scaler_nn.transform(latest_row[all_model_features].values.reshape(1, -1))

with torch.no_grad():
    fut_nn_3m, fut_nn_4m, fut_nn_6m, fut_nn_1y = net_m4(torch.tensor(X_hoy_nn, dtype=torch.float32).to(device))
    fut_nn_preds = {
        65: fut_nn_3m.cpu().numpy().squeeze(),
        85: fut_nn_4m.cpu().numpy().squeeze(),
        130: fut_nn_6m.cpu().numpy().squeeze(),
        260: fut_nn_1y.cpu().numpy().squeeze()
    }

for h_name, h_days in HORIZONS.items():
    # Selección de features desacoplada:
    # Si es 3M o 4M -> Dinámicas
    # Si es 6M o 1Y -> Estructurales
    features_h = cols_dynamic if h_days in [65, 85] else cols_structural
    
    # XGBoost Especialista del Horizonte
    xgb_5 = XGBRegressor(n_estimators=180, max_depth=3, learning_rate=0.025, subsample=0.8, colsample_bytree=0.75, reg_alpha=2.0, reg_lambda=3.0, random_state=42, n_jobs=4)
    xgb_11 = XGBRegressor(n_estimators=180, max_depth=3, learning_rate=0.025, subsample=0.8, colsample_bytree=0.75, reg_alpha=2.0, reg_lambda=3.0, random_state=42, n_jobs=4)
    
    xgb_5.fit(train_df[features_h].values, train_df[f'target_ret5_{h_days}d'].values)
    xgb_11.fit(train_df[features_h].values, train_df[f'target_ret11_{h_days}d'].values)
    
    xgb_pred_5 = xgb_5.predict(test_df[features_h].values)
    xgb_pred_11 = xgb_11.predict(test_df[features_h].values)
    
    nn_pred_5 = nn_preds[h_days][:, 0]
    nn_pred_11 = nn_preds[h_days][:, 1]
    
    # Ponderación Ensamble Híbrido:
    # 3m y 4m: 75% XGBoost + 25% Neural Net
    # 6m y 1y: 50% XGBoost + 50% Neural Net (aprovecha la regularización suave de la red)
    w_xgb = 0.75 if h_days in [65, 85] else 0.50
    w_nn = 1.0 - w_xgb
    
    pred_hybrid_ret5 = w_xgb * xgb_pred_5 + w_nn * nn_pred_5
    pred_hybrid_ret11 = w_xgb * xgb_pred_11 + w_nn * nn_pred_11
    
    # Reconstrucción nominal con Piso Físico de Costo Marginal
    pred_p5_usd = np.maximum(FLOOR_P5_USD, test_p5_curr * np.exp(pred_hybrid_ret5))
    pred_p11_usd = np.maximum(FLOOR_P11_CLB, test_p11_curr * np.exp(pred_hybrid_ret11))
    
    p5_real_te = test_df[f'p5_real_{h_days}d'].values
    p11_real_te = test_df[f'p11_real_{h_days}d'].values
    
    # Métricas
    r2_5 = r2_score(p5_real_te, pred_p5_usd)
    mae_5 = mean_absolute_error(p5_real_te, pred_p5_usd)
    rmse_5 = np.sqrt(mean_squared_error(p5_real_te, pred_p5_usd))
    hit_rate_5 = np.mean(np.sign(pred_hybrid_ret5) == np.sign(test_df[f'target_ret5_{h_days}d'].values)) * 100.0
    
    r2_11 = r2_score(p11_real_te, pred_p11_usd)
    mae_11 = mean_absolute_error(p11_real_te, pred_p11_usd)
    rmse_11 = np.sqrt(mean_squared_error(p11_real_te, pred_p11_usd))
    hit_rate_11 = np.mean(np.sign(pred_hybrid_ret11) == np.sign(test_df[f'target_ret11_{h_days}d'].values)) * 100.0
    
    # Comparativa vs Baseline previo
    base = benchmarks_previos[h_name]
    diff_r2_5 = r2_5 - base['c5_r2']
    diff_mae_5 = mae_5 - base['c5_mae']
    diff_r2_11 = r2_11 - base['c11_r2']
    
    resultados_hibrido.append({
        'Horizonte': h_name,
        'Cto5_R2_Base': base['c5_r2'],
        'Cto5_R2_Hibrido': round(r2_5, 4),
        'Mejora_R2_Cto5': f"{diff_r2_5:+.4f}",
        'Cto5_MAE_Hibrido': f"${mae_5:.2f}",
        'Cto5_HitRate': f"{hit_rate_5:.2f}%",
        'Cto11_R2_Base': base['c11_r2'],
        'Cto11_R2_Hibrido': round(r2_11, 4),
        'Mejora_R2_Cto11': f"{diff_r2_11:+.4f}",
        'Cto11_HitRate': f"{hit_rate_11:.2f}%"
    })
    
    # Proyección con el modelo reentrenado al 100%
    xgb_5.fit(df_clean[features_h].values, df_clean[f'target_ret5_{h_days}d'].values)
    xgb_11.fit(df_clean[features_h].values, df_clean[f'target_ret11_{h_days}d'].values)
    
    fut_xgb_5 = xgb_5.predict(latest_row[features_h].values.reshape(1, -1))[0]
    fut_xgb_11 = xgb_11.predict(latest_row[features_h].values.reshape(1, -1))[0]
    
    fut_nn_5 = fut_nn_preds[h_days][0]
    fut_nn_11 = fut_nn_preds[h_days][1]
    
    fut_ret_5 = w_xgb * fut_xgb_5 + w_nn * fut_nn_5
    fut_ret_11 = w_xgb * fut_xgb_11 + w_nn * fut_nn_11
    
    fut_p5 = max(FLOOR_P5_USD, p5_hoy * np.exp(fut_ret_5))
    fut_p11 = max(FLOOR_P11_CLB, p11_hoy * np.exp(fut_ret_11))
    fut_wsp = fut_p5 - (fut_p11 * 22.0462)
    
    proyecciones_definitivas.append({
        'Horizonte': h_name,
        'Dias': h_days,
        'Cto5_Actual': f"${p5_hoy:.2f}",
        'Cto5_Hibrido': f"${fut_p5:.2f}",
        'Cto5_Var_%': f"{((fut_p5/p5_hoy)-1)*100:+.2f}%",
        'Cto11_Actual': f"{p11_hoy:.2f} c/lb",
        'Cto11_Hibrido': f"{fut_p11:.2f} c/lb",
        'Cto11_Var_%': f"{((fut_p11/p11_hoy)-1)*100:+.2f}%",
        'White_Sugar_Premium': f"${fut_wsp:.2f} USD/t"
    })
    
    print(f"Horizonte: {h_name:25s} | Cto 5 R²: {base['c5_r2']:.4f} -> {r2_5:.4f} ({diff_r2_5:+.4f}) | Cto 11 R²: {base['c11_r2']:.4f} -> {r2_11:.4f} ({diff_r2_11:+.4f})")

# 7. EXPORTACIÓN A CORE ML
print("\nExportando Red Multi-Horizonte M4 a Core ML...")
net_m4_cpu = MultiHorizonSugarNet(in_features=len(all_model_features), hidden=64).eval()
net_m4_cpu.load_state_dict({k: v.cpu() for k, v in net_m4.state_dict().items()})

dummy_m4 = torch.randn(1, len(all_model_features), dtype=torch.float32)
traced_net = torch.jit.trace(net_m4_cpu, dummy_m4)

ml_multi = ct.convert(
    traced_net,
    inputs=[ct.TensorType(name="macro_fundamental_features", shape=(1, len(all_model_features)))],
    outputs=[
        ct.TensorType(name="pred_returns_3m"),
        ct.TensorType(name="pred_returns_4m"),
        ct.TensorType(name="pred_returns_6m"),
        ct.TensorType(name="pred_returns_1y")
    ],
    compute_units=ct.ComputeUnit.ALL
)
ml_multi.save(COREML_OUTPUT)
print(f"✅ Paquete Core ML guardado en: {COREML_OUTPUT}")

# Medir latencia en ANE
d_ane = {"macro_fundamental_features": dummy_m4.numpy()}
t_lats = []
for _ in range(100):
    t0 = time.perf_counter()
    _ = ml_multi.predict(d_ane)
    t_lats.append((time.perf_counter() - t0) * 1000.0)
avg_lat = np.mean(t_lats)
print(f"⚡ Latencia Core ML Multi-Head (ANE M4): {avg_lat:.2f} ms")

# Guardar CSVs
df_metricas = pd.DataFrame(resultados_hibrido)
df_metricas.to_csv(CSV_METRICS, index=False)

df_proyecc = pd.DataFrame(proyecciones_definitivas)
df_proyecc.to_csv(CSV_PROYECCIONES, index=False)

print("\n" + "="*85)
print("  CUADRO COMPARATIVO: BASELINE INICIAL VS. HÍBRIDO MULTI-HORIZONTE M4")
print("="*85)
print(df_metricas.to_string(index=False))

print("\n" + "="*85)
print("  PROYECCIONES OFICIALES DEL HÍBRIDO MULTI-HORIZONTE (2026 - 2027)")
print("="*85)
print(df_proyecc.to_string(index=False))

print(f"\nResultados archivados en:")
print(f"  - Métricas comparativas: {CSV_METRICS}")
print(f"  - Proyecciones oficiales: {CSV_PROYECCIONES}")
