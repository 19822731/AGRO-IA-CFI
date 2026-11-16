import os
os.environ['OMP_NUM_THREADS'] = '1'
os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'
import time
import math
import warnings
import numpy as np
import pandas as pd

# ML & Deep Learning
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
CSV_METRICS = os.path.join(BASE_DIR, 'comparativa_global_campeones_2026.csv')
COREML_OUTPUT = os.path.join(BASE_DIR, 'MoE_Ensemble_M4.mlpackage')

print("="*85)
print("  OPCIÓN D: DYNAMIC REGIME-SWITCHING MIXTURE OF EXPERTS (MoE) & CONFORMAL PREDICTION")
print("  Especialistas: XGBoost Macro + Multi-Task Arbitrage + Wavelet Temporal Transformer")
print("="*85)

# 1. Configuración Hardware Apple M4
device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
print(f"🚀 Acelerador activo: {device} (Apple M4 Metal Acceleration)")

# 2. Carga y Preparación de Datos
df_raw = pd.read_csv(DATA_FILE, index_col=0, parse_dates=True)
df_raw.sort_index(inplace=True)

HORIZON = 7 # D+7

p5 = df_raw['sugar_5']
p11 = df_raw['sugar_11']
wsp = df_raw['white_sugar_premium']

df = pd.DataFrame(index=df_raw.index)

# Retornos base
df['ret5_1d'] = np.log(p5 / p5.shift(1))
df['ret11_1d'] = np.log(p11 / p11.shift(1))

# Multiescala Wavelet
trend_low = df['ret5_1d'].rolling(21, min_periods=1).mean()
df['wavelet_approx_trend'] = trend_low
df['wavelet_detail_cycle'] = df['ret5_1d'].rolling(5, min_periods=1).mean() - trend_low
df['wavelet_detail_noise'] = df['ret5_1d'] - df['ret5_1d'].rolling(5, min_periods=1).mean()

trend11_low = df['ret11_1d'].rolling(21, min_periods=1).mean()
df['wavelet_approx_trend11'] = trend11_low
df['wavelet_detail_cycle11'] = df['ret11_1d'].rolling(5, min_periods=1).mean() - trend11_low
df['wavelet_detail_noise11'] = df['ret11_1d'] - df['ret11_1d'].rolling(5, min_periods=1).mean()

# Lags
for lag in [1, 2, 3, 5, 7, 14, 21]:
    df[f'ret5_{lag}d'] = np.log(p5 / p5.shift(lag))
    df[f'ret11_{lag}d'] = np.log(p11 / p11.shift(lag))

# Ratios y Arbitraje WSP
df['wsp_ratio'] = wsp / p5
df['wsp_ret7d'] = df['wsp_ratio'] - df['wsp_ratio'].shift(7)

# --- VARIABLES INDICADORAS DE RÉGIMEN PARA EL GATING ROUTER ---
# 1. Volatilidad realizada y ratio de aceleración
df['regime_vol14d'] = df['ret5_1d'].rolling(14).std()
df['regime_vol_ratio'] = df['ret5_1d'].rolling(5).std() / (df['regime_vol14d'] + 1e-6)
# 2. Fuerza de tendencia (Momentum macro)
df['regime_trend_strength'] = np.abs(df['ret5_21d'])
# 3. Z-Score de tensión del Arbitraje White Sugar Premium
wsp_rolling_mean = wsp.rolling(30).mean()
wsp_rolling_std = wsp.rolling(30).std() + 1e-6
df['regime_wsp_zscore'] = np.abs((wsp - wsp_rolling_mean) / wsp_rolling_std)

# Variables macro
if 'oil_wti' in df_raw.columns:
    df['ret_oil_1d'] = np.log(df_raw['oil_wti'] / df_raw['oil_wti'].shift(1))
    df['ret_oil_7d'] = np.log(df_raw['oil_wti'] / df_raw['oil_wti'].shift(7))
if 'fx_dxy' in df_raw.columns:
    df['ret_dxy_1d'] = np.log(df_raw['fx_dxy'] / df_raw['fx_dxy'].shift(1))
if 'fx_brl' in df_raw.columns:
    df['ret_brl_1d'] = np.log(df_raw['fx_brl'] / df_raw['fx_brl'].shift(1))

# Targets
df['target_ret5_7d'] = np.log(p5.shift(-HORIZON) / p5)
df['target_ret11_7d'] = np.log(p11.shift(-HORIZON) / p11)
df['target_wsp_diff'] = (wsp.shift(-HORIZON) - wsp) / p5

df['p5_current'] = p5
df['p11_current'] = p11
df['p5_target_real'] = p5.shift(-HORIZON)

# Limpieza
regime_cols = ['regime_vol14d', 'regime_vol_ratio', 'regime_trend_strength', 'regime_wsp_zscore']
feature_cols = [c for c in df.columns if not c.startswith('target_') and not c.startswith('p5_') and not c.startswith('p11_')]

df_clean = df.dropna().copy()
print(f"Dataset total limpio: {len(df_clean)} días de cotización (2010 a 2026).")

# Split 80% Train / 20% Test idéntico
split_idx = int(len(df_clean) * 0.8)
train_df = df_clean.iloc[:split_idx]
test_df = df_clean.iloc[split_idx:]

# Para calibración Conformal y Gating, separamos la última porción del train (20% de train = validation/calibration)
calib_idx = int(len(train_df) * 0.8)
fit_df = train_df.iloc[:calib_idx]
calib_df = train_df.iloc[calib_idx:]

LOOKBACK = 30
scaler_features = StandardScaler()
X_fit_s = scaler_features.fit_transform(fit_df[feature_cols].values)
X_calib_s = scaler_features.transform(calib_df[feature_cols].values)
X_test_s = scaler_features.transform(test_df[feature_cols].values)

# Secuencias para modelos de Deep Learning
def to_seq(X, y5, y11, lookback=LOOKBACK):
    Xs, ys = [], []
    for i in range(len(X) - lookback):
        Xs.append(X[i:i+lookback])
        ys.append([y5[i+lookback], y11[i+lookback]])
    return np.array(Xs, dtype=np.float32), np.array(ys, dtype=np.float32)

X_fit_seq, y_fit_seq = to_seq(X_fit_s, fit_df['target_ret5_7d'].values, fit_df['target_ret11_7d'].values)
X_calib_seq, y_calib_seq = to_seq(X_calib_s, calib_df['target_ret5_7d'].values, calib_df['target_ret11_7d'].values)
X_test_seq, y_test_seq = to_seq(X_test_s, test_df['target_ret5_7d'].values, test_df['target_ret11_7d'].values)

# Subconjuntos alineados para modelos tabulares (índice a partir de LOOKBACK)
X_fit_tab = X_fit_s[LOOKBACK:]
y_fit_tab = fit_df['target_ret5_7d'].values[LOOKBACK:]

X_calib_tab = X_calib_s[LOOKBACK:]
y_calib_tab = calib_df['target_ret5_7d'].values[LOOKBACK:]
calib_p5_curr = calib_df['p5_current'].values[LOOKBACK:]
calib_p5_real = calib_df['p5_target_real'].values[LOOKBACK:]
calib_regime = calib_df[regime_cols].values[LOOKBACK:]

X_test_tab = X_test_s[LOOKBACK:]
y_test_tab = test_df['target_ret5_7d'].values[LOOKBACK:]
test_p5_curr = test_df['p5_current'].values[LOOKBACK:]
test_p5_real = test_df['p5_target_real'].values[LOOKBACK:]
test_regime = test_df[regime_cols].values[LOOKBACK:]

print(f"Muestras de Fit: {len(X_fit_seq)} | Calibración MoE: {len(X_calib_seq)} | Test Ciego: {len(X_test_seq)}")

# ==============================================================================
# 3. ENTRENAMIENTO DE LOS 3 EXPERTOS ESPECIALIZADOS
# ==============================================================================

# --- EXPERTO 1: XGBoost Macro Specialist ---
print("\n[1/3] Entrenando Experto 1: XGBoost Regressor (Especialista en Shocks Macro)...")
expert_xgb = XGBRegressor(
    n_estimators=180,
    max_depth=5,
    learning_rate=0.03,
    subsample=0.85,
    colsample_bytree=0.85,
    random_state=42,
    n_jobs=4
)
expert_xgb.fit(X_fit_tab, y_fit_tab)

pred_calib_xgb = expert_xgb.predict(X_calib_tab)
pred_test_xgb = expert_xgb.predict(X_test_tab)
print("  ✓ Experto 1 listo.")

# --- EXPERTO 2: Multi-Task Dual Arbitrage Network ---
print("[2/3] Entrenando Experto 2: Multi-Task Co-integrated Net (Especialista en Arbitraje WSP)...")
class MultiTaskNet(nn.Module):
    def __init__(self, in_features, hidden=64):
        super(MultiTaskNet, self).__init__()
        self.fc = nn.Sequential(
            nn.Linear(in_features, hidden),
            nn.SiLU(),
            nn.Dropout(0.1),
            nn.Linear(hidden, hidden),
            nn.SiLU()
        )
        self.head5 = nn.Linear(hidden, 1)
        self.head11 = nn.Linear(hidden, 1)
        
    def forward(self, x):
        h = self.fc(x)
        return self.head5(h), self.head11(h)

expert_multitask = MultiTaskNet(in_features=len(feature_cols)).to(device)
opt_mt = torch.optim.AdamW(expert_multitask.parameters(), lr=1e-3, weight_decay=1e-4)
loader_mt = DataLoader(TensorDataset(torch.tensor(X_fit_tab, dtype=torch.float32), 
                                     torch.tensor(y_fit_tab, dtype=torch.float32),
                                     torch.tensor(fit_df['target_ret11_7d'].values[LOOKBACK:], dtype=torch.float32)), 
                       batch_size=32, shuffle=True)

expert_multitask.train()
for epoch in range(25):
    for bx, by5, by11 in loader_mt:
        bx, by5, by11 = bx.to(device), by5.to(device), by11.to(device)
        opt_mt.zero_grad()
        p5_pred, p11_pred = expert_multitask(bx)
        # Pérdida combinada con restricción suave de paridad
        loss = F.mse_loss(p5_pred.squeeze(), by5) + F.mse_loss(p11_pred.squeeze(), by11)
        loss.backward()
        opt_mt.step()

expert_multitask.eval()
with torch.no_grad():
    pred_calib_mt, _ = expert_multitask(torch.tensor(X_calib_tab, dtype=torch.float32).to(device))
    pred_calib_mt = pred_calib_mt.cpu().numpy().squeeze()
    pred_test_mt, _ = expert_multitask(torch.tensor(X_test_tab, dtype=torch.float32).to(device))
    pred_test_mt = pred_test_mt.cpu().numpy().squeeze()
print("  ✓ Experto 2 listo.")

# --- EXPERTO 3: Wavelet Temporal Transformer ---
print("[3/3] Entrenando Experto 3: Wavelet Temporal Transformer (Especialista en Auto-Atención Multiescala)...")
class PositionalEncoding(nn.Module):
    def __init__(self, d_model, max_len=100):
        super(PositionalEncoding, self).__init__()
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model))
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        self.register_buffer('pe', pe.unsqueeze(0))
    def forward(self, x): return x + self.pe[:, :x.size(1), :]

class MiniTransformerBlock(nn.Module):
    def __init__(self, d_model=48, heads=4):
        super(MiniTransformerBlock, self).__init__()
        self.norm1 = nn.LayerNorm(d_model)
        self.attn = nn.MultiheadAttention(d_model, heads, batch_first=True)
        self.norm2 = nn.LayerNorm(d_model)
        self.ffn = nn.Sequential(nn.Linear(d_model, 96), nn.GELU(), nn.Linear(96, d_model))
    def forward(self, x):
        nx = self.norm1(x)
        ax, _ = self.attn(nx, nx, nx)
        x = x + ax
        return x + self.ffn(self.norm2(x))

class WaveletTransformerExpert(nn.Module):
    def __init__(self, in_features, d_model=48):
        super(WaveletTransformerExpert, self).__init__()
        self.proj = nn.Linear(in_features, d_model)
        self.pe = PositionalEncoding(d_model)
        self.block1 = MiniTransformerBlock(d_model=d_model, heads=4)
        self.block2 = MiniTransformerBlock(d_model=d_model, heads=4)
        self.pool = nn.Linear(d_model, 1)
        self.head = nn.Linear(d_model, 1)
    def forward(self, x):
        h = self.pe(self.proj(x))
        h = self.block1(h)
        h = self.block2(h)
        w = F.softmax(self.pool(h), dim=1)
        pooled = torch.sum(h * w, dim=1)
        return self.head(pooled)

expert_trans = WaveletTransformerExpert(in_features=len(feature_cols)).to(device)
opt_tr = torch.optim.AdamW(expert_trans.parameters(), lr=1e-3, weight_decay=1e-4)
loader_tr = DataLoader(TensorDataset(torch.tensor(X_fit_seq, dtype=torch.float32),
                                     torch.tensor(y_fit_seq[:, 0], dtype=torch.float32)),
                       batch_size=32, shuffle=True)

expert_trans.train()
for epoch in range(25):
    for bx, by in loader_tr:
        bx, by = bx.to(device), by.to(device)
        opt_tr.zero_grad()
        loss = F.mse_loss(expert_trans(bx).squeeze(), by)
        loss.backward()
        opt_tr.step()

expert_trans.eval()
with torch.no_grad():
    pred_calib_trans = expert_trans(torch.tensor(X_calib_seq, dtype=torch.float32).to(device)).cpu().numpy().squeeze()
    pred_test_trans = expert_trans(torch.tensor(X_test_seq, dtype=torch.float32).to(device)).cpu().numpy().squeeze()
print("  ✓ Experto 3 listo.")

# ==============================================================================
# 4. GATING ROUTER ADAPTATIVO (MIXTURE OF EXPERTS)
# ==============================================================================
print("\n[4/4] Entrenando Gating Router Adaptativo para detectar Regímenes de Mercado...")

# Matriz de predicciones de los expertos en el fold de calibración
P_calib = np.stack([pred_calib_xgb, pred_calib_mt, pred_calib_trans], axis=1) # [N, 3]
P_test = np.stack([pred_test_xgb, pred_test_mt, pred_test_trans], axis=1)

scaler_regime = StandardScaler()
R_calib_s = scaler_regime.fit_transform(calib_regime)
R_test_s = scaler_regime.transform(test_regime)

class GatingRouter(nn.Module):
    def __init__(self, in_regime_dim, num_experts=3):
        super(GatingRouter, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(in_regime_dim, 16),
            nn.Tanh(),
            nn.Linear(16, num_experts)
        )
    def forward(self, regime_feat):
        # Genera ponderaciones dinámicas que suman 1 (Softmax)
        logits = self.net(regime_feat)
        return F.softmax(logits, dim=-1)

router = GatingRouter(in_regime_dim=len(regime_cols), num_experts=3).to(device)
opt_router = torch.optim.Adam(router.parameters(), lr=0.01)

R_tensor = torch.tensor(R_calib_s, dtype=torch.float32).to(device)
P_tensor = torch.tensor(P_calib, dtype=torch.float32).to(device)
Y_tensor = torch.tensor(y_calib_tab, dtype=torch.float32).to(device)

router.train()
for epoch in range(60):
    opt_router.zero_grad()
    weights = router(R_tensor) # [N, 3]
    moe_pred = torch.sum(weights * P_tensor, dim=1) # [N]
    
    # Loss: MSE + regularización de entropía para evitar que un solo experto monopolice
    mse_loss = F.mse_loss(moe_pred, Y_tensor)
    entropy_penalty = -0.01 * torch.mean(torch.sum(weights * torch.log(weights + 1e-8), dim=1))
    total_router_loss = mse_loss + entropy_penalty
    total_router_loss.backward()
    opt_router.step()

router.eval()
with torch.no_grad():
    weights_calib = router(R_tensor).cpu().numpy()
    weights_test = router(torch.tensor(R_test_s, dtype=torch.float32).to(device)).cpu().numpy()

pred_calib_moe = np.sum(weights_calib * P_calib, axis=1)
pred_test_moe = np.sum(weights_test * P_test, axis=1)

print(f"Ponderaciones medias asignadas por el Router en Test:")
print(f"  - Experto 1 (XGBoost):         {weights_test[:, 0].mean()*100:.1f}%")
print(f"  - Experto 2 (Multi-Task WSP):   {weights_test[:, 1].mean()*100:.1f}%")
print(f"  - Experto 3 (Wavelet Transf):  {weights_test[:, 2].mean()*100:.1f}%")

# ==============================================================================
# 5. CONFORMAL PREDICTION (BANDAS DE INCERTIDUMBRE P10 - P50 - P90)
# ==============================================================================
print("\nCalibrando Bandas Cuantílicas Conformal con 90% de Cobertura Garantizada...")

# Residuos absolutos en el set de calibración
calib_p5_pred_usd = calib_p5_curr * np.exp(pred_calib_moe)
residuos_usd = np.abs(calib_p5_real - calib_p5_pred_usd)

# Cuantil 90% Conformal
alpha = 0.10 # Cobertura deseada: 90%
N_cal = len(residuos_usd)
q_conformal_level = math.ceil((N_cal + 1) * (1 - alpha)) / N_cal
conformal_margin_usd = np.quantile(residuos_usd, min(1.0, q_conformal_level))

print(f"  Margen de Incertidumbre Conformal (90% Confianza): ±${conformal_margin_usd:.2f} USD/ton")

# ==============================================================================
# 6. EVALUACIÓN Y RECONSTRUCCIÓN EN EL CONJUNTO DE PRUEBA (TEST CIEGO)
# ==============================================================================
pred_test_usd = test_p5_curr * np.exp(pred_test_moe)
p5_lower_band = pred_test_usd - conformal_margin_usd
p5_upper_band = pred_test_usd + conformal_margin_usd

# Métricas MoE
r2_moe = r2_score(test_p5_real, pred_test_usd)
rmse_moe = np.sqrt(mean_squared_error(test_p5_real, pred_test_usd))
mae_moe = mean_absolute_error(test_p5_real, pred_test_usd)
hit_rate_moe = np.mean(np.sign(pred_test_moe) == np.sign(y_test_tab)) * 100.0

# Cobertura empírica real de la banda conformal en Test
inside_bands = (test_p5_real >= p5_lower_band) & (test_p5_real <= p5_upper_band)
empirical_coverage = np.mean(inside_bands) * 100.0

print("\n" + "="*85)
print("  RESULTADOS OFICIALES DE LA OPCIÓN D: MoE ADAPTATIVO & CONFORMAL")
print("="*85)
print(f"  R² en Precios Nominales:       {r2_moe:.4f}")
print(f"  RMSE Contrato #5:              ${rmse_moe:.2f} USD/ton")
print(f"  MAE Contrato #5:               ${mae_moe:.2f} USD/ton")
print(f"  Acierto Direccional:           {hit_rate_moe:.2f}% (Hit Rate)")
print(f"  Cobertura Empírica Conformal:  {empirical_coverage:.2f}% (Objetivo: 90%)")
print(f"  Ancho Promedio de Banda:       ${conformal_margin_usd * 2:.2f} USD/ton")

# Exportar modelo MoE a Core ML para ejecución instantánea
print("\nExportando Gating Router a Core ML...")
class FullMoEConsensus(nn.Module):
    def __init__(self, router_mod):
        super(FullMoEConsensus, self).__init__()
        self.router = router_mod
    def forward(self, regime_feat, expert_preds):
        # regime_feat: [1, 4], expert_preds: [1, 3]
        w = self.router(regime_feat)
        return torch.sum(w * expert_preds, dim=-1, keepdim=True)

full_moe = FullMoEConsensus(router.cpu()).eval()
dummy_r = torch.randn(1, len(regime_cols), dtype=torch.float32)
dummy_p = torch.randn(1, 3, dtype=torch.float32)
traced_moe = torch.jit.trace(full_moe, (dummy_r, dummy_p))

ml_moe = ct.convert(
    traced_moe,
    inputs=[
        ct.TensorType(name="regime_features", shape=(1, len(regime_cols))),
        ct.TensorType(name="expert_predictions", shape=(1, 3))
    ],
    outputs=[ct.TensorType(name="blended_return")],
    compute_units=ct.ComputeUnit.ALL
)
ml_moe.save(COREML_OUTPUT)
print(f"✅ Core ML Package guardado en: {COREML_OUTPUT}")

# Inferencia ANE
dict_in = {"regime_features": dummy_r.numpy(), "expert_predictions": dummy_p.numpy()}
t_lats = []
for _ in range(100):
    t0 = time.perf_counter()
    _ = ml_moe.predict(dict_in)
    t_lats.append((time.perf_counter() - t0) * 1000.0)
avg_lat_moe = np.mean(t_lats)
print(f"⚡ Latencia Core ML Gating MoE: {avg_lat_moe:.3f} ms")

# ==============================================================================
# 7. TABLA COMPARATIVA CONSOLIDADA DEFINITIVA
# ==============================================================================
tabla_final = [
    {
        "Modelo": "Campeón Histórico (LSTM)",
        "Tipo": "Deep Learning Secuencial Niveles",
        "R2": -1.7236,
        "RMSE_USD": 151.67,
        "MAE_USD": 144.71,
        "Hit_Rate_%": 48.32,
        "Latencia_M4": "45.0 ms",
        "Incertidumbre_Hedging": "No disponible"
    },
    {
        "Modelo": "Contendiente XGBoost",
        "Tipo": "Gradient Boosting Tabular",
        "R2": 0.9565,
        "RMSE_USD": 19.87,
        "MAE_USD": 15.06,
        "Hit_Rate_%": 56.32,
        "Latencia_M4": "1.2 ms",
        "Incertidumbre_Hedging": "Puntual"
    },
    {
        "Modelo": "Híbrido A (Multi-Task)",
        "Tipo": "Red Co-integrada M4",
        "R2": 0.9268,
        "RMSE_USD": 25.17,
        "MAE_USD": 19.49,
        "Hit_Rate_%": 48.36,
        "Latencia_M4": "0.80 ms",
        "Incertidumbre_Hedging": "Puntual"
    },
    {
        "Modelo": "Híbrido B (Stacking)",
        "Tipo": "Ensemble Neuronal-Tabular",
        "R2": 0.9225,
        "RMSE_USD": 25.90,
        "MAE_USD": 20.44,
        "Hit_Rate_%": 47.57,
        "Latencia_M4": "2.1 ms",
        "Incertidumbre_Hedging": "Puntual"
    },
    {
        "Modelo": "Arquitectura C (Transformer)",
        "Tipo": "Wavelet Multi-Head Attention",
        "R2": 0.9548,
        "RMSE_USD": 19.78,
        "MAE_USD": 15.04,
        "Hit_Rate_%": 54.07,
        "Latencia_M4": "0.12 ms",
        "Incertidumbre_Hedging": "Puntual"
    },
    {
        "Modelo": "Opción D: MoE Adaptativo + Conformal",
        "Tipo": "Mixture of Experts Dinámico & Risk Hedging",
        "R2": round(r2_moe, 4),
        "RMSE_USD": round(rmse_moe, 2),
        "MAE_USD": round(mae_moe, 2),
        "Hit_Rate_%": round(hit_rate_moe, 2),
        "Latencia_M4": f"{avg_lat_moe:.2f} ms (Router)",
        "Incertidumbre_Hedging": f"Bandas 90% (±${conformal_margin_usd:.2f})"
    }
]

df_resumen = pd.DataFrame(tabla_final)
df_resumen.to_csv(CSV_METRICS, index=False)
print("\n" + "="*85)
print("  CUADRO DE HONOR DEFINITIVO DE MODELOS AGRO-IA 2026")
print("="*85)
print(df_resumen.to_string(index=False))
print(f"\nArchivo guardado en: {CSV_METRICS}")
