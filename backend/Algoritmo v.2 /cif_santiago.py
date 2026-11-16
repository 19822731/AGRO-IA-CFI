import pandas as pd
import os

# --- 1. Definición de Rutas ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'Datos')
DATASET_MAESTRO_FILE = os.path.join(DATA_DIR, 'dataset_maestro_COMPLETO.csv')
# Corregido: Apuntar al archivo CSV correcto
COSTOS_CIF_SANTIAGO_FILE = os.path.join(DATA_DIR, 'COSTOS VARIOS CIF SANTIAGO.xlsx - Hoja 1.csv')
USD_CLP_FILE = os.path.join(DATA_DIR, 'USD_CLP.csv')

# --- 2. Funciones de la Calculadora ---

def get_ultimo_precio_contrato_5():
    """
    Lee el dataset maestro y devuelve el último precio registrado para el Contrato #5.
    """
    try:
        df_maestro = pd.read_csv(DATASET_MAESTRO_FILE, index_col=0, parse_dates=True)
        if 'sugar_5' not in df_maestro.columns:
            raise ValueError("La columna 'sugar_5' no se encuentra en el dataset maestro.")
        
        ultimo_precio = df_maestro['sugar_5'].dropna().iloc[-1]
        return ultimo_precio
    except Exception as e:
        print(f"--- ERROR al leer el precio del Contrato #5: {e} ---")
        return None

def get_costo_cif_santiago():
    """
    Lee el archivo de costos CIF Santiago (CSV) desde la fila 60, columna 10 (J).
    """
    try:
        # Leer el CSV sin cabecera para acceder por índice numérico
        df = pd.read_csv(COSTOS_CIF_SANTIAGO_FILE, header=None)
        
        # Acceder al valor en la fila 60 (índice 59) y columna 10 (índice 9)
        costo_val_str = str(df.iloc[59, 9])
        
        # Limpiar el string: remover 'USD ' y reemplazar ',' por '.'
        costo_val_cleaned = costo_val_str.replace('USD ', '').replace(',', '.')
        
        return float(costo_val_cleaned)
        
    except Exception as e:
        print(f"--- ERROR al leer el archivo de costos CIF Santiago: {e} ---")
        return None

def get_ultimo_tipo_cambio_usd_clp():
    """
    Lee el archivo de tipo de cambio USD/CLP y devuelve el último valor.
    """
    try:
        df_clp = pd.read_csv(USD_CLP_FILE)
        if 'Último' not in df_clp.columns:
            raise ValueError("La columna 'Último' no se encuentra en el archivo USD_CLP.csv.")
        
        # Limpiar y convertir el valor
        ultimo_tc_str = df_clp['Último'].dropna().iloc[-1]
        ultimo_tc = float(str(ultimo_tc_str).replace(',', '.'))
        return ultimo_tc
    except Exception as e:
        print(f"--- ERROR al leer el tipo de cambio USD/CLP: {e} ---")
        return None

# --- 3. Lógica Principal ---

def calcular_precio_cif_santiago():
    """
    Calcula el Precio CIF Santiago en CLP por tonelada.
    """
    print("--- Calculando Precio CIF Santiago ---")
    
    # Constante de ajuste para el Contrato #5
    AJUSTE_CONTRATO_5 = 40.0
    
    # Obtener los componentes en USD/TN
    precio_contrato_5 = get_ultimo_precio_contrato_5()
    costo_cif = get_costo_cif_santiago()
    
    if precio_contrato_5 is None or costo_cif is None:
        print("No se pudo calcular el precio neto en USD/TN.")
        return None
        
    # --- Nueva Lógica de Cálculo ---
    # 1. Ajustar el precio del contrato
    precio_contrato_ajustado = precio_contrato_5 - AJUSTE_CONTRATO_5
    # 2. Sumar el costo CIF
    precio_neto_usd_tn = precio_contrato_ajustado + costo_cif
    
    # Obtener el tipo de cambio
    tipo_cambio_usd_clp = get_ultimo_tipo_cambio_usd_clp()
    
    if tipo_cambio_usd_clp is None:
        print("No se pudo obtener el tipo de cambio USD/CLP.")
        return None
        
    # Realizar la conversión a CLP por tonelada
    precio_cif_clp_tn = precio_neto_usd_tn * tipo_cambio_usd_clp
    
    print(f"Último precio Contrato #5 (USD/TN): {precio_contrato_5:,.2f}")
    print(f"Ajuste Fijo (USD/TN): - {AJUSTE_CONTRATO_5:,.2f}")
    print(f"Precio Contrato Ajustado (USD/TN): {precio_contrato_ajustado:,.2f}")
    print(f"Costo CIF Santiago (USD/TN): + {costo_cif:,.2f}")
    print(f"Precio Neto (USD/TN): {precio_neto_usd_tn:,.2f}")
    print(f"Último Tipo de Cambio USD/CLP: {tipo_cambio_usd_clp:,.2f}")
    print("-" * 40)
    print(f"PRECIO CIF SANTIAGO (CLP/TN): ${precio_cif_clp_tn:,.2f}")
    print("-" * 40)
    
    return precio_cif_clp_tn

# --- Punto de Entrada del Script ---
if __name__ == "__main__":
    calcular_precio_cif_santiago()
