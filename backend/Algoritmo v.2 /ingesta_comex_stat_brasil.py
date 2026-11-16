"""
Sistema Agro-IA 2026: Ingesta de Comercio Exterior - Comex Stat (Brasil MDIC/SECEX)
==================================================================================
Descarga y procesa las exportaciones oficiales de azúcar de Brasil desde 2010 a 2026.
NCM analizados:
  - 1701.14.00: Azúcar de caña en bruto (VHP / Contrato 11 de NY)
  - 1701.99.00: Azúcar refinado / blanco (Contrato 5 de Londres)
  - 1701.13.00, 1701.12.00, 1701.91.00: Otros azúcares

Genera:
  1. Datos/comex_stat_brasil_sugar_mensual.csv (Serie mensual 2010-2026)
  2. Datos/estacionalidad_brasil_historica.csv (Curva estacional porcentual por mes)
"""

import os
import sys
import ssl
import time
import urllib.request
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'Datos')
os.makedirs(DATA_DIR, exist_ok=True)

OUTPUT_FILE = os.path.join(DATA_DIR, 'comex_stat_brasil_sugar_mensual.csv')
ESTACIONALIDAD_FILE = os.path.join(DATA_DIR, 'estacionalidad_brasil_historica.csv')

# Contexto SSL para servidores gubernamentales brasileños
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def procesar_ano_comexstat(ano):
    """
    Descarga mediante streaming el archivo oficial anual de exportación del MDIC
    y filtra exclusivamente las filas de azúcar (NCM 1701).
    """
    url = f"https://balanca.mdic.gov.br/balanca/bd/comexstat-bd/ncm/EXP_{ano}.csv"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    
    registros = []
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=45) as resp:
            # Leer encabezado
            header = resp.readline().decode('latin1').strip().replace('"', '').split(';')
            col_map = {col: i for i, col in enumerate(header)}
            
            idx_mes = col_map.get('CO_MES', 1)
            idx_ncm = col_map.get('CO_NCM', 2)
            idx_kg = col_map.get('KG_LIQUIDO', 9)
            idx_fob = col_map.get('VL_FOB', 10)
            
            for line in resp:
                line_str = line.decode('latin1', errors='ignore')
                if '"1701' in line_str:
                    parts = line_str.strip().replace('"', '').split(';')
                    try:
                        ncm = parts[idx_ncm]
                        if ncm.startswith('1701'):
                            mes = int(parts[idx_mes])
                            kg = float(parts[idx_kg])
                            fob = float(parts[idx_fob])
                            registros.append({
                                'ano': ano,
                                'mes': mes,
                                'ncm': ncm,
                                'kg': kg,
                                'fob_usd': fob
                            })
                    except (ValueError, IndexError):
                        continue
                        
        dt = time.time() - t0
        print(f"  ✓ Año {ano}: {len(registros):,} transacciones de azúcar procesadas en {dt:.1f}s")
        return registros
    except Exception as e:
        print(f"  ✗ Error descargando año {ano}: {e}")
        return []

def descargar_historico_comexstat(ano_inicio=2010, ano_fin=2026):
    print("\n" + "="*80)
    print(f"  INICIANDO INGESTA OFICIAL COMEX STAT (BRASIL MDIC) [{ano_inicio}-{ano_fin}]")
    print("="*80)
    
    todos_registros = []
    for ano in range(ano_inicio, ano_fin + 1):
        regs = procesar_ano_comexstat(ano)
        todos_registros.extend(regs)
        time.sleep(0.5) # Pausa cortés para evitar rate limit
        
    if not todos_registros:
        print("ERROR: No se pudieron obtener registros.")
        return None
        
    df = pd.DataFrame(todos_registros)
    
    # Clasificación por tipo de azúcar
    def clasificar_ncm(ncm):
        if ncm == '17011400' or ncm == '17011100':
            return 'Crudo_VHP_NY11'
        elif ncm == '17019900':
            return 'Blanco_Refinado_LDN5'
        else:
            return 'Otros_Azucares'
            
    df['tipo_azucar'] = df['ncm'].apply(clasificar_ncm)
    
    # Agregación mensual por año y mes
    print("\nAgregando flujos mensuales por partida arancelaria...")
    resumen = []
    for (ano, mes), grp in df.groupby(['ano', 'mes']):
        fecha = f"{ano}-{mes:02d}-01"
        
        # Totales generales
        tn_total = grp['kg'].sum() / 1000.0
        fob_total = grp['fob_usd'].sum()
        precio_medio_fob = fob_total / tn_total if tn_total > 0 else 0.0
        
        # Desglose Crudo VHP (Contrato 11)
        grp_crudo = grp[grp['tipo_azucar'] == 'Crudo_VHP_NY11']
        tn_crudo = grp_crudo['kg'].sum() / 1000.0
        fob_crudo = grp_crudo['fob_usd'].sum()
        precio_fob_crudo = fob_crudo / tn_crudo if tn_crudo > 0 else 0.0
        
        # Desglose Blanco Refinado (Contrato 5)
        grp_blanco = grp[grp['tipo_azucar'] == 'Blanco_Refinado_LDN5']
        tn_blanco = grp_blanco['kg'].sum() / 1000.0
        fob_blanco = grp_blanco['fob_usd'].sum()
        precio_fob_blanco = fob_blanco / tn_blanco if tn_blanco > 0 else 0.0
        
        resumen.append({
            'Fecha': fecha,
            'Ano': ano,
            'Mes': mes,
            'Brasil_Total_Export_TN': round(tn_total, 2),
            'Brasil_Total_FOB_USD': round(fob_total, 2),
            'Brasil_Precio_Medio_FOB_USD_TN': round(precio_medio_fob, 2),
            'Brasil_Crudo_VHP_Export_TN': round(tn_crudo, 2),
            'Brasil_Crudo_FOB_USD': round(fob_crudo, 2),
            'Brasil_Crudo_Precio_FOB_USD_TN': round(precio_fob_crudo, 2),
            'Brasil_Blanco_Refinado_Export_TN': round(tn_blanco, 2),
            'Brasil_Blanco_FOB_USD': round(fob_blanco, 2),
            'Brasil_Blanco_Precio_FOB_USD_TN': round(precio_fob_blanco, 2)
        })
        
    df_mensual = pd.DataFrame(resumen).sort_values('Fecha')
    df_mensual.to_csv(OUTPUT_FILE, index=False)
    print(f"  ✓ Archivo consolidado guardado: {OUTPUT_FILE} ({len(df_mensual)} meses)")
    
    # Calcular Curva Estacional Histórica de Brasil
    print("\nCalculando Curva Estacional Histórica de Exportación (Brasil)...")
    # Usamos años completos 2010 a 2024
    df_completos = df_mensual[df_mensual['Ano'] <= 2025]
    
    # Participación porcentual de cada mes dentro de su respectivo año
    estacionalidad_por_ano = []
    for ano, grp in df_completos.groupby('Ano'):
        if len(grp) >= 12:
            total_ano = grp['Brasil_Total_Export_TN'].sum()
            for _, r in grp.iterrows():
                pct = r['Brasil_Total_Export_TN'] / total_ano if total_ano > 0 else 0
                estacionalidad_por_ano.append({
                    'Ano': ano,
                    'Mes': r['Mes'],
                    'Pct_Exportacion': pct
                })
                
    df_estac_raw = pd.DataFrame(estacionalidad_por_ano)
    curva_estacional = df_estac_raw.groupby('Mes')['Pct_Exportacion'].agg(['mean', 'std']).reset_index()
    curva_estacional.columns = ['Mes', 'Peso_Estacional_Promedio', 'Desvio_Estandar']
    curva_estacional['Acumulado_Esperado'] = curva_estacional['Peso_Estacional_Promedio'].cumsum()
    # Normalizar para que sume exactamente 1.0 al final
    total_peso = curva_estacional['Peso_Estacional_Promedio'].sum()
    curva_estacional['Peso_Estacional_Promedio'] /= total_peso
    curva_estacional['Acumulado_Esperado'] = curva_estacional['Peso_Estacional_Promedio'].cumsum()
    
    curva_estacional.to_csv(ESTACIONALIDAD_FILE, index=False)
    print(f"  ✓ Curva estacional guardada: {ESTACIONALIDAD_FILE}")
    print("\nCurva Estacional Típica Mensual de Exportación de Azúcar (Brasil):")
    for _, r in curva_estacional.iterrows():
        print(f"    Mes {int(r['Mes']):2d}: {r['Peso_Estacional_Promedio']*100:5.2f}% del año | Acumulado al cierre de mes: {r['Acumulado_Esperado']*100:6.2f}%")
        
    return df_mensual

if __name__ == '__main__':
    descargar_historico_comexstat(2010, 2026)
