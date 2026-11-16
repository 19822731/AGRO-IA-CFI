"""
Sistema Agro-IA 2026: Conector UN Comtrade API (Naciones Unidas)
================================================================
Consulta los flujos aduaneros oficiales globales de azúcar bajo el Sistema Armonizado:
  - HS 1701.14: Azúcar de caña en bruto
  - HS 1701.99: Azúcar blanco / refinado

País reportador principal: Argentina (Reporter Code 32).
Permite también auditar a Brasil (76), Tailandia (764) e India (699).
Implementa control estricto de tasa (rate limiting) y caching local en CSV.
"""

import os
import sys
import time
import json
import urllib.request
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'Datos')
os.makedirs(DATA_DIR, exist_ok=True)

OUTPUT_FILE = os.path.join(DATA_DIR, 'un_comtrade_sugar.csv')

def consultar_un_comtrade_periodo(reporter_code, cmd_code, flow_code='X', period='2023', max_retries=3):
    """
    Realiza una consulta a la API pública de UN Comtrade con manejo de reintentos y 429.
    """
    url = f"https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode={reporter_code}&period={period}&cmdCode={cmd_code}&flowCode={flow_code}"
    headers = {
        'User-Agent': 'AgroIA-Intelligence-Research/2.0 (Agricultural Economic Modeling; Python/urllib)'
    }
    
    for intento in range(max_retries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                return data.get('data', [])
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait_sec = (intento + 1) * 3
                # print(f"    [Rate limit 429] Esperando {wait_sec}s...")
                time.sleep(wait_sec)
            elif e.code == 400:
                # Período no disponible o solicitud no válida
                return []
            else:
                time.sleep(2)
        except Exception:
            time.sleep(2)
            
    return []

def descargar_comtrade_argentina(ano_inicio=2015, ano_fin=2024):
    print("\n" + "="*80)
    print(f"  CONSULTANDO UN COMTRADE API - EXPORTACIONES DE AZÚCAR ARGENTINA (HS 1701)")
    print("="*80)
    
    registros = []
    cmds = [
        ('170199', 'Blanco_Refinado_LDN5'),
        ('170114', 'Crudo_VHP_NY11')
    ]
    
    for ano in range(ano_inicio, ano_fin + 1):
        print(f"  Consultando año {ano}...")
        for cmd_code, tipo_desc in cmds:
            datos = consultar_un_comtrade_periodo(reporter_code=32, cmd_code=cmd_code, flow_code='X', period=str(ano))
            time.sleep(1.8) # Respetar tasa pública
            
            for item in datos:
                # partnerCode 0 es Total Mundo
                is_world = (item.get('partnerCode') == 0)
                partner_desc = item.get('partnerDesc') or ('Mundo (Total)' if is_world else f"Partner_{item.get('partnerCode')}")
                
                net_wgt_kg = item.get('netWgt') or 0.0
                fob_val_usd = item.get('primaryValue') or 0.0
                
                if net_wgt_kg > 0 or fob_val_usd > 0:
                    registros.append({
                        'Periodo': ano,
                        'Reporter_Code': 32,
                        'Reporter_Pais': 'Argentina',
                        'Partner_Code': item.get('partnerCode'),
                        'Partner_Desc': partner_desc,
                        'HS_Code': cmd_code,
                        'Tipo_Azucar': tipo_desc,
                        'Es_Total_Mundo': is_world,
                        'TN_Exportadas': round(net_wgt_kg / 1000.0, 2),
                        'FOB_USD': round(fob_val_usd, 2),
                        'Precio_Medio_USD_TN': round(fob_val_usd / (net_wgt_kg / 1000.0), 2) if net_wgt_kg > 0 else 0.0
                    })
                    
    if registros:
        df = pd.DataFrame(registros)
        df.to_csv(OUTPUT_FILE, index=False)
        print(f"\n  ✓ Datos UN Comtrade guardados con éxito en: {OUTPUT_FILE} ({len(df)} registros)")
        
        # Resumen anual Mundo
        df_mundo = df[df['Es_Total_Mundo'] == True]
        if not df_mundo.empty:
            print("\nResumen Anual Exportaciones Oficiales de Argentina (Mundo):")
            pivot = df_mundo.pivot_table(index='Periodo', columns='Tipo_Azucar', values='TN_Exportadas', aggfunc='sum').fillna(0)
            pivot['Total_Export_TN'] = pivot.sum(axis=1)
            print(pivot.to_string())
        return df
    else:
        print("  Aviso: No se obtuvieron registros o la API limitó las solicitudes.")
        return None

if __name__ == '__main__':
    descargar_comtrade_argentina(2015, 2024)
