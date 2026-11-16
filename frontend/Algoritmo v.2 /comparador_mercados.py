import pandas as pd
import os

# Importamos la función que ya creamos en la calculadora de paridad
from calculadora_paridad import calcular_precio_paridad

# --- 1. Definición de Rutas ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'DATOS')
PRECIO_INTERNO_FILE = os.path.join(DATA_DIR, 'Precio Mercado Interno - Hoja 1.csv')

# Constante para el IVA
TASA_IVA = 1.21

# --- 2. Función para obtener el precio del mercado interno ---

def get_precio_mercado_interno():
    """
    Lee el archivo de precios del mercado interno y devuelve el último
    precio registrado para la bolsa de 50kg.
    """
    try:
        df_precios = pd.read_csv(
            PRECIO_INTERNO_FILE,
            skiprows=3,
            decimal=','
        )
        df_precios.columns = ['Fecha', 'Precio_50Kg']
        
        # Obtener el último precio válido y convertirlo a numérico
        ultimo_precio_con_iva = float(df_precios['Precio_50Kg'].dropna().iloc[-1])
        return ultimo_precio_con_iva
        
    except Exception as e:
        print(f"--- ERROR al leer el archivo de precios internos: {e} ---")
        return None

# --- 3. Lógica Principal del Comparador ---

def ejecutar_comparador():
    """
    Ejecuta la comparación entre el mercado interno y la paridad de exportación.
    """
    print("="*50)
    print("--- Comparador de Mercados: ¿Exportar o Vender Localmente? ---")
    print("="*50)
    
    # 1. Obtener el Precio de Paridad de Exportación (neto)
    print("\nCalculando Precio de Paridad de Exportación...")
    precio_paridad_exportacion = calcular_precio_paridad()
    
    if precio_paridad_exportacion is None:
        print("\nNo se pudo continuar debido a un error en el cálculo de la paridad.")
        return
        
    # 2. Obtener el Precio de Mercado Interno y ajustarlo
    print("\nObteniendo Precio de Mercado Interno...")
    precio_interno_con_iva = get_precio_mercado_interno()
    
    if precio_interno_con_iva is None:
        print("\nNo se pudo continuar debido a un error al leer el precio interno.")
        return
    
    # Quitar el IVA para tener el precio neto
    precio_interno_neto = precio_interno_con_iva / TASA_IVA
    
    print(f"Último Precio de Mercado Interno (con IVA): ${precio_interno_con_iva:,.2f}")
    print(f"Precio de Mercado Interno Neto (sin IVA): ${precio_interno_neto:,.2f}")
    
    # 3. Comparar y generar recomendación
    print("\n" + "="*50)
    print("--- ANÁLISIS Y RECOMENDACIÓN ---")
    print("="*50)
    
    print(f"Precio Neto por Venta Local: ${precio_interno_neto:,.2f} / 50kg")
    print(f"Precio Neto por Exportación: ${precio_paridad_exportacion:,.2f} / 50kg")
    
    diferencia = precio_paridad_exportacion - precio_interno_neto
    
    if diferencia > 0:
        print(f"\nRECOMENDACIÓN: Conviene EXPORTAR.")
        print(f"La exportación ofrece un diferencial positivo de ${diferencia:,.2f} por bolsa de 50kg.")
    else:
        print(f"\nRECOMENDACIÓN: Conviene VENDER EN MERCADO INTERNO.")
        print(f"La venta local ofrece un diferencial positivo de ${abs(diferencia):,.2f} por bolsa de 50kg.")
    print("="*50)

# --- Punto de Entrada del Script ---
if __name__ == "__main__":
    ejecutar_comparador()
