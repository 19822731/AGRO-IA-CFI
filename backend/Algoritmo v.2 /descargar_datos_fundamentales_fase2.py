import os
import urllib.request
import zipfile
import io
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATOS_DIR = os.path.join(BASE_DIR, 'Datos')
os.makedirs(DATOS_DIR, exist_ok=True)

NOAA_CSV = os.path.join(DATOS_DIR, 'noaa_oni_monthly.csv')
USDA_CSV = os.path.join(DATOS_DIR, 'usda_sugar_balance.csv')

print("="*85)
print("  FASE 2: DESCARGA E INGESTA DE DATOS FUNDAMENTALES (NOAA ENSO & USDA FAS)")
print("="*85)

# 1. DESCARGA DE NOAA CPC OCEANIC NIÑO INDEX (ONI)
print("\n[1/2] Descargando índice oceánico El Niño / La Niña (NOAA CPC)...")
url_noaa = 'https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt'
req = urllib.request.Request(url_noaa, headers={'User-Agent': 'Mozilla/5.0'})

with urllib.request.urlopen(req, timeout=15) as resp:
    lines = resp.read().decode('utf-8').strip().split('\n')

records_noaa = []
season_to_month = {
    'DJF': 1, 'JFM': 2, 'FMA': 3, 'MAM': 4,
    'AMJ': 5, 'MJJ': 6, 'JJA': 7, 'JAS': 8,
    'ASO': 9, 'SON': 10, 'OND': 11, 'NDJ': 12
}

for line in lines[1:]:
    parts = line.split()
    if len(parts) >= 4:
        season, year, sst, anom = parts[0], int(parts[1]), float(parts[2]), float(parts[3])
        if season in season_to_month and year >= 2008:
            m = season_to_month[season]
            date = pd.Timestamp(year=year, month=m, day=1)
            records_noaa.append({
                'Fecha': date,
                'oni_season': season,
                'oni_sst': sst,
                'oni_anom': anom,
                'oni_is_el_nino': 1 if anom >= 0.5 else 0,
                'oni_is_la_nina': 1 if anom <= -0.5 else 0
            })

df_noaa = pd.DataFrame(records_noaa).set_index('Fecha').sort_index()
df_noaa['oni_anom_change_3m'] = df_noaa['oni_anom'] - df_noaa['oni_anom'].shift(3)
df_noaa.to_csv(NOAA_CSV)
print(f"  ✓ NOAA ONI guardado: {len(df_noaa)} meses ({df_noaa.index.min().strftime('%Y-%m')} a {df_noaa.index.max().strftime('%Y-%m')})")
print(f"  Última lectura ONI ({df_noaa.index[-1].strftime('%Y-%m')}): Anomalía {df_noaa['oni_anom'].iloc[-1]:+.2f}°C")

# 2. DESCARGA DE USDA FAS PSD SUGAR DATABASE
print("\n[2/2] Descargando base de datos mundial de azúcar (USDA FAS PSD)...")
url_usda = 'https://apps.fas.usda.gov/psdonline/downloads/psd_sugar_csv.zip'
req_u = urllib.request.Request(url_usda, headers={'User-Agent': 'Mozilla/5.0'})

with urllib.request.urlopen(req_u, timeout=25) as resp:
    z = zipfile.ZipFile(io.BytesIO(resp.read()))
    csv_name = [f for f in z.namelist() if f.endswith('.csv')][0]
    df_psd = pd.read_csv(z.open(csv_name))

df_sugar = df_psd[df_psd['Commodity_Description'].str.contains('Sugar', case=False, na=False)].copy()
df_sugar = df_sugar[df_sugar['Market_Year'] >= 2008]

# Agrupación Global (Suma de todos los países por Market_Year y Attribute_Description)
pivot_world = df_sugar.pivot_table(index='Market_Year', columns='Attribute_Description', values='Value', aggfunc='sum')

# Datos individuales de Brasil e India
df_br = df_sugar[df_sugar['Country_Name'] == 'Brazil'].pivot_table(index='Market_Year', columns='Attribute_Description', values='Value', aggfunc='sum')
df_in = df_sugar[df_sugar['Country_Name'] == 'India'].pivot_table(index='Market_Year', columns='Attribute_Description', values='Value', aggfunc='sum')

df_usda_annual = pd.DataFrame(index=pivot_world.index)

# Totales Mundiales
df_usda_annual['usda_world_production'] = pivot_world['Production']
df_usda_annual['usda_world_ending_stocks'] = pivot_world['Ending Stocks']
df_usda_annual['usda_world_consumption'] = pivot_world['Human Dom. Consumption']
df_usda_annual['usda_world_exports'] = pivot_world['Exports']

# Producción de los dos gigantes (Brasil e India)
df_usda_annual['usda_brazil_production'] = df_br['Production']
df_usda_annual['usda_india_production'] = df_in['Production']

# Ratios Estructurales del Balance Azucarero
# 1. Stocks-to-Use Ratio (%) = Ending Stocks / Consumption
df_usda_annual['usda_stocks_to_use_pct'] = (df_usda_annual['usda_world_ending_stocks'] / df_usda_annual['usda_world_consumption']) * 100.0
# 2. Superávit / Déficit Global (Miles de toneladas métricas)
df_usda_annual['usda_surplus_deficit_mt'] = df_usda_annual['usda_world_production'] - df_usda_annual['usda_world_consumption']
# 3. Variación interanual de inventarios (%)
df_usda_annual['usda_stocks_var_yoy'] = df_usda_annual['usda_world_ending_stocks'].pct_change() * 100.0
# 4. Cuota de producción de Brasil sobre el total mundial (%)
df_usda_annual['usda_brazil_share_pct'] = (df_usda_annual['usda_brazil_production'] / df_usda_annual['usda_world_production']) * 100.0

# Asignar fecha semestral de disponibilidad del reporte para evitar lookahead bias
# Los reportes USDA Sugar se publican oficialmente en Mayo (disponible desde junio)
dates = [pd.Timestamp(year=int(y), month=6, day=1) for y in df_usda_annual.index]
df_usda_annual['Fecha'] = dates
df_usda_annual = df_usda_annual.set_index('Fecha').sort_index()

df_usda_annual.to_csv(USDA_CSV)
print(f"  ✓ USDA Balance guardado: {len(df_usda_annual)} años de balance físico mundial ({df_usda_annual.index.min().strftime('%Y')} a {df_usda_annual.index.max().strftime('%Y')}).")
print("\nÚltimos 4 balances anuales de azúcar mundial (USDA FAS):")
print(df_usda_annual[['usda_world_production', 'usda_world_ending_stocks', 'usda_stocks_to_use_pct', 'usda_surplus_deficit_mt', 'usda_brazil_share_pct']].tail(4))

print(f"\nArchivos generados exitosamente en:")
print(f"  - {NOAA_CSV}")
print(f"  - {USDA_CSV}")
