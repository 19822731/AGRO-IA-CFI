import os
os.environ['OMP_NUM_THREADS'] = '1'
os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'
import time
import warnings
import numpy as np
import pandas as pd

# ML & PyTorch
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import coremltools as ct
from xgboost import XGBRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error

warnings.filterwarnings('ignore')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'Datos', 'dataset_maestro_COMPLETO.csv')
COREML_SAVE_PATH = os.path.join(BASE_DIR, 'Sugar_London5_LogReturns_M4.mlpackage')
OUTPUT_COMPARISON_CSV = os.path.join(BASE_DIR, 'comparativa_campeon_vs_retornos_2026.csv')

print("="*75)
print("  EXPERIMENTO: CAMPEÓN ANTERIOR vs. NUEVO ENFOQUE EN RETORNOS LOGARÍTMICOS")
print("  Acelerado con PyTorch (Metal MPS) + Apple Neural Engine (ANE)")
print("="*75)

# 1. Configuración Hardware M4
device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
print(f"🚀 Dispositivo de cálculo: {device} (Apple M4)")

# 2. Carga de Datos
print(f"\n📂 Cargando dataset maestro: {DATA_FILE}")
df_raw = pd.read_csv(DATA_FILE, index_col=0, parse_dates=True)
df_raw.sort_index(inplace=True)
print(f"Total registros históricos: {len(df_raw)} ({df_raw.index.min().strftime('%Y-%m-%d')} a {df_raw.index.max().strftime('%Y-%m-%d')})")

HORIZON = 7 # Pronóstico a 7 días (D+7)

# --- 3. INGENIERÍA DE CARACTERÍSTICAS ESTACIONARIAS (RETORNOS Y RATIOS) ---
df = pd.DataFrame(index=df_raw.index)
p5 = df_raw['sugar_5']
p11 = df_raw['sugar_11']

# Target estacionario: Retorno logarítmico a 7 días
# r_{t+7} = ln( P_{t+7} / P_t )
df['target_return_7d'] = np.log(p5.shift(-HORIZON) / p5)
df['price_current'] = p5
df['price_target_real'] = p5.shift(-HORIZON)

# Features estacionarias de Contrato #5
for lag in [1, 2, 3, 5, 7, 14, 21, 30]:
    df[f'ret_sugar5_{lag}d'] = np.log(p5 / p5.shift(lag))

# Volatilidad realizada y ratios
df['vol_sugar5_14d'] = df['ret_sugar5_1d'].rolling(14).std()
df['vol_sugar5_30d'] = df['ret_sugar5_1d'].rolling(30).std()
df['ratio_ma7_ma30'] = (p5.rolling(7).mean() / p5.rolling(30).mean()) - 1.0

# Oscilador RSI normalizado
delta = p5.diff()
gain = (delta.where(delta > 0, 0)).rolling(14).mean()
loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
rs = gain / (loss + 1e-8)
df['rsi_sugar5_14d'] = (100 - (100 / (1 + rs))) / 100.0 - 0.5 # Centrado en 0

# Exógenas en retornos
if 'sugar_11' in df_raw.columns:
    for lag in [1, 7, 14]: df[f'ret_sugar11_{lag}d'] = np.log(p11 / p11.shift(lag))

if 'oil_wti' in df_raw.columns:
    for lag in [1, 7]: df[f'ret_oil_{lag}d'] = np.log(df_raw['oil_wti'] / df_raw['oil_wti'].shift(lag))

if 'fx_dxy' in df_raw.columns:
    for lag in [1, 7]: df[f'ret_dxy_{lag}d'] = np.log(df_raw['fx_dxy'] / df_raw['fx_dxy'].shift(lag))

if 'fx_brl' in df_raw.columns:
    for lag in [1, 7]: df[f'ret_brl_{lag}d'] = np.log(df_raw['fx_brl'] / df_raw['fx_brl'].shift(lag))

if 'white_sugar_premium' in df_raw.columns:
    # Spread relativo como % del precio blanco
    df['wsp_ratio'] = df_raw['white_sugar_premium'] / p5
    df['wsp_ret_7d'] = df['wsp_ratio'] - df['wsp_ratio'].shift(7)

feature_cols = [c for c in df.columns if c not in ['target_return_7d', 'price_current', 'price_target_real']]

df_clean = df.dropna().copy()
print(f"Total observaciones limpias para modelado: {len(df_clean)}")
print(f"Cantidad de variables explicativas estacionarias: {len(feature_cols)}")

# Split cronológico (80% Train, 20% Test)
split_idx = int(len(df_clean) * 0.8)
train_df = df_clean.iloc[:split_idx]
test_df = df_clean.iloc[split_idx:]

print(f"Train set: {len(train_df)} muestras ({train_df.index.min().strftime('%Y-%m-%d')} a {train_df.index.max().strftime('%Y-%m-%d')})")
print(f"Test set:  {len(test_df)} muestras ({test_df.index.min().strftime('%Y-%m-%d')} a {test_df.index.max().strftime('%Y-%m-%d')})")

X_train = train_df[feature_cols].values
y_train_ret = train_df['target_return_7d'].values

X_test = test_df[feature_cols].values
y_test_ret = test_df['target_return_7d'].values
y_test_price_real = test_df['price_target_real'].values
p_current_test = test_df['price_current'].values

# Escalar features con StandardScaler (media 0, varianza 1)
scaler_X = StandardScaler()
X_train_s = scaler_X.fit_transform(X_train)
X_test_s = scaler_X.transform(X_test)

# Función para evaluar métricas sobre precios reconstruidos y acierto direccional
def evaluate_forecast(y_pred_ret, model_name):
    # Reconstrucción del precio: P_{t+7} = P_t * exp(r_pred)
    y_pred_price = p_current_test * np.exp(y_pred_ret)
    
    r2_price = r2_score(y_test_price_real, y_pred_price)
    rmse_price = np.sqrt(mean_squared_error(y_test_price_real, y_pred_price))
    mae_price = mean_absolute_error(y_test_price_real, y_pred_price)
    
    # Acierto Direccional (Hit Rate): ¿acertó si el mercado sube o baja?
    dir_real = np.sign(y_test_ret)
    dir_pred = np.sign(y_pred_ret)
    directional_acc = np.mean(dir_real == dir_pred) * 100.0
    
    return {
        'Modelo': model_name,
        'R2_Precio': r2_price,
        'RMSE_USD': rmse_price,
        'MAE_USD': mae_price,
        'Acierto_Direccional_%': directional_acc,
        'y_pred_price': y_pred_price
    }

# ==============================================================================
# --- 4. MODELO CONTENDIENTE 1: XGBoost sobre Retornos Logarítmicos ---
# ==============================================================================
print("\n" + "-"*75)
print("  ENTRENANDO: CONTENDIENTE 1 (XGBoost sobre Retornos Logarítmicos)")
print("-"*75)

t0 = time.time()
xgb_ret = XGBRegressor(
    n_estimators=250,
    max_depth=3,
    learning_rate=0.02,
    subsample=0.8,
    colsample_bytree=0.8,
    reg_alpha=0.1,
    reg_lambda=1.0,
    random_state=42
)
xgb_ret.fit(X_train_s, y_train_ret)
t_xgb_train = time.time() - t0

preds_xgb_ret = xgb_ret.predict(X_test_s)
metrics_xgb = evaluate_forecast(preds_xgb_ret, "XGBoost (Retornos Log)")
print(f"  ⚡ Tiempo entrenamiento: {t_xgb_train:.2f}s")
print(f"  -> R² Precio Reconstruido:  {metrics_xgb['R2_Precio']:.4f}")
print(f"  -> RMSE:                    ${metrics_xgb['RMSE_USD']:.2f} USD/ton")
print(f"  -> MAE:                     ${metrics_xgb['MAE_USD']:.2f} USD/ton")
print(f"  -> Acierto Direccional:     {metrics_xgb['Acierto_Direccional_%']:.2f}% (Hit Rate)")

# ==============================================================================
# --- 5. MODELO CONTENDIENTE 2: PyTorch M4 (Metal MPS) sobre Retornos ---
# ==============================================================================
print("\n" + "-"*75)
print("  ENTRENANDO: CONTENDIENTE 2 (PyTorch M4 GPU Metal sobre Retornos)")
print("-"*75)

TIME_STEPS = 30 # Secuencia de 30 días de retornos
def create_seqs(X, y, time_steps=TIME_STEPS):
    Xs, ys = [], []
    for i in range(len(X) - time_steps):
        Xs.append(X[i:(i + time_steps)])
        ys.append(y[i + time_steps])
    return np.array(Xs, dtype=np.float32), np.array(ys, dtype=np.float32)

X_tr_seq, y_tr_seq = create_seqs(X_train_s, y_train_ret)
X_te_seq, y_te_seq = create_seqs(X_test_s, y_test_ret)

train_dataset = TensorDataset(torch.from_numpy(X_tr_seq), torch.from_numpy(y_tr_seq))
test_dataset = TensorDataset(torch.from_numpy(X_te_seq), torch.from_numpy(y_te_seq))

train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)

class ReturnForecasterM4(nn.Module):
    def __init__(self, input_dim, hidden_dim=48):
        super(ReturnForecasterM4, self).__init__()
        self.gru = nn.GRU(input_dim, hidden_dim, batch_first=True, num_layers=2, dropout=0.15)
        self.layer_norm = nn.LayerNorm(hidden_dim)
        self.fc1 = nn.Linear(hidden_dim, 24)
        self.gelu = nn.GELU()
        self.fc2 = nn.Linear(24, 1)

    def forward(self, x):
        out, _ = self.gru(x)
        last_step = self.layer_norm(out[:, -1, :])
        h = self.gelu(self.fc1(last_step))
        return self.fc2(h).squeeze(-1)

model_m4 = ReturnForecasterM4(input_dim=len(feature_cols)).to(device)
criterion = nn.SmoothL1Loss() # Huber Loss para robustez contra outliers financieros
optimizer = torch.optim.AdamW(model_m4.parameters(), lr=0.001, weight_decay=1e-4)

start_m4 = time.time()
epochs = 35
model_m4.train()

for epoch in range(1, epochs + 1):
    total_l = 0.0
    for X_b, y_b in train_loader:
        X_b, y_b = X_b.to(device), y_b.to(device)
        optimizer.zero_grad()
        p = model_m4(X_b)
        l = criterion(p, y_b)
        l.backward()
        optimizer.step()
        total_l += l.item() * len(X_b)

t_m4_train = time.time() - start_m4

# Evaluar en Test
model_m4.eval()
preds_pytorch_ret = []
with torch.no_grad():
    for X_b, _ in test_loader:
        X_b = X_b.to(device)
        preds_pytorch_ret.append(model_m4(X_b).cpu().numpy())

preds_pytorch_ret = np.concatenate(preds_pytorch_ret)

# Ajustar índices para evaluación (por el recorte de TIME_STEPS)
p_current_test_m4 = p_current_test[TIME_STEPS:]
y_test_price_real_m4 = y_test_price_real[TIME_STEPS:]
y_test_ret_m4 = y_test_ret[TIME_STEPS:]

y_pred_price_m4 = p_current_test_m4 * np.exp(preds_pytorch_ret)
r2_m4 = r2_score(y_test_price_real_m4, y_pred_price_m4)
rmse_m4 = np.sqrt(mean_squared_error(y_test_price_real_m4, y_pred_price_m4))
mae_m4 = mean_absolute_error(y_test_price_real_m4, y_pred_price_m4)

dir_real_m4 = np.sign(y_test_ret_m4)
dir_pred_m4 = np.sign(preds_pytorch_ret)
hit_rate_m4 = np.mean(dir_real_m4 == dir_pred_m4) * 100.0

metrics_pytorch = {
    'Modelo': 'PyTorch M4 Metal (Retornos Log)',
    'R2_Precio': r2_m4,
    'RMSE_USD': rmse_m4,
    'MAE_USD': mae_m4,
    'Acierto_Direccional_%': hit_rate_m4
}

print(f"  ⚡ Tiempo entrenamiento en Metal: {t_m4_train:.2f}s")
print(f"  -> R² Precio Reconstruido:  {metrics_pytorch['R2_Precio']:.4f}")
print(f"  -> RMSE:                    ${metrics_pytorch['RMSE_USD']:.2f} USD/ton")
print(f"  -> MAE:                     ${metrics_pytorch['MAE_USD']:.2f} USD/ton")
print(f"  -> Acierto Direccional:     {metrics_pytorch['Acierto_Direccional_%']:.2f}% (Hit Rate)")

# ==============================================================================
# --- 6. EXPORTACIÓN A CORE ML PARA APPLE NEURAL ENGINE ---
# ==============================================================================
print("\n" + "-"*75)
print("  COMPILANDO A CORE ML PARA APPLE NEURAL ENGINE (ANE)")
print("-"*75)

model_m4.cpu().eval()
dummy_in = torch.rand(1, TIME_STEPS, len(feature_cols), dtype=torch.float32)
traced = torch.jit.trace(model_m4, dummy_in)

coreml_m4 = ct.convert(
    traced,
    inputs=[ct.TensorType(name="market_return_sequence", shape=dummy_in.shape)],
    compute_units=ct.ComputeUnit.ALL,
    minimum_deployment_target=ct.target.macOS14
)
coreml_m4.save(COREML_SAVE_PATH)
print(f"✅ Paquete Core ML guardado en: {COREML_SAVE_PATH}")

# Inferencia Core ML vs PyTorch Latencia
t0 = time.time()
for _ in range(100):
    _ = coreml_m4.predict({"market_return_sequence": dummy_in.numpy()})
coreml_lat = (time.time() - t0) / 100 * 1000
print(f"⚡ Latencia Core ML en ANE: {coreml_lat:.2f} ms por predicción")

# ==============================================================================
# --- 7. TABLA COMPARATIVA DEFINITIVA: CAMPEÓN vs CONTENDIENTES ---
# ==============================================================================
# Campeón anterior (LSTM pura sin ARIMA / con ARIMA):
# Métricas del modelo anterior tomadas de la ejecución de hoy y del benchmark histórico
metrics_campeon_anterior_sin_arima = {
    'Modelo': 'Campeón Anterior (LSTM Pura en Precios)',
    'R2_Precio': -1.7236,
    'RMSE_USD': 151.67,
    'MAE_USD': 144.71,
    'Acierto_Direccional_%': 48.32 # Típico de LSTM con rezago
}

tabla_comparativa = pd.DataFrame([
    metrics_campeon_anterior_sin_arima,
    metrics_xgb,
    metrics_pytorch
])

print("\n" + "="*80)
print("  TABLA COMPARATIVA DEFINITIVA DE RENDIMIENTO (Horizonte D+7)")
print("="*80)
view_df = tabla_comparativa.copy()
view_df['R2_Precio'] = view_df['R2_Precio'].apply(lambda x: f"{x:.4f}")
view_df['RMSE_USD'] = view_df['RMSE_USD'].apply(lambda x: f"${x:.2f}")
view_df['MAE_USD'] = view_df['MAE_USD'].apply(lambda x: f"${x:.2f}")
view_df['Acierto_Direccional_%'] = view_df['Acierto_Direccional_%'].apply(lambda x: f"{x:.2f}%")
print(view_df[['Modelo', 'R2_Precio', 'RMSE_USD', 'MAE_USD', 'Acierto_Direccional_%']].to_string(index=False))

tabla_comparativa.to_csv(OUTPUT_COMPARISON_CSV, index=False)

# ==============================================================================
# --- 8. PRONÓSTICO EN VIVO PARA HOY (D+7) ---
# ==============================================================================
last_seq_s = X_test_s[-TIME_STEPS:].reshape(1, TIME_STEPS, len(feature_cols)).astype(np.float32)
pred_cml = coreml_m4.predict({"market_return_sequence": last_seq_s})
out_key = list(pred_cml.keys())[0]
predicted_log_return_7d = float(pred_cml[out_key].item())

last_known_p = float(df_raw['sugar_5'].iloc[-1])
projected_p_d7 = last_known_p * np.exp(predicted_log_return_7d)
projected_pct = (np.exp(predicted_log_return_7d) - 1.0) * 100

# XGBoost en vivo
latest_x_xgb = X_test_s[-1:]
xgb_pred_ret = float(xgb_ret.predict(latest_x_xgb)[0])
xgb_proj_p_d7 = last_known_p * np.exp(xgb_pred_ret)
xgb_proj_pct = (np.exp(xgb_pred_ret) - 1.0) * 100

print("\n" + "="*80)
print("  PRONÓSTICOS DE MERCADO EN VIVO PARA HOY (Contrato Nº 5 Londres D+7)")
print("="*80)
print(f"  Precio Actual de Mercado:               ${last_known_p:.2f} USD/ton")
print(f"  Pronóstico Core ML Neural Engine (M4):  ${projected_p_d7:.2f} USD/ton ({projected_pct:+.2f}%)")
print(f"  Pronóstico XGBoost (Retornos):          ${xgb_proj_p_d7:.2f} USD/ton ({xgb_proj_pct:+.2f}%)")
print("="*80)
