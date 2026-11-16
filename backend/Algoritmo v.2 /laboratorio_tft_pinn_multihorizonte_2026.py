import os
os.environ['OMP_NUM_THREADS'] = '1'
os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'
import time
import math
import warnings
import numpy as np
import pandas as pd

# PyTorch & Apple Silicon M4
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

CSV_METRICS = os.path.join(BASE_DIR, 'comparativa_tft_pinn_hibridos_2026.csv')
CSV_PROYECCIONES = os.path.join(BASE_DIR, 'proyecciones_tft_pinn_consensuadas_2026_2027.csv')
COREML_TFT = os.path.join(BASE_DIR, 'TFT_MultiHorizonte_M4.mlpackage')

print("="*85)
print("  LABORATORIO DE ARQUITECTURAS AVANZADAS DE LARGO PLAZO (Agro-IA 2026)")
print("  Modelo 1: Temporal Fusion Transformer (TFT) con Variable Selection Networks")
print("  Modelo 2: Physics-Informed Neural Network (PINN) con Costo Marginal y Co-integración")
print("  Modelo 3: Multi-Híbrido de Consenso (TFT + PINN + XGBoost Desacoplado)")
print("="*85)

# 1. Configuración de Hardware M4
device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
print(f"🚀 Acelerador activo: {device} (Apple M4 Metal Acceleration)")

# 2. Carga y Alineación de Datos
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

# Merge sin lookahead bias
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
    '3 Meses': 65,
    '4 Meses': 85,
    '6 Meses': 130,
    '1 Año': 260
}

for name, h in HORIZONS.items():
    df[f'target_ret5_{h}d'] = np.log(p5.shift(-h) / p5)
    df[f'target_ret11_{h}d'] = np.log(p11.shift(-h) / p11)
    df[f'p5_real_{h}d'] = p5.shift(-h)
    df[f'p11_real_{h}d'] = p11.shift(-h)

# Feature Engineering
months = df.index.month
df['zafra_sin'] = np.sin(2 * np.pi * months / 12.0)
df['zafra_cos'] = np.cos(2 * np.pi * months / 12.0)
df['es_plena_zafra_brasil'] = ((months >= 5) & (months <= 10)).astype(float)

df['ratio_p5_ma100'] = (p5 / p5.rolling(100).mean()) - 1.0
df['ratio_p5_ma200'] = (p5 / p5.rolling(200).mean()) - 1.0
df['ratio_p11_ma100'] = (p11 / p11.rolling(100).mean()) - 1.0
df['ratio_p11_ma200'] = (p11 / p11.rolling(200).mean()) - 1.0

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
    df['ret_dxy_120d'] = np.log(df_m['fx_dxy'] / df_m['fx_dxy'].shift(120))
if 'fx_brl' in df_m.columns:
    df['ret_brl_60d'] = np.log(df_m['fx_brl'] / df_m['fx_brl'].shift(60))
    df['ret_brl_120d'] = np.log(df_m['fx_brl'] / df_m['fx_brl'].shift(120))

df['oni_anom'] = df_m['oni_anom']
df['oni_anom_change_3m'] = df_m['oni_anom_change_3m']
df['oni_is_el_nino'] = df_m['oni_is_el_nino']
df['usda_stocks_to_use_pct'] = df_m['usda_stocks_to_use_pct']
df['usda_surplus_deficit_mt'] = df_m['usda_surplus_deficit_mt']
df['usda_brazil_share_pct'] = df_m['usda_brazil_share_pct']

# Features especializadas
cols_dynamic = [
    'zafra_sin', 'zafra_cos', 'es_plena_zafra_brasil',
    'ratio_p5_ma100', 'ratio_p5_ma200', 'ratio_p11_ma100', 'ratio_p11_ma200',
    'ret5_20d', 'ret5_60d', 'ret11_20d', 'ret11_60d',
    'wsp_ratio', 'wsp_ma60', 'ethanol_parity_ratio', 'ethanol_parity_ma60',
    'ret_wti_60d', 'ret_dxy_60d', 'ret_brl_60d'
]

cols_structural = [
    'zafra_sin', 'zafra_cos', 'es_plena_zafra_brasil',
    'ratio_p5_ma200', 'ratio_p11_ma200',
    'ret5_120d', 'ret5_250d', 'ret11_120d', 'ret11_250d',
    'wsp_ma60', 'wsp_zscore_120d', 'ethanol_parity_ma60',
    'ret_wti_120d', 'ret_brl_120d',
    'oni_anom', 'oni_anom_change_3m', 'oni_is_el_nino',
    'usda_stocks_to_use_pct', 'usda_surplus_deficit_mt', 'usda_brazil_share_pct'
]

feature_cols = list(set(cols_dynamic + cols_structural))
target_cols = [f'target_ret5_{h}d' for h in HORIZONS.values()] + [f'target_ret11_{h}d' for h in HORIZONS.values()]
real_cols = [f'p5_real_{h}d' for h in HORIZONS.values()] + [f'p11_real_{h}d' for h in HORIZONS.values()]

df_clean = df.dropna(subset=feature_cols + target_cols + real_cols).copy()
print(f"Muestras limpias totales: {len(df_clean)} días de cotización.")

# Split cronológico con purga de 260 días (1 año)
split_idx = int(len(df_clean) * 0.8)
MAX_PURGE = 260
train_df = df_clean.iloc[:split_idx - MAX_PURGE]
test_df = df_clean.iloc[split_idx:]

scaler = StandardScaler()
X_tr = scaler.fit_transform(train_df[feature_cols].values)
X_te = scaler.transform(test_df[feature_cols].values)

# Targets agrupados por horizonte
Y_tr = {
    65: train_df[['target_ret5_65d', 'target_ret11_65d']].values,
    85: train_df[['target_ret5_85d', 'target_ret11_85d']].values,
    130: train_df[['target_ret5_130d', 'target_ret11_130d']].values,
    260: train_df[['target_ret5_260d', 'target_ret11_260d']].values
}

test_p5_curr = test_df['p5_current'].values
test_p11_curr = test_df['p11_current'].values

# ==============================================================================
# MODELO 1: TEMPORAL FUSION TRANSFORMER (TFT) EN PYTORCH M4
# ==============================================================================
print("\n" + "="*85)
print("  [1/3] ENTRENANDO MODELO 1: TEMPORAL FUSION TRANSFORMER (TFT)")
print("  Variable Selection Network (VSN) + Gated Residual Networks (GRN)")
print("="*85)

class GatedLinearUnit(nn.Module):
    def __init__(self, d_in, d_out):
        super(GatedLinearUnit, self).__init__()
        self.fc = nn.Linear(d_in, d_out * 2)
    def forward(self, x):
        h = self.fc(x)
        val, gate = torch.chunk(h, 2, dim=-1)
        return val * torch.sigmoid(gate)

class GatedResidualNetwork(nn.Module):
    def __init__(self, d_model, dropout=0.1):
        super(GatedResidualNetwork, self).__init__()
        self.layer1 = nn.Linear(d_model, d_model)
        self.glu = GatedLinearUnit(d_model, d_model)
        self.norm = nn.LayerNorm(d_model)
        self.drop = nn.Dropout(dropout)
    def forward(self, x):
        h = F.gelu(self.layer1(x))
        h = self.drop(self.glu(h))
        return self.norm(x + h)

class VariableSelectionNetwork(nn.Module):
    def __init__(self, num_features, d_model):
        super(VariableSelectionNetwork, self).__init__()
        self.num_features = num_features
        self.d_model = d_model
        # Proyección individual de cada feature
        self.feature_projections = nn.ModuleList([nn.Linear(1, d_model) for _ in range(num_features)])
        # Gating softmax para aprender qué features son relevantes por horizonte
        self.softmax_weights = nn.Linear(num_features, num_features)
        self.grn = GatedResidualNetwork(d_model)

    def forward(self, x):
        # x: [B, num_features]
        weights = F.softmax(self.softmax_weights(x), dim=-1) # [B, num_features]
        # Proyectar cada feature a d_model
        projected = []
        for i in range(self.num_features):
            fi = x[:, i:i+1] # [B, 1]
            proj_i = self.feature_projections[i](fi) # [B, d_model]
            projected.append(proj_i.unsqueeze(1)) # [B, 1, d_model]
            
        stacked = torch.cat(projected, dim=1) # [B, num_features, d_model]
        weighted = torch.sum(stacked * weights.unsqueeze(-1), dim=1) # [B, d_model]
        return self.grn(weighted)

class TemporalFusionTransformer(nn.Module):
    def __init__(self, num_features, d_model=48, heads=4):
        super(TemporalFusionTransformer, self).__init__()
        self.vsn = VariableSelectionNetwork(num_features, d_model)
        self.attn = nn.MultiheadAttention(d_model, heads, batch_first=True)
        self.norm = nn.LayerNorm(d_model)
        self.grn_post = GatedResidualNetwork(d_model)
        
        # 4 Cabezas decodificadoras multi-horizonte (ret5, ret11)
        self.head_3m = nn.Linear(d_model, 2)
        self.head_4m = nn.Linear(d_model, 2)
        self.head_6m = nn.Linear(d_model, 2)
        self.head_1y = nn.Linear(d_model, 2)

    def forward(self, x):
        h = self.vsn(x).unsqueeze(1) # [B, 1, d_model]
        att_out, _ = self.attn(h, h, h)
        h = self.norm(h + att_out).squeeze(1) # [B, d_model]
        h = self.grn_post(h)
        return self.head_3m(h), self.head_4m(h), self.head_6m(h), self.head_1y(h)

tft_net = TemporalFusionTransformer(num_features=len(feature_cols), d_model=48, heads=4).to(device)
opt_tft = torch.optim.AdamW(tft_net.parameters(), lr=1e-3, weight_decay=1e-4)

ds_tft = TensorDataset(
    torch.tensor(X_tr, dtype=torch.float32),
    torch.tensor(Y_tr[65], dtype=torch.float32),
    torch.tensor(Y_tr[85], dtype=torch.float32),
    torch.tensor(Y_tr[130], dtype=torch.float32),
    torch.tensor(Y_tr[260], dtype=torch.float32)
)
loader_tft = DataLoader(ds_tft, batch_size=32, shuffle=True)

tft_net.train()
for epoch in range(35):
    for bx, b65, b85, b130, b260 in loader_tft:
        bx = bx.to(device)
        b65, b85, b130, b260 = b65.to(device), b85.to(device), b130.to(device), b260.to(device)
        opt_tft.zero_grad()
        p65, p85, p130, p260 = tft_net(bx)
        loss = F.mse_loss(p65, b65) + F.mse_loss(p85, b85) + F.mse_loss(p130, b130) + 1.2 * F.mse_loss(p260, b260)
        loss.backward()
        opt_tft.step()

tft_net.eval()
with torch.no_grad():
    x_te_tensor = torch.tensor(X_te, dtype=torch.float32).to(device)
    tft_65, tft_85, tft_130, tft_260 = tft_net(x_te_tensor)
    tft_preds = {
        65: tft_65.cpu().numpy(),
        85: tft_85.cpu().numpy(),
        130: tft_130.cpu().numpy(),
        260: tft_260.cpu().numpy()
    }
print("✓ Temporal Fusion Transformer (TFT) entrenado exitosamente en M4.")

# ==============================================================================
# MODELO 2: RED CO-INTEGRADA CON RESTRICCIONES FÍSICAS (PINN)
# ==============================================================================
print("\n" + "="*85)
print("  [2/3] ENTRENANDO MODELO 2: PHYSICS-INFORMED NEURAL NETWORK (PINN)")
print("  Pérdida de Paridad WSP + Penalización Asimétrica de Costo Marginal de Producción")
print("="*85)

class PhysicsInformedSugarNet(nn.Module):
    def __init__(self, in_features, hidden=64):
        super(PhysicsInformedSugarNet, self).__init__()
        self.dense = nn.Sequential(
            nn.Linear(in_features, hidden),
            nn.SiLU(),
            nn.Linear(hidden, hidden),
            nn.SiLU()
        )
        self.head_65 = nn.Linear(hidden, 2)
        self.head_85 = nn.Linear(hidden, 2)
        self.head_130 = nn.Linear(hidden, 2)
        self.head_260 = nn.Linear(hidden, 2)

    def forward(self, x):
        h = self.dense(x)
        return self.head_65(h), self.head_85(h), self.head_130(h), self.head_260(h)

pinn_net = PhysicsInformedSugarNet(in_features=len(feature_cols)).to(device)
opt_pinn = torch.optim.AdamW(pinn_net.parameters(), lr=1e-3, weight_decay=1e-4)

# Función de pérdida informada por la física del mercado
# Castiga predicciones que violen el White Sugar Premium o violen el piso de costos de Brasil
def pinn_loss(pred, true, p5_base, p11_base):
    # Error estándar
    mse = F.mse_loss(pred, true)
    
    # Precios proyectados
    p5_est = p5_base * torch.exp(pred[:, 0])
    p11_est = p11_base * torch.exp(pred[:, 1])
    
    # 1. Restricción de paridad física WSP (spread debe estar entre $70 y $160 USD/ton)
    wsp_est = p5_est - (p11_est * 22.0462)
    wsp_violation = torch.relu(70.0 - wsp_est) + torch.relu(wsp_est - 170.0)
    loss_wsp = torch.mean(wsp_violation**2) * 0.001
    
    # 2. Piso de costo marginal físico (Cash Cost: $380/t blanco, 14 c/lb crudo)
    floor_violation_5 = torch.relu(380.0 - p5_est)
    floor_violation_11 = torch.relu(14.0 - p11_est)
    loss_floor = (torch.mean(floor_violation_5**2) + torch.mean(floor_violation_11**2)) * 0.01
    
    return mse + loss_wsp + loss_floor

p5_tr_tensor = torch.tensor(train_df['p5_current'].values, dtype=torch.float32)
p11_tr_tensor = torch.tensor(train_df['p11_current'].values, dtype=torch.float32)

ds_pinn = TensorDataset(
    torch.tensor(X_tr, dtype=torch.float32),
    torch.tensor(Y_tr[65], dtype=torch.float32),
    torch.tensor(Y_tr[85], dtype=torch.float32),
    torch.tensor(Y_tr[130], dtype=torch.float32),
    torch.tensor(Y_tr[260], dtype=torch.float32),
    p5_tr_tensor,
    p11_tr_tensor
)
loader_pinn = DataLoader(ds_pinn, batch_size=32, shuffle=True)

pinn_net.train()
for epoch in range(35):
    for bx, b65, b85, b130, b260, bp5, bp11 in loader_pinn:
        bx, b65, b85, b130, b260 = bx.to(device), b65.to(device), b85.to(device), b130.to(device), b260.to(device)
        bp5, bp11 = bp5.to(device), bp11.to(device)
        opt_pinn.zero_grad()
        p65, p85, p130, p260 = pinn_net(bx)
        loss = (pinn_loss(p65, b65, bp5, bp11) +
                pinn_loss(p85, b85, bp5, bp11) +
                pinn_loss(p130, b130, bp5, bp11) +
                1.5 * pinn_loss(p260, b260, bp5, bp11))
        loss.backward()
        opt_pinn.step()

pinn_net.eval()
with torch.no_grad():
    pinn_65, pinn_85, pinn_130, pinn_260 = pinn_net(x_te_tensor)
    pinn_preds = {
        65: pinn_65.cpu().numpy(),
        85: pinn_85.cpu().numpy(),
        130: pinn_130.cpu().numpy(),
        260: pinn_260.cpu().numpy()
    }
print("✓ Physics-Informed Neural Network (PINN) entrenada con restricciones físicas.")

# ==============================================================================
# MODELO 3: MULTI-HÍBRIDO DE CONSENSO (TFT + PINN + XGBOOST DESACOPLADO)
# ==============================================================================
print("\n" + "="*85)
print("  [3/3] EVALUANDO Y COMPARANDO TODOS LOS MODELOS EN EL TEST SET CIEGO")
print("="*85)

# XGBoost Desacoplado
xgb_models = {}
for h_days in HORIZONS.values():
    feat_h = cols_dynamic if h_days in [65, 85] else cols_structural
    xgb5 = XGBRegressor(n_estimators=180, max_depth=3, learning_rate=0.025, subsample=0.8, colsample_bytree=0.75, reg_alpha=2.0, reg_lambda=3.0, random_state=42, n_jobs=4)
    xgb11 = XGBRegressor(n_estimators=180, max_depth=3, learning_rate=0.025, subsample=0.8, colsample_bytree=0.75, reg_alpha=2.0, reg_lambda=3.0, random_state=42, n_jobs=4)
    xgb5.fit(train_df[feat_h].values, train_df[f'target_ret5_{h_days}d'].values)
    xgb11.fit(train_df[feat_h].values, train_df[f'target_ret11_{h_days}d'].values)
    xgb_models[h_days] = (xgb5, xgb11, feat_h)

resultados_completos = []

# Última fila para proyecciones
latest_row = df.iloc[-1]
p5_hoy = latest_row['p5_current']
p11_hoy = latest_row['p11_current']
x_hoy_all = scaler.transform(latest_row[feature_cols].values.reshape(1, -1))
x_hoy_tensor = torch.tensor(x_hoy_all, dtype=torch.float32).to(device)

with torch.no_grad():
    f_tft = tft_net(x_hoy_tensor)
    f_pinn = pinn_net(x_hoy_tensor)

proyecciones_tabla = []

for h_name, h_days in HORIZONS.items():
    p5_real = test_df[f'p5_real_{h_days}d'].values
    p11_real = test_df[f'p11_real_{h_days}d'].values
    
    # 1. Predicciones TFT
    tft_ret5 = tft_preds[h_days][:, 0]
    tft_p5 = test_p5_curr * np.exp(tft_ret5)
    r2_tft_5 = r2_score(p5_real, tft_p5)
    mae_tft_5 = mean_absolute_error(p5_real, tft_p5)
    
    # 2. Predicciones PINN
    pinn_ret5 = pinn_preds[h_days][:, 0]
    pinn_p5 = test_p5_curr * np.exp(pinn_ret5)
    r2_pinn_5 = r2_score(p5_real, pinn_p5)
    mae_pinn_5 = mean_absolute_error(p5_real, pinn_p5)
    
    # 3. Predicciones XGBoost Desacoplado
    xgb5, xgb11, feat_h = xgb_models[h_days]
    xgb_ret5 = xgb5.predict(test_df[feat_h].values)
    xgb_p5 = test_p5_curr * np.exp(xgb_ret5)
    r2_xgb_5 = r2_score(p5_real, xgb_p5)
    mae_xgb_5 = mean_absolute_error(p5_real, xgb_p5)
    
    # 4. MULTI-HÍBRIDO DE CONSENSO (Ensamble Ponderado)
    # 3M y 4M: 60% XGBoost (mejor en corto) + 20% TFT + 20% PINN
    # 6M y 1Y: 35% TFT (mejor en clima) + 35% PINN (restricción física) + 30% XGBoost
    if h_days in [65, 85]:
        cons_ret5 = 0.60 * xgb_ret5 + 0.20 * tft_ret5 + 0.20 * pinn_ret5
        xgb_ret11 = xgb11.predict(test_df[feat_h].values)
        cons_ret11 = 0.60 * xgb_ret11 + 0.20 * tft_preds[h_days][:, 1] + 0.20 * pinn_preds[h_days][:, 1]
    else:
        cons_ret5 = 0.30 * xgb_ret5 + 0.35 * tft_ret5 + 0.35 * pinn_ret5
        xgb_ret11 = xgb11.predict(test_df[feat_h].values)
        cons_ret11 = 0.30 * xgb_ret11 + 0.35 * tft_preds[h_days][:, 1] + 0.35 * pinn_preds[h_days][:, 1]
        
    cons_p5 = np.maximum(380.0, test_p5_curr * np.exp(cons_ret5))
    cons_p11 = np.maximum(14.0, test_p11_curr * np.exp(cons_ret11))
    
    r2_cons_5 = r2_score(p5_real, cons_p5)
    mae_cons_5 = mean_absolute_error(p5_real, cons_p5)
    hr_cons_5 = np.mean(np.sign(cons_ret5) == np.sign(test_df[f'target_ret5_{h_days}d'].values)) * 100.0
    
    r2_cons_11 = r2_score(p11_real, cons_p11)
    mae_cons_11 = mean_absolute_error(p11_real, cons_p11)
    hr_cons_11 = np.mean(np.sign(cons_ret11) == np.sign(test_df[f'target_ret11_{h_days}d'].values)) * 100.0
    
    resultados_completos.append({
        'Horizonte': h_name,
        'Dias': h_days,
        'R2_XGB_Base': round(r2_xgb_5, 4),
        'R2_TFT_Net': round(r2_tft_5, 4),
        'R2_PINN_Fisica': round(r2_pinn_5, 4),
        'R2_MultiHibrido': round(r2_cons_5, 4),
        'MAE_MultiHibrido_USD': f"${mae_cons_5:.2f}",
        'HitRate_Cto5': f"{hr_cons_5:.2f}%",
        'HitRate_Cto11': f"{hr_cons_11:.2f}%"
    })
    
    # Proyección con Consenso
    idx_h = list(HORIZONS.values()).index(h_days)
    fut_tft_5 = f_tft[idx_h].cpu().numpy().squeeze()[0]
    fut_tft_11 = f_tft[idx_h].cpu().numpy().squeeze()[1]
    
    fut_pinn_5 = f_pinn[idx_h].cpu().numpy().squeeze()[0]
    fut_pinn_11 = f_pinn[idx_h].cpu().numpy().squeeze()[1]
    
    fut_xgb_5 = xgb5.predict(latest_row[feat_h].values.reshape(1, -1))[0]
    fut_xgb_11 = xgb11.predict(latest_row[feat_h].values.reshape(1, -1))[0]
    
    if h_days in [65, 85]:
        final_ret5 = 0.60 * fut_xgb_5 + 0.20 * fut_tft_5 + 0.20 * fut_pinn_5
        final_ret11 = 0.60 * fut_xgb_11 + 0.20 * fut_tft_11 + 0.20 * fut_pinn_11
    else:
        final_ret5 = 0.30 * fut_xgb_5 + 0.35 * fut_tft_5 + 0.35 * fut_pinn_5
        final_ret11 = 0.30 * fut_xgb_11 + 0.35 * fut_tft_11 + 0.35 * fut_pinn_11
        
    final_p5 = max(380.0, p5_hoy * np.exp(final_ret5))
    final_p11 = max(14.0, p11_hoy * np.exp(final_ret11))
    final_wsp = final_p5 - (final_p11 * 22.0462)
    
    proyecciones_tabla.append({
        'Horizonte': h_name,
        'Dias': h_days,
        'Cto5_Actual': f"${p5_hoy:.2f}",
        'Cto5_MultiHibrido': f"${final_p5:.2f}",
        'Cto5_Var_%': f"{((final_p5/p5_hoy)-1)*100:+.2f}%",
        'Cto11_Actual': f"{p11_hoy:.2f} c/lb",
        'Cto11_MultiHibrido': f"{final_p11:.2f} c/lb",
        'Cto11_Var_%': f"{((final_p11/p11_hoy)-1)*100:+.2f}%",
        'White_Sugar_Premium': f"${final_wsp:.2f} USD/t"
    })
    
    print(f"Horizonte: {h_name:10s} | R² XGB: {r2_xgb_5:+.4f} | R² TFT: {r2_tft_5:+.4f} | R² PINN: {r2_pinn_5:+.4f} ==> R² Multi-Híbrido: {r2_cons_5:+.4f} (MAE: ${mae_cons_5:.2f})")

# Guardar DataFrames antes de exportación
df_res = pd.DataFrame(resultados_completos)
df_res.to_csv(CSV_METRICS, index=False)

df_p = pd.DataFrame(proyecciones_tabla)
df_p.to_csv(CSV_PROYECCIONES, index=False)

print("\n" + "="*85)
print("  CUADRO COMPARATIVO DE TODAS LAS ARQUITECTURAS DE LARGO PLAZO (Agro-IA 2026)")
print("="*85)
print(df_res.to_string(index=False))

print("\n" + "="*85)
print("  PROYECCIONES FINALES DEL MULTI-HÍBRIDO CONSENSUADO (2026 - 2027)")
print("="*85)
print(df_p.to_string(index=False))

# Exportar TFT a Core ML
print("\nExportando Temporal Fusion Transformer (TFT) a Core ML...")
try:
    tft_net_cpu = TemporalFusionTransformer(num_features=len(feature_cols), d_model=48, heads=4).eval()
    tft_net_cpu.load_state_dict({k: v.cpu() for k, v in tft_net.state_dict().items()})

    dummy_x = torch.randn(1, len(feature_cols), dtype=torch.float32)
    traced_tft = torch.jit.trace(tft_net_cpu, dummy_x, check_trace=False)

    ml_tft = ct.convert(
        traced_tft,
        inputs=[ct.TensorType(name="features", shape=(1, len(feature_cols)))],
        outputs=[
            ct.TensorType(name="pred_returns_3m"),
            ct.TensorType(name="pred_returns_4m"),
            ct.TensorType(name="pred_returns_6m"),
            ct.TensorType(name="pred_returns_1y")
        ],
        compute_units=ct.ComputeUnit.ALL
    )
    ml_tft.save(COREML_TFT)
    print(f"✅ Paquete Core ML TFT guardado: {COREML_TFT}")
except Exception as e:
    print(f"⚠️ Nota de exportación Core ML: {e}")

print(f"\nResultados guardados en:")
print(f"  - {CSV_METRICS}")
print(f"  - {CSV_PROYECCIONES}")

