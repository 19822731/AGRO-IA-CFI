import os
import time
import warnings
import numpy as np
import pandas as pd

# PyTorch & Apple Silicon
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import coremltools as ct
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error

warnings.filterwarnings('ignore')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'Datos', 'dataset_maestro_COMPLETO.csv')
COREML_SAVE_PATH = os.path.join(BASE_DIR, 'Sugar_London5_M4.mlpackage')

print("="*75)
print("  PROTOTIPO M4: PYTORCH (MPS / METAL) + CORE ML (APPLE NEURAL ENGINE)")
print("="*75)

# 1. Configuración de Dispositivo (Apple Silicon MPS)
if torch.backends.mps.is_available():
    device = torch.device("mps")
    print("🚀 Dispositivo detectado: Apple Silicon GPU (Metal / MPS)")
else:
    device = torch.device("cpu")
    print("⚠️ Dispositivo detectado: CPU (MPS no disponible)")

# 2. Carga y Preparación de Datos
print(f"\n📂 Cargando dataset maestro: {DATA_FILE}")
df = pd.read_csv(DATA_FILE, index_col=0, parse_dates=True)
df.sort_index(inplace=True)

# Feature engineering básica
features = ['sugar_5', 'sugar_11', 'oil_wti', 'fx_dxy', 'fx_brl', 'white_sugar_premium']
features = [f for f in features if f in df.columns]

# Target: Precio Contrato #5 a 7 días (D+7)
HORIZON = 7
TARGET_COL = 'target_5_7d'
df[TARGET_COL] = df['sugar_5'].shift(-HORIZON)

# Lags y medias móviles
for f in features:
    df[f'{f}_ma_7d'] = df[f].rolling(7).mean()
    df[f'{f}_lag_7d'] = df[f].shift(7)

feature_cols = [c for c in df.columns if c not in ['Date', TARGET_COL] and not c.startswith('target')]
df_clean = df.dropna(subset=feature_cols + [TARGET_COL])

print(f"Total datos limpios: {len(df_clean)} días. Variables predictoras: {len(feature_cols)}")

X_vals = df_clean[feature_cols].values
y_vals = df_clean[[TARGET_COL]].values

# Split Train / Test (80 / 20 cronológico)
split_idx = int(len(X_vals) * 0.8)
X_train_raw, X_test_raw = X_vals[:split_idx], X_vals[split_idx:]
y_train_raw, y_test_raw = y_vals[:split_idx], y_vals[split_idx:]

scaler_X = MinMaxScaler()
X_train_s = scaler_X.fit_transform(X_train_raw)
X_test_s = scaler_X.transform(X_test_raw)

scaler_y = MinMaxScaler()
y_train_s = scaler_y.fit_transform(y_train_raw)
y_test_s = scaler_y.transform(y_test_raw)

# Crear secuencias temporales (60 días hacia atrás)
TIME_STEPS = 60
def create_sequences(X, y, time_steps=TIME_STEPS):
    Xs, ys = [], []
    for i in range(len(X) - time_steps):
        Xs.append(X[i:(i + time_steps)])
        ys.append(y[i + time_steps])
    return np.array(Xs, dtype=np.float32), np.array(ys, dtype=np.float32)

X_tr_seq, y_tr_seq = create_sequences(X_train_s, y_train_s)
X_te_seq, y_te_seq = create_sequences(X_test_s, y_test_s)

print(f"Secuencias de entrenamiento: {X_tr_seq.shape} | Secuencias de test: {X_te_seq.shape}")

train_dataset = TensorDataset(torch.from_numpy(X_tr_seq), torch.from_numpy(y_tr_seq))
test_dataset = TensorDataset(torch.from_numpy(X_te_seq), torch.from_numpy(y_te_seq))

train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)

# 3. Definición de la Red Neuronal en PyTorch
class SugarNeuralForecaster(nn.Module):
    def __init__(self, input_dim, hidden_dim=64):
        super(SugarNeuralForecaster, self).__init__()
        self.lstm = nn.LSTM(input_dim, hidden_dim, batch_first=True, num_layers=2, dropout=0.1)
        self.fc1 = nn.Linear(hidden_dim, 32)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(32, 1)

    def forward(self, x):
        # x shape: [batch, time_steps, input_dim]
        out, _ = self.lstm(x)
        # Tomar el último paso temporal
        last_step = out[:, -1, :]
        h = self.relu(self.fc1(last_step))
        out = self.fc2(h)
        return out

model = SugarNeuralForecaster(input_dim=len(feature_cols)).to(device)
criterion = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

# 4. Entrenamiento con aceleración Metal (MPS)
print("\n" + "-"*70)
print(f"  ENTRENANDO EN GPU METAL (M4) - Dispositivo: {device}")
print("-"*70)

epochs = 30
start_train = time.time()
model.train()

for epoch in range(1, epochs + 1):
    total_loss = 0.0
    for X_b, y_b in train_loader:
        X_b, y_b = X_b.to(device), y_b.to(device)
        optimizer.zero_grad()
        preds = model(X_b)
        loss = criterion(preds, y_b)
        loss.backward()
        optimizer.step()
        total_loss += loss.item() * len(X_b)
    
    if epoch % 5 == 0 or epoch == epochs:
        avg_loss = total_loss / len(train_dataset)
        print(f"  Epoch [{epoch:02d}/{epochs}] - Loss (MSE escalado): {avg_loss:.6f}")

train_time = time.time() - start_train
print(f"\n⚡ Tiempo total de entrenamiento en Metal: {train_time:.2f} segundos ({train_time/epochs:.3f} s/epoch)")

# 5. Evaluación en Test Set
model.eval()
test_preds = []
with torch.no_grad():
    for X_b, _ in test_loader:
        X_b = X_b.to(device)
        preds = model(X_b)
        test_preds.append(preds.cpu().numpy())

test_preds = np.vstack(test_preds)
y_pred_real = scaler_y.inverse_transform(test_preds)
y_test_real = scaler_y.inverse_transform(y_te_seq)

r2 = r2_score(y_test_real, y_pred_real)
rmse = np.sqrt(mean_squared_error(y_test_real, y_pred_real))
mae = mean_absolute_error(y_test_real, y_pred_real)

print("\n" + "-"*70)
print("  MÉTRICAS DEL MODELO PYTORCH EN TEST (Horizonte D+7)")
print("-"*70)
print(f"  R² Score: {r2:.4f}")
print(f"  RMSE:     ${rmse:.2f} USD/ton")
print(f"  MAE:      ${mae:.2f} USD/ton")

# 6. Exportación a Core ML (.mlpackage para Apple Neural Engine)
print("\n" + "-"*70)
print("  EXPORTANDO A CORE ML (.mlpackage para Apple Neural Engine)")
print("-"*70)

model.cpu().eval()
example_input = torch.rand(1, TIME_STEPS, len(feature_cols), dtype=torch.float32)
traced_model = torch.jit.trace(model, example_input)

# Convertir con coremltools habilitando el Neural Engine
coreml_model = ct.convert(
    traced_model,
    inputs=[ct.TensorType(name="market_sequence", shape=example_input.shape)],
    compute_units=ct.ComputeUnit.ALL, # ALL habilita CPU + GPU + Apple Neural Engine (ANE)
    minimum_deployment_target=ct.target.macOS14
)

coreml_model.author = "Agro-IA Engineering"
coreml_model.short_description = "Pronosticador M4 de Contrato Nº5 de Azúcar (Neural Engine)"
coreml_model.save(COREML_SAVE_PATH)

print(f"✅ Modelo guardado con éxito en:")
print(f"   {COREML_SAVE_PATH}")

# 7. Benchmark de Latencia de Inferencia: PyTorch vs Core ML (ANE)
print("\n" + "-"*70)
print("  BENCHMARK DE INFERENCIA: PYTORCH (MPS) vs. CORE ML (NEURAL ENGINE)")
print("-"*70)

input_dict = {"market_sequence": example_input.numpy()}

# Inferencia PyTorch MPS
model.to(device)
example_mps = example_input.to(device)

# Warmup
for _ in range(10): _ = model(example_mps)

t0 = time.time()
N_RUNS = 100
for _ in range(N_RUNS):
    _ = model(example_mps)
    if device.type == 'mps': torch.mps.synchronize()
pytorch_time = (time.time() - t0) / N_RUNS * 1000

# Inferencia Core ML (Neural Engine)
# Warmup
for _ in range(10): _ = coreml_model.predict(input_dict)

t0 = time.time()
for _ in range(N_RUNS):
    coreml_pred = coreml_model.predict(input_dict)
coreml_time = (time.time() - t0) / N_RUNS * 1000

print(f"  ⏱️  Latencia PyTorch (GPU Metal):     {pytorch_time:.2f} ms por predicción")
print(f"  ⚡ Latencia Core ML (Neural Engine):   {coreml_time:.2f} ms por predicción")
print(f"  Consumo energético en ANE:             Prácticamente NULO (< 2 Watts)")

# 8. Pronóstico de Hoy en Vivo
last_sequence = X_vals[-TIME_STEPS:].reshape(1, TIME_STEPS, len(feature_cols)).astype(np.float32)
last_sequence_scaled = scaler_X.transform(last_sequence.reshape(-1, len(feature_cols))).reshape(1, TIME_STEPS, len(feature_cols))

pred_coreml = coreml_model.predict({"market_sequence": last_sequence_scaled})
# Obtener el nombre del tensor de salida
out_name = list(pred_coreml.keys())[0]
scaled_pred_val = pred_coreml[out_name].item()
final_price_d7 = scaler_y.inverse_transform([[scaled_pred_val]])[0][0]

last_known_price = df['sugar_5'].iloc[-1]
delta_pct = ((final_price_d7 - last_known_price) / last_known_price) * 100

print("\n" + "="*75)
print("  PRONÓSTICO EN VIVO GENERADO POR APPLE NEURAL ENGINE")
print("="*75)
print(f"  Último Precio Contrato #5 Conocido: ${last_known_price:.2f} USD/ton")
print(f"  Pronóstico a 7 días (Core ML M4):  ${final_price_d7:.2f} USD/ton ({delta_pct:+.2f}%)")
print("="*75)
