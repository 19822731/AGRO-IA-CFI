
import pandas as pd
import numpy as np
import os
import sys
from datetime import timedelta
import re
import ta # Importar la librería TA

# --- Configuración de Rutas ---
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, 'data')
AGRO_IA_ROOT = os.path.dirname(PROJECT_ROOT)

if AGRO_IA_ROOT not in sys.path:
    sys.path.append(AGRO_IA_ROOT)

try:
    from config import settings
    print("Módulo 'config' de AGRO-IA importado con éxito.")
except ImportError:
    print("Error Crítico: No se pudo importar 'config.py'. Usando valores de comisión por defecto.")
    class MockSettings:
        COMISION_VENDEDOR = 0.02
        COMISION_COMPRADOR_BASE = 0.02
        MIN_COMISION = 0.02
        MAX_COMISION = 0.06
        K_FACTOR = 0.1
    settings = MockSettings()

# --- Funciones de Carga y Limpieza ---

def clean_numeric_column(series, decimal_separator=',', multiplier=1.0):
    s = series.astype(str).str.strip()
    s = s.str.replace(r'[^\d' + decimal_separator + ']', '', regex=True)
    if decimal_separator != '.':
        s = s.str.replace(decimal_separator, '.')
    return pd.to_numeric(s, errors='coerce') * multiplier

def load_and_clean_futures_data(filepath, contract_name):
    df = pd.read_csv(filepath, delimiter=',', decimal=',')
    df.drop_duplicates(subset=['Fecha'], keep='last', inplace=True)
    df.columns = df.columns.str.strip().str.replace('.', '', regex=False)
    df['Fecha'] = pd.to_datetime(df['Fecha'], format='%d.%m.%Y')
    df.set_index('Fecha', inplace=True)
    df.sort_index(inplace=True)
    for col in ['Último', 'Apertura', 'Máximo', 'Mínimo']:
        df[col] = clean_numeric_column(df[col], decimal_separator=',')
    df['Vol'] = pd.to_numeric(df['Vol'].str.replace('K','', regex=False).str.replace(',','.'), errors='coerce') * 1000
    df = df[['Último', 'Apertura', 'Máximo', 'Mínimo', 'Vol']].rename(columns={
        'Último': f'{contract_name}_Close', 'Apertura': f'{contract_name}_Open',
        'Máximo': f'{contract_name}_High', 'Mínimo': f'{contract_name}_Low', 'Vol': f'{contract_name}_Volume'
    })
    return df

def load_and_clean_internal_market_data(filepath):
    df = pd.read_csv(filepath, delimiter=',', decimal=',', skiprows=2)
    df.drop_duplicates(subset=['Fecha'], keep='last', inplace=True)
    df.columns = df.columns.str.strip()
    df['Fecha'] = pd.to_datetime(df['Fecha'], format='%d/%m/%Y')
    df.set_index('Fecha', inplace=True)
    df.sort_index(inplace=True)
    df['50Kg'] = clean_numeric_column(df['50Kg'], decimal_separator=',')
    df = df[['50Kg']].rename(columns={'50Kg': 'Internal_Market_Price'})
    return df

def calculate_estimated_commissions(price, prd):
    if pd.isna(price) or pd.isna(prd) or prd == 0: return np.nan, np.nan
    desviacion = (price - prd) / prd
    k_adj = float(settings.K_FACTOR)
    ajuste_v = -desviacion if desviacion < 0 else 0
    ratio_v = max(float(settings.MIN_COMISION), min(float(settings.MAX_COMISION), float(settings.COMISION_VENDEDOR) + (ajuste_v * k_adj)))
    ajuste_prd_c = desviacion
    ratio_c = max(float(settings.MIN_COMISION), min(float(settings.MAX_COMISION), float(settings.COMISION_COMPRADOR_BASE) + (ajuste_prd_c * k_adj)))
    return ratio_c, ratio_v

def generate_synthetic_intraday_data(df_daily, total_intraday_points=100):
    print(f"Generando datos intradía sintéticos...")
    df_daily = df_daily.dropna(subset=['C11_Open', 'C11_High', 'C11_Low', 'C11_Close']) # Usar nombres C11 originales aquí
    if df_daily.empty: return pd.DataFrame()
    
    all_intraday_data = []
    for date, row in df_daily.iterrows():
        open_price, high_price, low_price, close_price = row['C11_Open'], row['C11_High'], row['C11_Low'], row['C11_Close']
        if high_price < low_price: high_price, low_price = low_price, high_price
        
        intraday_prices = np.random.uniform(low_price, high_price, total_intraday_points)
        intraday_prices[0] = open_price
        intraday_prices[-1] = close_price
        
        intraday_minutes = np.linspace(0, 1439, total_intraday_points).astype(int)
        
        for i, price in enumerate(intraday_prices):
            timestamp = date + timedelta(minutes=int(intraday_minutes[i]))
            
            intraday_point = {
                'DateTime': timestamp,
                'Price': price,
                # Añadir las columnas diarias con nombres consistentes para TA
                'Open_Daily': row['C11_Open'],
                'High_Daily': row['C11_High'],
                'Low_Daily': row['C11_Low'],
                'Close_Daily': row['C11_Close'],
                'Volume_Daily': row['C11_Volume'], # Asumo que queremos el volumen diario
                'PRD': row['PRD'],
                'Internal_Market_Price': row['Internal_Market_Price'],
                # Añadir otras columnas C5 si son necesarias para el modelo final (no para TA)
                'C5_Open': row['C5_Open'], 'C5_High': row['C5_High'], 'C5_Low': row['C5_Low'], 'C5_Close': row['C5_Close'], 'C5_Volume': row['C5_Volume']
            }
            all_intraday_data.append(intraday_point)
            
    df_intraday = pd.DataFrame(all_intraday_data).set_index('DateTime')
    return df_intraday


def calculate_ta_features(df):
    """
    Calcula un conjunto de features de análisis técnico sobre los datos intradía.
    Se asegura de que los cálculos se hagan por separado para cada día.
    """
    print("Calculando features de análisis técnico (TA)...")
    
    if 'Price' not in df.columns: raise ValueError("DataFrame no contiene la columna 'Price' necesaria para TA.")
    if not all(col in df.columns for col in ['Open_Daily', 'High_Daily', 'Low_Daily', 'Close_Daily']):
        raise ValueError("DataFrame no contiene las columnas OHLC necesarias para ciertos cálculos de TA como ATR.")
    
    df['Date'] = df.index.date
    
    df_ta = df.copy()
    
    def apply_ta_per_day(group):
        if len(group) < 30: # Asegurarse de que hay suficientes datos para MACD, SMA_30 etc.
            return group

        # Volatilidad
        group['volatility_bbh'] = ta.volatility.bollinger_hband(group['Price'])
        group['volatility_bbl'] = ta.volatility.bollinger_lband(group['Price'])
        group['volatility_bbm'] = ta.volatility.bollinger_mavg(group['Price'])
        group['volatility_bbw'] = ta.volatility.bollinger_wband(group['Price'])
        # Usamos las columnas _Daily para ATR ya que son las OHLC del día
        group['volatility_atr'] = ta.volatility.average_true_range(group['High_Daily'], group['Low_Daily'], group['Close_Daily']) 
        
        # Momentum
        group['momentum_rsi'] = ta.momentum.rsi(group['Price'])
        group['momentum_macd'] = ta.trend.macd(group['Price'])
        group['momentum_macd_signal'] = ta.trend.macd_signal(group['Price'])
        
        # Tendencia
        group['trend_sma_fast'] = ta.trend.sma_indicator(group['Price'], window=10)
        group['trend_sma_slow'] = ta.trend.sma_indicator(group['Price'], window=30)
        group['trend_ema_fast'] = ta.trend.ema_indicator(group['Price'], window=10)
        group['trend_ema_slow'] = ta.trend.ema_indicator(group['Price'], window=30)
        
        return group
    
    df_ta = df_ta.groupby('Date', group_keys=False).apply(apply_ta_per_day)
    
    df_ta.drop(columns=['Date'], inplace=True)
    
    df_ta.ffill(inplace=True)
    df_ta.bfill(inplace=True)
    
    print("Cálculo de features de análisis técnico completado.")
    return df_ta


def main():
    print("--- Iniciando Generación de Dataset v4 (con TA Features) ---")

    print("[Paso 1/6] Cargando datos base...")
    df11 = load_and_clean_futures_data(os.path.join(DATA_DIR, 'Futuros azúcar Nº11 EE.UU.csv'), 'C11')
    df5 = load_and_clean_futures_data(os.path.join(DATA_DIR, 'Futuros azúcar Nº5 Londres.csv'), 'C5')
    df_internal = load_and_clean_internal_market_data(os.path.join(DATA_DIR, 'Precio Mercado Interno - Hoja 1.csv'))

    print("[Paso 2/6] Cargando y combinando historial de PRD...")
    df_prd = pd.read_csv(os.path.join(DATA_DIR, 'historial_prd.csv'), parse_dates=['Fecha'])
    df_prd.drop_duplicates(subset=['Fecha'], keep='last', inplace=True)
    df_prd.set_index('Fecha', inplace=True)

    df_master_daily = pd.merge(df11, df5, left_index=True, right_index=True, how='outer')
    df_master_daily = pd.merge(df_master_daily, df_internal, left_index=True, right_index=True, how='outer')
    df_master_daily = pd.merge(df_master_daily, df_prd, left_index=True, right_index=True, how='outer')
    
    df_master_daily = df_master_daily[~df_master_daily.index.duplicated(keep='first')]
    
    df_master_daily.sort_index(inplace=True)
    df_master_daily.ffill(inplace=True)
    df_master_daily.bfill(inplace=True)
    print("Datos diarios combinados y sin duplicados.")

    print("[Paso 3/6] Generando datos sintéticos intradía...")
    # Pasamos df_master_daily directamente, los renombres OHLC se hacen dentro de generate_synthetic_intraday_data
    df_intraday_synthetic = generate_synthetic_intraday_data(df_master_daily)
    
    print("[Paso 4/6] Calculando features de PRD y Comisiones...")
    df_intraday_synthetic['desviacion_vs_prd'] = (df_intraday_synthetic['Price'] - df_intraday_synthetic['PRD']) / df_intraday_synthetic['PRD']
    commissions = df_intraday_synthetic.apply(lambda row: calculate_estimated_commissions(row['Price'], row['PRD']), axis=1, result_type='expand')
    df_intraday_synthetic[['comision_comprador_estimada', 'comision_vendedor_estimada']] = commissions
    
    # --- 5. Calcular Features de Análisis Técnico (TA) ---
    print("[Paso 5/6] Calculando features de análisis técnico (TA)...")
    df_intraday_synthetic_with_ta = calculate_ta_features(df_intraday_synthetic)
    
    # Eliminar NaNs al final de la generación de features
    df_intraday_synthetic_with_ta.dropna(inplace=True)

    # --- 6. Guardar Datos Procesados ---
    print("[Paso 6/6] Guardando datos procesados...")
    output_filepath = os.path.join(DATA_DIR, 'processed_intraday_data_v4.parquet')
    df_intraday_synthetic_with_ta.to_parquet(output_filepath)
    print(f"Datos intradía V4 (con TA Features) guardados en: {output_filepath}")

if __name__ == '__main__':
    main()
