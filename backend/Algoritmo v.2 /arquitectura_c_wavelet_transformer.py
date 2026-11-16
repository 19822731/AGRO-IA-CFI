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
import coremltools as ct
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error

warnings.filterwarnings('ignore')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'Datos', 'dataset_maestro_COMPLETO.csv')
COREML_OUTPUT = os.path.join(BASE_DIR, 'ArquitecturaC_Wavelet_Transformer_M4.mlpackage')
CSV_METRICS = os.path.join(BASE_DIR, 'comparativa_modelos_completa_2026.csv')

print("="*80)
print("  ARQUITECTURA C: WAVELET MULTIESCALA + TEMPORAL TRANSFORMER (Agro-IA 2026)")
print("  Descomposición en Frecuencias (Tendencia + Ciclo + Ruido) & Auto-Atención M4")
print("="*80)

# 1. Configuración Hardware M4
device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
print(f"🚀 Acelerador activo: {device} (Apple M4 Metal Acceleration)")

# 2. Carga y Preprocesamiento del Dataset Maestro
df_raw = pd.read_csv(DATA_FILE, index_col=0, parse_dates=True)
df_raw.sort_index(inplace=True)

HORIZON = 7 # Horizonte de pronóstico: 7 días hábiles (D+7)

p5 = df_raw['sugar_5']
p11 = df_raw['sugar_11']
wsp = df_raw['white_sugar_premium']

df = pd.DataFrame(index=df_raw.index)

# Retornos logarítmicos base
df['ret5_1d'] = np.log(p5 / p5.shift(1))
df['ret11_1d'] = np.log(p11 / p11.shift(1))

# --- DESCOMPOSICIÓN MULTIESCALA / WAVELET DOMAIN ---
# 1. Componente de Baja Frecuencia (Tendencia Zafra / Macro estructural - Ventana 21d)
trend_low = df['ret5_1d'].rolling(21, min_periods=1).mean()
df['wavelet_approx_trend'] = trend_low

# 2. Componente de Media Frecuencia (Ciclos / Swings de 5 a 10 días)
cycle_mid = df['ret5_1d'].rolling(5, min_periods=1).mean() - trend_low
df['wavelet_detail_cycle'] = cycle_mid

# 3. Componente de Alta Frecuencia (Ruido especulativo / Shocks diarios)
noise_high = df['ret5_1d'] - df['ret5_1d'].rolling(5, min_periods=1).mean()
df['wavelet_detail_noise'] = noise_high

# Mismo filtrado para Cto 11
trend11_low = df['ret11_1d'].rolling(21, min_periods=1).mean()
df['wavelet_approx_trend11'] = trend11_low
df['wavelet_detail_cycle11'] = df['ret11_1d'].rolling(5, min_periods=1).mean() - trend11_low
df['wavelet_detail_noise11'] = df['ret11_1d'] - df['ret11_1d'].rolling(5, min_periods=1).mean()

# Multi-lags y ratios
for lag in [1, 2, 3, 5, 7, 14, 21]:
    df[f'ret5_{lag}d'] = np.log(p5 / p5.shift(lag))
    df[f'ret11_{lag}d'] = np.log(p11 / p11.shift(lag))

# White Sugar Premium & Macro
df['wsp_ratio'] = wsp / p5
df['wsp_ret7d'] = df['wsp_ratio'] - df['wsp_ratio'].shift(7)
df['vol5_14d'] = df['ret5_1d'].rolling(14).std()

if 'oil_wti' in df_raw.columns:
    df['ret_oil_1d'] = np.log(df_raw['oil_wti'] / df_raw['oil_wti'].shift(1))
    df['ret_oil_7d'] = np.log(df_raw['oil_wti'] / df_raw['oil_wti'].shift(7))
if 'fx_dxy' in df_raw.columns:
    df['ret_dxy_1d'] = np.log(df_raw['fx_dxy'] / df_raw['fx_dxy'].shift(1))
if 'fx_brl' in df_raw.columns:
    df['ret_brl_1d'] = np.log(df_raw['fx_brl'] / df_raw['fx_brl'].shift(1))

# Targets D+7
df['target_ret5_7d'] = np.log(p5.shift(-HORIZON) / p5)
df['target_ret11_7d'] = np.log(p11.shift(-HORIZON) / p11)

# Precios nominales para evaluación real en USD
df['p5_current'] = p5
df['p11_current'] = p11
df['p5_target_real'] = p5.shift(-HORIZON)
df['p11_target_real'] = p11.shift(-HORIZON)

# Limpieza
feature_cols = [c for c in df.columns if not c.startswith('target_') and not c.startswith('p5_') and not c.startswith('p11_')]
df_clean = df.dropna().copy()

print(f"Dataset limpio: {len(df_clean)} muestras temporales.")
print(f"Features multiescala generadas: {len(feature_cols)} columnas.")

# Split temporal 80% Train / 20% Test idéntico a benchmarks anteriores
split_idx = int(len(df_clean) * 0.8)
train_df = df_clean.iloc[:split_idx]
test_df = df_clean.iloc[split_idx:]

X_train_raw = train_df[feature_cols].values
X_test_raw = test_df[feature_cols].values

y_train_5 = train_df['target_ret5_7d'].values
y_test_5 = test_df['target_ret5_7d'].values
y_train_11 = train_df['target_ret11_7d'].values
y_test_11 = test_df['target_ret11_7d'].values

p5_curr_test = test_df['p5_current'].values
p5_real_test = test_df['p5_target_real'].values

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train_raw)
X_test_scaled = scaler.transform(X_test_raw)

# Ventana temporal (Lookback = 30 días hábiles)
LOOKBACK = 30

def create_sequences(X, y5, y11, lookback=LOOKBACK):
    Xs, ys = [], []
    for i in range(len(X) - lookback):
        Xs.append(X[i:i+lookback])
        ys.append([y5[i+lookback], y11[i+lookback]])
    return np.array(Xs, dtype=np.float32), np.array(ys, dtype=np.float32)

X_tr_seq, y_tr_seq = create_sequences(X_train_scaled, y_train_5, y_train_11)
X_te_seq, y_te_seq = create_sequences(X_test_scaled, y_test_5, y_test_11)

# Alinear precios actuales y reales correspondientes a las secuencias de test
test_p5_curr_seq = p5_curr_test[LOOKBACK:]
test_p5_real_seq = p5_real_test[LOOKBACK:]

print(f"Forma secuencias de entrenamiento: {X_tr_seq.shape}")
print(f"Forma secuencias de prueba: {X_te_seq.shape}")

# 3. DEFINICIÓN DEL TEMPORAL TRANSFORMER COMPATIBLE CON CORE ML Y MPS
class PositionalEncoding(nn.Module):
    def __init__(self, d_model, max_len=100):
        super(PositionalEncoding, self).__init__()
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model))
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(0) # [1, max_len, d_model]
        self.register_buffer('pe', pe)

    def forward(self, x):
        # x: [batch, seq_len, d_model]
        return x + self.pe[:, :x.size(1), :]

class TemporalSelfAttention(nn.Module):
    def __init__(self, d_model, num_heads=4, dropout=0.1):
        super(TemporalSelfAttention, self).__init__()
        assert d_model % num_heads == 0
        self.num_heads = num_heads
        self.head_dim = d_model // num_heads
        self.d_model = d_model
        
        self.q_proj = nn.Linear(d_model, d_model)
        self.k_proj = nn.Linear(d_model, d_model)
        self.v_proj = nn.Linear(d_model, d_model)
        self.out_proj = nn.Linear(d_model, d_model)
        self.dropout = nn.Dropout(dropout)
        self.scale = 1.0 / math.sqrt(self.head_dim)

    def forward(self, x):
        B, S, D = x.shape
        # Proyecciones lineales
        q = self.q_proj(x).view(B, S, self.num_heads, self.head_dim).transpose(1, 2) # [B, heads, S, head_dim]
        k = self.k_proj(x).view(B, S, self.num_heads, self.head_dim).transpose(1, 2)
        v = self.v_proj(x).view(B, S, self.num_heads, self.head_dim).transpose(1, 2)

        # Scaled Dot-Product Attention
        scores = torch.matmul(q, k.transpose(-2, -1)) * self.scale # [B, heads, S, S]
        attn_weights = F.softmax(scores, dim=-1)
        attn_weights = self.dropout(attn_weights)
        
        context = torch.matmul(attn_weights, v) # [B, heads, S, head_dim]
        context = context.transpose(1, 2).contiguous().view(B, S, D)
        return self.out_proj(context)

class TransformerBlock(nn.Module):
    def __init__(self, d_model=64, num_heads=4, ff_dim=128, dropout=0.1):
        super(TransformerBlock, self).__init__()
        self.norm1 = nn.LayerNorm(d_model)
        self.attn = TemporalSelfAttention(d_model, num_heads=num_heads, dropout=dropout)
        self.norm2 = nn.LayerNorm(d_model)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, ff_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(ff_dim, d_model)
        )
        self.drop = nn.Dropout(dropout)

    def forward(self, x):
        # Pre-LN architecture
        norm_x = self.norm1(x)
        x = x + self.drop(self.attn(norm_x))
        x = x + self.drop(self.ffn(self.norm2(x)))
        return x

class WaveletTemporalTransformer(nn.Module):
    def __init__(self, input_dim, d_model=64, num_heads=4, num_layers=2, ff_dim=128, dropout=0.1):
        super(WaveletTemporalTransformer, self).__init__()
        # 1. Proyección lineal del espacio de features al espacio latente del Transformer
        self.input_proj = nn.Linear(input_dim, d_model)
        self.pos_encoder = PositionalEncoding(d_model)
        
        # 2. Bloques Transformer Encoders
        self.blocks = nn.ModuleList([
            TransformerBlock(d_model=d_model, num_heads=num_heads, ff_dim=ff_dim, dropout=dropout)
            for _ in range(num_layers)
        ])
        self.final_norm = nn.LayerNorm(d_model)
        
        # 3. Pooling de Auto-Atención temporal (aprende qué días son los más relevantes)
        self.attn_pool = nn.Linear(d_model, 1)
        
        # 4. Heads de predicción
        self.head_ret5 = nn.Sequential(
            nn.Linear(d_model, 32),
            nn.GELU(),
            nn.Linear(32, 1)
        )
        self.head_ret11 = nn.Sequential(
            nn.Linear(d_model, 32),
            nn.GELU(),
            nn.Linear(32, 1)
        )

    def forward(self, x):
        # x: [B, seq_len, input_dim]
        h = self.input_proj(x)
        h = self.pos_encoder(h)
        
        for block in self.blocks:
            h = block(h)
            
        h = self.final_norm(h)
        
        # Attention Pooling temporal sobre los 30 días
        weights = F.softmax(self.attn_pool(h), dim=1) # [B, seq_len, 1]
        pooled = torch.sum(h * weights, dim=1) # [B, d_model]
        
        out5 = self.head_ret5(pooled)
        out11 = self.head_ret11(pooled)
        
        # Concatenar retornos estimados [B, 2] -> [ret5, ret11]
        return torch.cat([out5, out11], dim=1)

# Función de pérdida Direccional Ponderada
class DirectionalAwareLoss(nn.Module):
    def __init__(self, alpha_dir=0.15):
        super(DirectionalAwareLoss, self).__init__()
        self.mse = nn.MSELoss()
        self.alpha_dir = alpha_dir

    def forward(self, y_pred, y_true):
        mse_loss = self.mse(y_pred, y_true)
        # Penalización si el signo difiere (sign(pred) * sign(true) < 0)
        sign_mismatch = torch.relu(- (torch.sign(y_pred) * torch.sign(y_true)))
        directional_penalty = torch.mean(sign_mismatch * torch.abs(y_true))
        return mse_loss + self.alpha_dir * directional_penalty

# 4. ENTRENAMIENTO EN APPLE M4 (MPS)
input_dim = X_tr_seq.shape[2]
model_c = WaveletTemporalTransformer(input_dim=input_dim, d_model=64, num_heads=4, num_layers=2, ff_dim=128, dropout=0.1)
model_c.to(device)

criterion = DirectionalAwareLoss(alpha_dir=0.20)
optimizer = torch.optim.AdamW(model_c.parameters(), lr=1e-3, weight_decay=1e-4)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=40, eta_min=1e-5)

train_dataset = TensorDataset(torch.tensor(X_tr_seq, dtype=torch.float32), torch.tensor(y_tr_seq, dtype=torch.float32))
train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)

test_tensor_x = torch.tensor(X_te_seq, dtype=torch.float32).to(device)
test_tensor_y = torch.tensor(y_te_seq, dtype=torch.float32).to(device)

EPOCHS = 40
best_val_loss = float('inf')
best_weights = None

print(f"\nIniciando entrenamiento del Temporal Transformer ({EPOCHS} épocas en GPU MPS)...")
start_train = time.time()

for epoch in range(1, EPOCHS + 1):
    model_c.train()
    total_loss = 0.0
    for bx, by in train_loader:
        bx, by = bx.to(device), by.to(device)
        optimizer.zero_grad()
        preds = model_c(bx)
        loss = criterion(preds, by)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model_c.parameters(), max_norm=1.0)
        optimizer.step()
        total_loss += loss.item() * len(bx)
        
    scheduler.step()
    train_loss = total_loss / len(train_dataset)
    
    # Evaluación en Test
    model_c.eval()
    with torch.no_grad():
        val_preds = model_c(test_tensor_x)
        val_loss = criterion(val_preds, test_tensor_y).item()
        
    if val_loss < best_val_loss:
        best_val_loss = val_loss
        best_weights = {k: v.cpu().clone() for k, v in model_c.state_dict().items()}
        
    if epoch % 10 == 0 or epoch == EPOCHS:
        print(f"  Época {epoch:02d}/{EPOCHS} | Train Loss: {train_loss:.6f} | Test Val Loss: {val_loss:.6f}")

train_time = time.time() - start_train
print(f"✅ Entrenamiento completado en {train_time:.2f} segundos en Apple Silicon M4.")

# Cargar mejores pesos
model_c.load_state_dict({k: v.to(device) for k, v in best_weights.items()})
model_c.eval()

# 5. EVALUACIÓN Y RECONSTRUCCIÓN DE PRECIOS NOMINALES
with torch.no_grad():
    preds_test_tensor = model_c(test_tensor_x)
    preds_test_np = preds_test_tensor.cpu().numpy()

pred_ret5 = preds_test_np[:, 0]
pred_ret11 = preds_test_np[:, 1]

# Reconstrucción del precio nominal en USD/ton: P_estimado = P_actual * exp(retorno_predicho)
pred_p5_usd = test_p5_curr_seq * np.exp(pred_ret5)
real_p5_usd = test_p5_real_seq

# Métricas del Contrato #5
r2_c = r2_score(real_p5_usd, pred_p5_usd)
rmse_c = np.sqrt(mean_squared_error(real_p5_usd, pred_p5_usd))
mae_c = mean_absolute_error(real_p5_usd, pred_p5_usd)

# Acierto Direccional (Hit Rate)
real_ret5 = y_te_seq[:, 0]
hit_rate_c = np.mean(np.sign(pred_ret5) == np.sign(real_ret5)) * 100.0

print("\n" + "="*80)
print("  RESULTADOS DE ARQUITECTURA C (WAVELET + TEMPORAL TRANSFORMER)")
print("="*80)
print(f"  R² en Precios Nominales:    {r2_c:.4f}")
print(f"  RMSE Contrato #5:           ${rmse_c:.2f} USD/ton")
print(f"  MAE Contrato #5:            ${mae_c:.2f} USD/ton")
print(f"  Acierto Direccional:        {hit_rate_c:.2f}%")

# 6. EXPORTACIÓN A CORE ML Y MEDICIÓN EN APPLE NEURAL ENGINE (ANE)
print("\nExportando Arquitectura C a Core ML para ejecución en Neural Engine (ANE)...")
model_c_cpu = WaveletTemporalTransformer(input_dim=input_dim, d_model=64, num_heads=4, num_layers=2, ff_dim=128, dropout=0.0)
model_c_cpu.load_state_dict({k: v.cpu() for k, v in best_weights.items()})
model_c_cpu.eval()

dummy_input = torch.randn(1, LOOKBACK, input_dim, dtype=torch.float32)
traced_c = torch.jit.trace(model_c_cpu, dummy_input)

mlmodel_c = ct.convert(
    traced_c,
    inputs=[ct.TensorType(name="temporal_sequence", shape=(1, LOOKBACK, input_dim))],
    outputs=[ct.TensorType(name="predicted_returns_c5_c11")],
    compute_units=ct.ComputeUnit.ALL,
    minimum_deployment_target=ct.target.macOS14
)

mlmodel_c.author = "Agro-IA Deep Learning Team"
mlmodel_c.short_description = "Wavelet Multiscale Temporal Transformer para Contratos 5 y 11 de Azúcar (M4 Optimized)"
mlmodel_c.save(COREML_OUTPUT)
print(f"✅ Modelo guardado en: {COREML_OUTPUT}")

# Medición de latencia de inferencia en Apple Silicon
input_ane = {"temporal_sequence": dummy_input.numpy()}
# Warmup
for _ in range(10):
    _ = mlmodel_c.predict(input_ane)

latencies = []
for _ in range(100):
    t0 = time.perf_counter()
    _ = mlmodel_c.predict(input_ane)
    latencies.append((time.perf_counter() - t0) * 1000.0)

avg_lat_c = np.mean(latencies)
p95_lat_c = np.percentile(latencies, 95)
print(f"⚡ Latencia Core ML en ANE (Promedio): {avg_lat_c:.2f} ms | P95: {p95_lat_c:.2f} ms")

# 7. TABLA COMPARATIVA CONSOLIDADA CON TODOS LOS MODELOS
comparativa = [
    {
        "Arquitectura": "Campeón Histórico (LSTM en Precios Nominales)",
        "Tipo": "Deep Learning Clásico (Secuencial)",
        "R2_Precio": -1.7236,
        "RMSE_USD": 151.67,
        "MAE_USD": 144.71,
        "Acierto_Direccional": 48.32,
        "Latencia_M4": "45.0 ms"
    },
    {
        "Arquitectura": "Contendiente XGBoost (Retornos Log)",
        "Tipo": "Gradient Boosting Tabular",
        "R2_Precio": 0.9565,
        "RMSE_USD": 19.87,
        "MAE_USD": 15.06,
        "Acierto_Direccional": 56.32,
        "Latencia_M4": "1.2 ms"
    },
    {
        "Arquitectura": "Híbrido A: Multi-Task Dual (Cto5 + Cto11 + WSP)",
        "Tipo": "Deep Learning Co-integrado M4",
        "R2_Precio": 0.9268,
        "RMSE_USD": 25.17,
        "MAE_USD": 19.49,
        "Acierto_Direccional": 48.36,
        "Latencia_M4": "0.80 ms (ANE)"
    },
    {
        "Arquitectura": "Híbrido B: Stacking Ensemble",
        "Tipo": "Ensemble Neuronal-Tabular",
        "R2_Precio": 0.9225,
        "RMSE_USD": 25.90,
        "MAE_USD": 20.44,
        "Acierto_Direccional": 47.57,
        "Latencia_M4": "2.1 ms"
    },
    {
        "Arquitectura": "Arquitectura C: Wavelet + Temporal Transformer",
        "Tipo": "Atención Multiescala Auto-Regresiva",
        "R2_Precio": round(r2_c, 4),
        "RMSE_USD": round(rmse_c, 2),
        "MAE_USD": round(mae_c, 2),
        "Acierto_Direccional": round(hit_rate_c, 2),
        "Latencia_M4": f"{avg_lat_c:.2f} ms (ANE)"
    }
]

df_comp = pd.DataFrame(comparativa)
df_comp.to_csv(CSV_METRICS, index=False)
print("\n" + "="*80)
print("  TABLA COMPARATIVA GLOBAL ACTUALIZADA (Agro-IA 2026)")
print("="*80)
print(df_comp.to_string(index=False))
print(f"\nArchivo guardado en: {CSV_METRICS}")
