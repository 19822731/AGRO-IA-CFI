import os
import json
import time
import pandas as pd
import numpy as np
from datetime import datetime
from io import StringIO
import yfinance as yf
from curl_cffi import requests
from bs4 import BeautifulSoup

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'Datos')
OUTPUT_FILE = os.path.join(DATA_DIR, 'dataset_maestro_COMPLETO.csv')

print(f"=== ACTUALIZADOR DE DATOS DE MERCADO (Agro-IA 2026) ===")
print(f"Directorio de datos: {DATA_DIR}")

# 1. Función para actualizar London Sugar No. 5 desde Investing.com
def update_london_sugar_no5():
    print("\n--- Actualizando Contrato Nº 5 (London White Sugar) desde Investing.com ---")
    filename = 'Futuros azúcar Nº5 Londres.csv'
    filepath = os.path.join(DATA_DIR, filename)
    
    # Obtener token de la página de Investing
    try:
        url = 'https://www.investing.com/commodities/london-sugar-historical-data'
        s = requests.Session()
        resp = s.get(url, impersonate='chrome124')
        soup = BeautifulSoup(resp.text, 'html.parser')
        script = soup.find('script', id='__NEXT_DATA__')
        token = json.loads(script.string)['props']['pageProps']['accessToken']
        
        api_url = 'https://api.investing.com/api/financialdata/historical/8834'
        headers = {'domain-id': 'www', 'Authorization': f'Bearer {token}'}
        params = {
            'start-date': '2025-11-01',
            'end-date': datetime.now().strftime('%Y-%m-%d'),
            'time-frame': 'Daily',
            'add-missing-rows': 'false'
        }
        r = s.get(api_url, params=params, headers=headers, impersonate='chrome124')
        if r.status_code != 200:
            print(f"❌ Error al consultar API de Investing: {r.status_code}")
            return
            
        records = r.json().get('data', [])
        print(f"Recibidos {len(records)} registros recientes de Contrato #5.")
        
        new_rows = []
        for rec in records:
            # Parse date "2026-11-09T00:00:00Z"
            dt = pd.to_datetime(rec['rowDateTimestamp'])
            date_str = dt.strftime('%d.%m.%Y')
            
            close_val = float(rec['last_closeRaw'])
            open_val = float(rec['last_openRaw'])
            max_val = float(rec['last_maxRaw'])
            min_val = float(rec['last_minRaw'])
            vol = str(rec.get('volume', ''))
            var_pct = str(rec.get('change_precent', '')) + '%'
            
            # Format with comma decimal
            new_rows.append({
                'Fecha': date_str,
                'Último': f"{close_val:.2f}".replace('.', ','),
                'Apertura': f"{open_val:.2f}".replace('.', ','),
                'Máximo': f"{max_val:.2f}".replace('.', ','),
                'Mínimo': f"{min_val:.2f}".replace('.', ','),
                'Vol.': vol,
                '% var.': var_pct
            })
            
        df_new = pd.DataFrame(new_rows)
        
        # Leer archivo existente
        if os.path.exists(filepath):
            df_old = pd.read_csv(filepath, sep=',', encoding='utf-8-sig', dtype=str)
            # Combinar evitando duplicados de fecha
            df_comb = pd.concat([df_new, df_old], ignore_index=True)
            df_comb.drop_duplicates(subset=['Fecha'], keep='first', inplace=True)
            df_comb.to_csv(filepath, index=False, encoding='utf-8-sig')
            print(f"✅ Archivo actualizado: {filename} ({len(df_comb)} filas totales, última fecha: {df_comb['Fecha'].iloc[0]})")
        else:
            df_new.to_csv(filepath, index=False, encoding='utf-8-sig')
            print(f"✅ Archivo creado: {filename} ({len(df_new)} filas)")
            
    except Exception as e:
        print(f"❌ Error actualizando London Sugar No. 5: {e}")

# 2. Función para actualizar activos vía Yahoo Finance
def update_yfinance_assets():
    yf_configs = [
        {
            'filename': 'Futuros azúcar Nº11 EE.UU.csv',
            'ticker': 'SB=F',
            'name': 'Contrato Nº 11 (Sugar #11)',
            'start': '2025-11-01'
        },
        {
            'filename': 'Futuros petróleo crudo WTI.csv',
            'ticker': 'CL=F',
            'name': 'Petróleo WTI',
            'start': '2025-11-01'
        },
        {
            'filename': 'Futuros petróleo Brent.csv',
            'ticker': 'BZ=F',
            'name': 'Petróleo Brent',
            'start': '2025-11-01'
        },
        {
            'filename': 'Micro Henry Hub Natural Gas Futures.csv',
            'ticker': 'NG=F',
            'name': 'Gas Natural Henry Hub',
            'start': '2025-11-01'
        },
        {
            'filename': 'Dutch TTF Natural Gas Futures.csv',
            'ticker': 'TTF=F',
            'name': 'Gas Natural Dutch TTF',
            'start': '2025-11-01',
            'format_dot': True
        },
        {
            'filename': 'Índice dólar(DXY).csv',
            'ticker': 'DX-Y.NYB',
            'name': 'Índice Dólar DXY',
            'start': '2025-11-01'
        },
        {
            'filename': 'USD_BRL.csv',
            'ticker': 'BRL=X',
            'name': 'USD/BRL',
            'start': '2025-11-01'
        },
        {
            'filename': 'USD_ARS.csv',
            'ticker': 'ARS=X',
            'name': 'USD/ARS',
            'start': '2025-11-01',
            'format_ars': True
        }
    ]
    
    for cfg in yf_configs:
        print(f"\n--- Descargando {cfg['name']} ({cfg['ticker']}) ---")
        filepath = os.path.join(DATA_DIR, cfg['filename'])
        try:
            df_yf = yf.download(cfg['ticker'], start=cfg['start'], progress=False)
            if df_yf.empty:
                print(f"⚠️ Sin datos nuevos para {cfg['name']}.")
                continue
            if isinstance(df_yf.columns, pd.MultiIndex):
                df_yf.columns = df_yf.columns.get_level_values(0)
                
            new_rows = []
            for dt, row in df_yf.iterrows():
                date_str = dt.strftime('%d.%m.%Y')
                close_val = float(row['Close'])
                max_val = float(row['High']) if 'High' in row else close_val
                min_val = float(row['Low']) if 'Low' in row else close_val
                open_val = float(row['Open']) if 'Open' in row else close_val
                
                if cfg.get('format_dot'):
                    new_rows.append({
                        'Date': dt.strftime('%m/%d/%Y'),
                        'Price': f"{close_val:.2f}",
                        'Open': f"{open_val:.2f}",
                        'High': f"{max_val:.2f}",
                        'Low': f"{min_val:.2f}",
                        'Vol.': "",
                        'Change %': ""
                    })
                elif cfg.get('format_ars'):
                    # USD_ARS format
                    new_rows.append({
                        'Fecha': date_str,
                        'Último': f"{close_val:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'),
                        'Apertura': f"{open_val:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'),
                        'Máximo': f"{max_val:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'),
                        'Mínimo': f"{min_val:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'),
                        '% var.': ""
                    })
                else:
                    new_rows.append({
                        'Fecha': date_str,
                        'Último': f"{close_val:.2f}".replace('.', ','),
                        'Apertura': f"{open_val:.2f}".replace('.', ','),
                        'Máximo': f"{max_val:.2f}".replace('.', ','),
                        'Mínimo': f"{min_val:.2f}".replace('.', ','),
                        'Vol.': "",
                        '% var.': ""
                    })
                    
            df_new = pd.DataFrame(new_rows)
            date_col = 'Date' if cfg.get('format_dot') else 'Fecha'
            
            if os.path.exists(filepath):
                df_old = pd.read_csv(filepath, encoding='utf-8-sig', dtype=str)
                df_comb = pd.concat([df_new, df_old], ignore_index=True)
                df_comb.drop_duplicates(subset=[date_col], keep='first', inplace=True)
                df_comb.to_csv(filepath, index=False, encoding='utf-8-sig')
                print(f"✅ Archivo actualizado: {cfg['filename']} ({len(df_comb)} filas)")
            else:
                df_new.to_csv(filepath, index=False, encoding='utf-8-sig')
                print(f"✅ Archivo creado: {cfg['filename']}")
                
        except Exception as e:
            print(f"❌ Error con {cfg['name']}: {e}")

# 3. Consolidación del Dataset Maestro
def rebuild_dataset_maestro():
    print("\n" + "="*60)
    print("--- Consolidando Dataset Maestro (dataset_maestro_COMPLETO.csv) ---")
    print("="*60)
    
    FILES_CONFIG = [
        {
            'filename': 'Futuros azúcar Nº11 EE.UU.csv',
            'date_col': 'Fecha',
            'cols_to_use': ['Último', 'Máximo', 'Mínimo'],
            'rename_map': {'Último': 'sugar_11', 'Máximo': 'sugar_11_high', 'Mínimo': 'sugar_11_low'},
            'decimal': ',', 'thousands': None
        },
        {
            'filename': 'Futuros azúcar Nº5 Londres.csv',
            'date_col': 'Fecha',
            'cols_to_use': ['Último', 'Máximo', 'Mínimo'],
            'rename_map': {'Último': 'sugar_5', 'Máximo': 'sugar_5_high', 'Mínimo': 'sugar_5_low'},
            'decimal': ',', 'thousands': None
        },
        {
            'filename': 'Futuros petróleo crudo WTI.csv',
            'date_col': 'Fecha',
            'cols_to_use': ['Último', 'Máximo', 'Mínimo'],
            'rename_map': {'Último': 'oil_wti', 'Máximo': 'oil_wti_high', 'Mínimo': 'oil_wti_low'},
            'decimal': ',', 'thousands': None
        },
        {
            'filename': 'Futuros petróleo Brent.csv',
            'date_col': 'Fecha',
            'cols_to_use': ['Último', 'Máximo', 'Mínimo'],
            'rename_map': {'Último': 'oil_brent', 'Máximo': 'oil_brent_high', 'Mínimo': 'oil_brent_low'},
            'decimal': ',', 'thousands': None
        },
        {
            'filename': 'Futuros etanol.csv',
            'date_col': 'Fecha',
            'cols_to_use': ['Último', 'Máximo', 'Mínimo'],
            'rename_map': {'Último': 'ethanol_cbot', 'Máximo': 'ethanol_cbot_high', 'Mínimo': 'ethanol_cbot_low'},
            'decimal': ',', 'thousands': None
        },
        {
            'filename': 'Micro Henry Hub Natural Gas Futures.csv',
            'date_col': 'Fecha',
            'cols_to_use': ['Último', 'Máximo', 'Mínimo'],
            'rename_map': {'Último': 'natgas_hh', 'Máximo': 'natgas_hh_high', 'Mínimo': 'natgas_hh_low'},
            'decimal': ',', 'thousands': None
        },
        {
            'filename': 'Índice dólar(DXY).csv',
            'date_col': 'Fecha',
            'cols_to_use': ['Último', 'Máximo', 'Mínimo'],
            'rename_map': {'Último': 'fx_dxy', 'Máximo': 'fx_dxy_high', 'Mínimo': 'fx_dxy_low'},
            'decimal': ',', 'thousands': None
        },
        {
            'filename': 'USD_BRL.csv',
            'date_col': 'Fecha',
            'cols_to_use': ['Último'],
            'rename_map': {'Último': 'fx_brl_usd'},
            'decimal': ',', 'thousands': None
        },
        {
            'filename': 'USD_ARS.csv',
            'date_col': 'Fecha',
            'cols_to_use': ['Último'],
            'rename_map': {'Último': 'fx_ars_usd'},
            'decimal': ',', 'thousands': '.'
        }
    ]
    
    all_dfs = []
    for cfg in FILES_CONFIG:
        fp = os.path.join(DATA_DIR, cfg['filename'])
        if not os.path.exists(fp):
            print(f"⚠️ Archivo no encontrado: {cfg['filename']}")
            continue
            
        try:
            cols = [cfg['date_col']] + cfg['cols_to_use']
            df = pd.read_csv(fp, encoding='utf-8-sig', usecols=cols, decimal=cfg['decimal'], thousands=cfg.get('thousands'))
            df[cfg['date_col']] = pd.to_datetime(df[cfg['date_col']], dayfirst=True, errors='coerce')
            df.dropna(subset=[cfg['date_col']], inplace=True)
            
            for col in cfg['cols_to_use']:
                df[col] = pd.to_numeric(df[col], errors='coerce')
                
            ren = cfg['rename_map'].copy()
            ren[cfg['date_col']] = 'Date'
            df.rename(columns=ren, inplace=True)
            df.set_index('Date', inplace=True)
            all_dfs.append(df)
            print(f"  ✅ Integrado: {cfg['filename']} ({df.index.min().strftime('%Y-%m-%d')} a {df.index.max().strftime('%Y-%m-%d')})")
        except Exception as e:
            print(f"  ❌ Error con {cfg['filename']}: {e}")
            
    if all_dfs:
        df_master = pd.concat(all_dfs, axis=1)
        df_master.sort_index(inplace=True)
        # Filtrar desde 2010
        df_master = df_master.loc['2010-01-01':]
        df_master = df_master.ffill().bfill()
        
        # Calcular White Sugar Premium (WSP): Cto 5 ($/ton) - Cto 11 (cents/lb * 22.0462)
        if 'sugar_5' in df_master.columns and 'sugar_11' in df_master.columns:
            df_master['white_sugar_premium'] = df_master['sugar_5'] - (df_master['sugar_11'] * 22.0462)
            print("  ⭐ Característica calculada: White Sugar Premium (WSP)")
            
        df_master.to_csv(OUTPUT_FILE)
        print("\n" + "="*50)
        print(f"🎉 DATASET MAESTRO ACTUALIZADO CON ÉXITO")
        print(f"Ruta: {OUTPUT_FILE}")
        print(f"Rango de fechas: {df_master.index.min().strftime('%Y-%m-%d')} a {df_master.index.max().strftime('%Y-%m-%d')}")
        print(f"Total observaciones: {len(df_master)}")
        print(f"Columnas ({len(df_master.columns)}): {df_master.columns.tolist()}")
        print("="*50)
        return df_master
    return None

if __name__ == '__main__':
    update_london_sugar_no5()
    update_yfinance_assets()
    rebuild_dataset_maestro()
