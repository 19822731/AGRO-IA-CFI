import pandas as pd
import os

# --- 1. Definición de Rutas ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'DATOS')
DATASET_MAESTRO_FILE = os.path.join(DATA_DIR, 'dataset_maestro_COMPLETO.csv')
COSTOS_COMEX_FILE = os.path.join(DATA_DIR, 'COSTOS VARIOS COMEX - CONSOLIDADO.csv')

# --- 2. Funciones de la Calculadora ---

def get_ultimo_precio_contrato_5():
    """
    Lee el dataset maestro y devuelve el último precio registrado para el Contrato #5.
    """
    try:
        df_maestro = pd.read_csv(DATASET_MAESTRO_FILE, index_col=0, parse_dates=True)
        # Asegurarse de que la columna 'sugar_5' existe
        if 'sugar_5' not in df_maestro.columns:
            raise ValueError("La columna 'sugar_5' no se encuentra en el dataset maestro.")
        
        # Obtener el último valor no nulo
        ultimo_precio = df_maestro['sugar_5'].dropna().iloc[-1]
        return ultimo_precio
    except Exception as e:
        print(f"--- ERROR al leer el precio del Contrato #5: {e} ---")
        return None

def get_costo_comex():
    """
    Lee el archivo de costos de COMEX usando pandas para buscar de forma robusta
    el valor total consolidado por tonelada.
    """
    try:
        # Leer el CSV sin cabecera para poder acceder por índice
        df = pd.read_csv(COSTOS_COMEX_FILE, header=None, encoding='utf-8-sig')
        
        # Buscar la fila donde la segunda columna (índice 1) es 'COSTOS VARIOS COMEX'
        # Se usa .str.strip() por si hay espacios extra
        target_row = df[df[1].str.strip() == 'COSTOS VARIOS COMEX']
        
        if target_row.empty:
            raise ValueError("No se encontró la fila 'COSTOS VARIOS COMEX' en el archivo.")
            
        # El valor está en la última columna (índice -1) de esa fila
        costo_str = target_row.iloc[0, -1]
        
        # Limpiar el string y convertir a float
        costo_val = float(str(costo_str).strip().replace('"', '').replace('USD', '').strip().replace(',', '.'))
        
        return costo_val
        
    except Exception as e:
        print(f"--- ERROR al leer el archivo de costos COMEX: {e} ---")
        return None

# --- 3. Lógica Principal ---

def get_ultimo_tipo_cambio_usd_ars():
    """
    Lee el dataset maestro y devuelve el último tipo de cambio USD/ARS.
    """
    try:
        df_maestro = pd.read_csv(DATASET_MAESTRO_FILE, index_col=0, parse_dates=True)
        if 'fx_ars_usd' not in df_maestro.columns:
            raise ValueError("La columna 'fx_ars_usd' no se encuentra en el dataset maestro.")
        
        ultimo_tc = df_maestro['fx_ars_usd'].dropna().iloc[-1]
        return ultimo_tc
    except Exception as e:
        print(f"--- ERROR al leer el tipo de cambio USD/ARS: {e} ---")
        return None

# --- 3. Lógica Principal ---

def calcular_precio_paridad():
    """
    Calcula el Precio de Paridad de Exportación en ARS por bolsa de 50kg.
    """
    print("--- Calculando Precio de Paridad de Exportación ---")
    
    # Constante de ajuste para el Contrato #5
    AJUSTE_CONTRATO_5 = 40.0
    
    # Obtener los componentes en USD/TN
    precio_contrato_5 = get_ultimo_precio_contrato_5()
    costo_exportacion = get_costo_comex()
    
    if precio_contrato_5 is None or costo_exportacion is None:
        print("No se pudo calcular la paridad en USD/TN.")
        return None
        
    # --- Nueva Lógica de Cálculo ---
    # 1. Ajustar el precio del contrato
    precio_contrato_ajustado = precio_contrato_5 - AJUSTE_CONTRATO_5
    # 2. Restar el costo de exportación
    precio_paridad_usd_tn = precio_contrato_ajustado - costo_exportacion
    
    # Obtener el tipo de cambio
    tipo_cambio_usd_ars = get_ultimo_tipo_cambio_usd_ars()
    
    if tipo_cambio_usd_ars is None:
        print("No se pudo obtener el tipo de cambio USD/ARS.")
        return None
        
    # Realizar la conversión a ARS por bolsa de 50kg
    precio_paridad_ars_50kg = (precio_paridad_usd_tn / 20) * tipo_cambio_usd_ars
    
    print(f"Último precio Contrato #5 (USD/TN): {precio_contrato_5:,.2f}")
    print(f"Ajuste Fijo (USD/TN): - {AJUSTE_CONTRATO_5:,.2f}")
    print(f"Precio Contrato Ajustado (USD/TN): {precio_contrato_ajustado:,.2f}")
    print(f"Costos Varios COMEX (USD/TN): - {costo_exportacion:,.2f}")
    print(f"Precio de Paridad (USD/TN): {precio_paridad_usd_tn:,.2f}")
    print(f"Último Tipo de Cambio USD/ARS: {tipo_cambio_usd_ars:,.2f}")
    print("-" * 40)
    print(f"PRECIO DE PARIDAD DE EXPORTACIÓN (ARS/50kg): ${precio_paridad_ars_50kg:,.2f}")
    print("-" * 40)
    
    return precio_paridad_ars_50kg

# --- Punto de Entrada del Script ---
if __name__ == "__main__":
    calcular_precio_paridad()
