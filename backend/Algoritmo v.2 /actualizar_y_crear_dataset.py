import os
import json
import pandas as pd
import numpy as np
from datetime import datetime
import yfinance as yf
from curl_cffi import requests
from bs4 import BeautifulSoup

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'Datos')
DATASET_MAESTRO_PATH = os.path.join(DATA_DIR, 'dataset_maestro_COMPLETO.csv')

print("="*70)
print("  ACTUALIZACIÓN INTEGRAL DE DATOS DE MERCADO HASTA 2026")
print("="*70)

# 1. Actualizar Futuros Azúcar Nº5 Londres vía Investing.com
def get_london_sugar():
    print("\n[1/6] Obteniendo Contrato Nº 5 Londres (White Sugar)...")
    fp = os.path.join(DATA_DIR, 'Futuros azúcar Nº5 Londres.csv')
    
    url = 'https://www.investing.com/commodities/london-sugar-historical-data'
    s = requests.Session()
    resp = s.get(url, impersonate='chrome124')
    token = json.loads(BeautifulSoup(resp.text, 'html.parser').find('script', id='__NEXT_DATA__').string)['props']['pageProps']['accessToken']
    api_url = 'https://api.investing.com/api/financialdata/historical/8834'
    headers = {'domain-id': 'www', 'Authorization': f'Bearer {token}'}
    params = {'start-date': '2025-11-01', 'end-date': datetime.now().strftime('%Y-%m-%d'), 'time-frame': 'Daily', 'add-missing-rows': 'false'}
    r = s.get(api_url, params=params, headers=headers, impersonate='chrome124')
    records = r.json().get('data', [])

    new_rows = []
    for rec in records:
        dt = pd.to_datetime(rec['rowDateTimestamp'])
        new_rows.append({
            'Fecha': dt.strftime('%d.%m.%Y'),
            'Último': f"{float(rec['last_closeRaw']):.2f}".replace('.', ','),
            'Apertura': f"{float(rec['last_openRaw']):.2f}".replace('.', ','),
            'Máximo': f"{float(rec['last_maxRaw']):.2f}".replace('.', ','),
            'Mínimo': f"{float(rec['last_minRaw']):.2f}".replace('.', ','),
            'Vol.': str(rec.get('volume', '')),
            '% var.': str(rec.get('change_precent', '')) + '%'
        })
    df_new = pd.DataFrame(new_rows)
    df_old = pd.read_csv(fp, sep=',', encoding='utf-8-sig', dtype=str)
    df_comb = pd.concat([df_new, df_old], ignore_index=True)
    df_comb.drop_duplicates(subset=['Fecha'], keep='first', inplace=True)
    df_comb.to_csv(fp, index=False, encoding='utf-8-sig')
    print(f"  -> Guardado {fp}: {len(df_comb)} filas. Fecha más reciente: {df_comb['Fecha'].iloc[0]}")
    
    # Retornar serie procesada
    df_sugar5 = df_comb[['Fecha', 'Último', 'Máximo', 'Mínimo']].copy()
    df_sugar5['Date'] = pd.to_datetime(df_sugar5['Fecha'], format='%d.%m.%Y', errors='coerce')
    df_sugar5.dropna(subset=['Date'], inplace=True)
    df_sugar5['sugar_5'] = df_sugar5['Último'].str.replace('.', '', regex=False).str.replace(',', '.', regex=False).astype(float)
    df_sugar5['sugar_5_high'] = df_sugar5['Máximo'].str.replace('.', '', regex=False).str.replace(',', '.', regex=False).astype(float)
    df_sugar5['sugar_5_low'] = df_sugar5['Mínimo'].str.replace('.', '', regex=False).str.replace(',', '.', regex=False).astype(float)
    df_sugar5.set_index('Date', inplace=True)
    df_sugar5 = df_sugar5[['sugar_5', 'sugar_5_high', 'sugar_5_low']]
    return df_sugar5

# 2. Actualizar Futuros Azúcar Nº11 NY vía Yahoo Finance
def get_ny_sugar():
    print("\n[2/6] Obteniendo Contrato Nº 11 EE.UU. (Raw Sugar SB=F)...")
    fp = os.path.join(DATA_DIR, 'Futuros azúcar Nº11 EE.UU.csv')
    df_yf = yf.download('SB=F', start='2010-01-01', progress=False)
    if hasattr(df_yf.columns, 'levels'):
        df_yf.columns = df_yf.columns.get_level_values(0)
    
    # También actualizar el CSV local
    new_rows = []
    for dt, row in df_yf.loc['2025-11-01':].iterrows():
        new_rows.append({
            'Fecha': dt.strftime('%d.%m.%Y'),
            'Último': f"{float(row['Close']):.2f}".replace('.', ','),
            'Apertura': f"{float(row['Open']):.2f}".replace('.', ','),
            'Máximo': f"{float(row['High']):.2f}".replace('.', ','),
            'Mínimo': f"{float(row['Low']):.2f}".replace('.', ','),
            'Vol.': str(int(row['Volume'])) if 'Volume' in row and not pd.isna(row['Volume']) else "",
            '% var.': ""
        })
    df_new = pd.DataFrame(new_rows)
    df_old = pd.read_csv(fp, sep=',', encoding='utf-8-sig', dtype=str)
    df_comb = pd.concat([df_new, df_old], ignore_index=True)
    df_comb.drop_duplicates(subset=['Fecha'], keep='first', inplace=True)
    df_comb.to_csv(fp, index=False, encoding='utf-8-sig')
    print(f"  -> Guardado {fp}: {len(df_comb)} filas. Fecha más reciente: {df_comb['Fecha'].iloc[0]}")
    
    df_sugar11 = pd.DataFrame(index=df_yf.index)
    df_sugar11['sugar_11'] = df_yf['Close']
    df_sugar11['sugar_11_high'] = df_yf['High']
    df_sugar11['sugar_11_low'] = df_yf['Low']
    return df_sugar11

# 3. Obtener Petróleo WTI y Brent
def get_oil_data():
    print("\n[3/6] Obteniendo Petróleo WTI (CL=F) y Brent (BZ=F)...")
    df_wti = yf.download('CL=F', start='2010-01-01', progress=False)
    if hasattr(df_wti.columns, 'levels'): df_wti.columns = df_wti.columns.get_level_values(0)
    
    df_brent = yf.download('BZ=F', start='2010-01-01', progress=False)
    if hasattr(df_brent.columns, 'levels'): df_brent.columns = df_brent.columns.get_level_values(0)
    
    df_oil = pd.DataFrame(index=df_wti.index)
    df_oil['oil_wti'] = df_wti['Close']
    df_oil['oil_wti_high'] = df_wti['High']
    df_oil['oil_wti_low'] = df_wti['Low']
    
    # Merge brent
    df_oil = df_oil.join(df_brent[['Close', 'High', 'Low']].rename(
        columns={'Close': 'oil_brent', 'High': 'oil_brent_high', 'Low': 'oil_brent_low'}
    ), how='outer')
    return df_oil

# 4. Obtener Divisas (USD_BRL, USD_ARS, DXY)
def get_fx_data():
    print("\n[4/6] Obteniendo Divisas e Índices (DXY, USD/BRL, USD/ARS)...")
    dxy = yf.download('DX-Y.NYB', start='2010-01-01', progress=False)
    if hasattr(dxy.columns, 'levels'): dxy.columns = dxy.columns.get_level_values(0)
    
    brl = yf.download('BRL=X', start='2010-01-01', progress=False)
    if hasattr(brl.columns, 'levels'): brl.columns = brl.columns.get_level_values(0)
    
    ars = yf.download('ARS=X', start='2010-01-01', progress=False)
    if hasattr(ars.columns, 'levels'): ars.columns = ars.columns.get_level_values(0)
    
    df_fx = pd.DataFrame(index=dxy.index)
    df_fx['fx_dxy'] = dxy['Close']
    df_fx['fx_dxy_high'] = dxy['High']
    df_fx['fx_dxy_low'] = dxy['Low']
    
    df_fx = df_fx.join(brl['Close'].rename('fx_brl'), how='outer')
    df_fx = df_fx.join(ars['Close'].rename('fx_ars_usd'), how='outer')
    return df_fx

# 5. Obtener Etanol y Gas
def get_energy_data():
    print("\n[5/6] Obteniendo Etanol y Gas Natural...")
    # Cargar Etanol histórico existente
    fp_etanol = os.path.join(DATA_DIR, 'Futuros etanol.csv')
    df_etanol_old = pd.read_csv(fp_etanol, encoding='utf-8-sig', decimal=',', parse_dates=['Fecha'], dayfirst=True)
    df_etanol_old.dropna(subset=['Fecha'], inplace=True)
    df_etanol_old.set_index('Fecha', inplace=True)
    df_etanol_old['ethanol_cbot'] = pd.to_numeric(df_etanol_old['Último'], errors='coerce')
    df_etanol_old['ethanol_cbot_high'] = pd.to_numeric(df_etanol_old['Máximo'], errors='coerce')
    df_etanol_old['ethanol_cbot_low'] = pd.to_numeric(df_etanol_old['Mínimo'], errors='coerce')
    df_etanol = df_etanol_old[['ethanol_cbot', 'ethanol_cbot_high', 'ethanol_cbot_low']].copy()
    
    # Gas Natural Henry Hub
    ng = yf.download('NG=F', start='2010-01-01', progress=False)
    if hasattr(ng.columns, 'levels'): ng.columns = ng.columns.get_level_values(0)
    df_ng = pd.DataFrame(index=ng.index)
    df_ng['natgas_hh'] = ng['Close']
    df_ng['natgas_hh_high'] = ng['High']
    df_ng['natgas_hh_low'] = ng['Low']
    
    df_energy = df_etanol.join(df_ng, how='outer')
    return df_energy

# 6. Unificación y Creación del Dataset Maestro
def build_master():
    print("\n[6/6] Unificando todo en dataset_maestro_COMPLETO.csv...")
    df_s5 = get_london_sugar()
    df_s11 = get_ny_sugar()
    df_oil = get_oil_data()
    df_fx = get_fx_data()
    df_energy = get_energy_data()
    
    # Consolidar
    df_master = df_s11.join(df_s5, how='outer')
    df_master = df_master.join(df_oil, how='outer')
    df_master = df_master.join(df_fx, how='outer')
    df_master = df_master.join(df_energy, how='outer')
    
    # Ordenar por fecha
    df_master.sort_index(inplace=True)
    
    # Filtrar desde 2010-01-01 hasta hoy
    df_master = df_master.loc['2010-01-01':]
    
    # Forward fill y backward fill
    df_master = df_master.ffill().bfill()
    
    # Calcular White Sugar Premium (WSP)
    df_master['white_sugar_premium'] = df_master['sugar_5'] - (df_master['sugar_11'] * 22.0462)
    
    # Guardar
    df_master.to_csv(DATASET_MAESTRO_PATH)
    print("\n" + "="*70)
    print("  ¡DATASET MAESTRO ACTUALIZADO EXITOSAMENTE!")
    print(f"  Ruta: {DATASET_MAESTRO_PATH}")
    print(f"  Rango: {df_master.index.min().strftime('%Y-%m-%d')}  -->  {df_master.index.max().strftime('%Y-%m-%d')}")
    print(f"  Total Registros Diarios: {len(df_master)}")
    print(f"  Últimos Precios Conocidos (Hoy):")
    print(f"    - Contrato #11 (NY): ${df_master['sugar_11'].iloc[-1]:.2f} c/lb")
    print(f"    - Contrato #5 (Londres): ${df_master['sugar_5'].iloc[-1]:.2f} USD/ton")
    print(f"    - White Sugar Premium (WSP): ${df_master['white_sugar_premium'].iloc[-1]:.2f} USD/ton")
    print(f"    - Petróleo WTI: ${df_master['oil_wti'].iloc[-1]:.2f} USD/bbl")
    print(f"    - Petróleo Brent: ${df_master['oil_brent'].iloc[-1]:.2f} USD/bbl")
    print(f"    - USD/BRL: {df_master['fx_brl'].iloc[-1]:.2f}")
    print(f"    - USD/ARS: {df_master['fx_ars_usd'].iloc[-1]:.2f}")
    print("="*70)

if __name__ == '__main__':
    build_master()
