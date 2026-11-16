import pandas as pd
import numpy as np
import os
from datetime import date, timedelta

# --- 1. Definición de Rutas y Parámetros ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'DATOS')
SIMULACION_DIR = os.path.join(BASE_DIR, 'simulaciones')
os.makedirs(SIMULACION_DIR, exist_ok=True)

BALANCE_FILE = os.path.join(DATA_DIR, 'Balance Azucarero - Hoja 1.csv')
PRECIO_INTERNO_FILE = os.path.join(DATA_DIR, 'Precio Mercado Interno - Hoja 1.csv')
OUTPUT_FILE = os.path.join(SIMULACION_DIR, 'historial_operaciones_diarias.csv')

# Parámetros de simulación
VARIACION_CONSUMO = 0.15  # +/- 15% de variación diaria
VARIACION_PRODUCCION = 0.10 # +/- 10% de variación diaria

# Patrón de Distribución de la Zafra (copiado de simulacion_balance.py)
patron_zafra = {
    1: 0.00, 2: 0.00, 3: 0.00,
    4: 0.05, 5: 0.10, 6: 0.20,
    7: 0.25, 8: 0.25, 9: 0.10,
    10: 0.05, 11: 0.00, 12: 0.00
}

# --- 2. Funciones de Carga de Datos ---

def cargar_supuestos_anuales(year):
    """Carga los supuestos anuales para un año específico."""
    try:
        df = pd.read_csv(BALANCE_FILE, skiprows=3, header=None, encoding='utf-8-sig')
        df.columns = ['Fecha', 'stock_inicial', 'produccion_tucuman', 'produccion_salta_jujuy', 'consumo_azucar', 'consumo_alcohol', 'exportacion', 'stock_final']
        df['Fecha'] = pd.to_datetime(df['Fecha'], format='%d-%m-%y')
        
        # Buscar la fila correspondiente al año. Asumimos que la fecha es de fin de año.
        fila_año = df[df['Fecha'].dt.year == year].iloc[0]
        
        produccion_anual = pd.to_numeric(fila_año['produccion_tucuman'], errors='coerce') + pd.to_numeric(fila_año['produccion_salta_jujuy'], errors='coerce')
        consumo_anual = pd.to_numeric(fila_año['consumo_azucar'], errors='coerce') + pd.to_numeric(fila_año['consumo_alcohol'], errors='coerce')
        
        if pd.isna(produccion_anual) or pd.isna(consumo_anual):
            raise ValueError(f"No se pudieron leer los datos numéricos para el año {year}")
            
        return {"produccion_anual": produccion_anual, "consumo_anual": consumo_anual}
    except (FileNotFoundError, IndexError, ValueError) as e:
        print(f"ADVERTENCIA: No se pudieron cargar los supuestos para el año {year} desde {BALANCE_FILE}. Error: {e}")
        return None

def cargar_precios_historicos():
    """Carga y prepara el historial de precios diarios."""
    try:
        df = pd.read_csv(PRECIO_INTERNO_FILE, skiprows=3, decimal=',')
        df.columns = ['Fecha', 'Precio_50Kg']
        df['Fecha'] = pd.to_datetime(df['Fecha'], dayfirst=True)
        df.drop_duplicates(subset='Fecha', keep='last', inplace=True)
        df.set_index('Fecha', inplace=True)
        df['precio_tn'] = pd.to_numeric(df['Precio_50Kg'], errors='coerce') * 20
        
        # Rellenar fines de semana o días sin datos con el último precio válido
        df = df.asfreq('D').ffill()
        return df['precio_tn']
    except Exception as e:
        print(f"ERROR: No se pudieron cargar los precios históricos desde {PRECIO_INTERNO_FILE}. Error: {e}")
        return None

# --- 3. Lógica de Generación de Datos Diarios ---

def generar_datos_anuales(year, supuestos, precios_historicos):
    """Genera un DataFrame con los datos diarios simulados para un año."""
    print(f"\n--- Generando historial de operaciones para el año {year} ---")
    
    # Calcular objetivos mensuales
    consumo_mensual_promedio = supuestos['consumo_anual'] / 12
    objetivos_mensuales = {
        mes: {
            "produccion": supuestos['produccion_anual'] * patron_zafra[mes],
            "consumo": consumo_mensual_promedio
        } for mes in range(1, 13)
    }
    
    # Generar datos para cada día del año
    historial_anual = []
    start_date = date(year, 1, 1)
    end_date = date(year, 12, 31)
    
    for i in range((end_date - start_date).days + 1):
        current_date = start_date + timedelta(days=i)
        mes = current_date.month
        dias_en_mes = pd.Timestamp(current_date).days_in_month
        
        # Calcular el objetivo diario base
        produccion_diaria_base = objetivos_mensuales[mes]['produccion'] / dias_en_mes
        consumo_diario_base = objetivos_mensuales[mes]['consumo'] / dias_en_mes
        
        # Aplicar variación aleatoria y redondear a 3 decimales
        produccion_real_diaria = round(max(0, produccion_diaria_base * (1 + np.random.uniform(-VARIACION_PRODUCCION, VARIACION_PRODUCCION))), 3)
        consumo_real_diario = round(max(0, consumo_diario_base * (1 + np.random.uniform(-VARIACION_CONSUMO, VARIACION_CONSUMO))), 3)
        
        # Obtener precio histórico
        try:
            precio_dia = precios_historicos.loc[current_date.strftime('%Y-%m-%d')]
        except KeyError:
            precio_dia = np.nan # Marcar si no hay precio para ese día
            
        historial_anual.append({
            'fecha': current_date,
            'produccion_real_diaria': produccion_real_diaria,
            'consumo_real_diario': consumo_real_diario,
            'precio_mercado_interno_tn': precio_dia
        })
        
    df_anual = pd.DataFrame(historial_anual)
    print(f"Generación para {year} completada. {len(df_anual)} días procesados.")
    return df_anual

# --- 4. Punto de Entrada del Script ---
if __name__ == "__main__":
    print("--- Iniciando Generador de Historial de Operaciones Diarias ---")
    
    # Cargar precios una sola vez
    precios_historicos = cargar_precios_historicos()
    
    if precios_historicos is not None:
        historial_total = []
        
        # Procesar 2024
        supuestos_2024 = cargar_supuestos_anuales(2024)
        if supuestos_2024:
            df_2024 = generar_datos_anuales(2024, supuestos_2024, precios_historicos)
            historial_total.append(df_2024)
            
        # Procesar 2025
        supuestos_2025 = cargar_supuestos_anuales(2025)
        if supuestos_2025:
            df_2025 = generar_datos_anuales(2025, supuestos_2025, precios_historicos)
            historial_total.append(df_2025)
            
        # Unir y guardar
        if historial_total:
            df_final = pd.concat(historial_total, ignore_index=True)
            df_final.dropna(subset=['precio_mercado_interno_tn'], inplace=True) # Eliminar días sin precio
            
            # Forzar la reescritura de los nombres de las columnas para asegurar que estén limpios
            df_final.columns = ['fecha', 'produccion_real_diaria', 'consumo_real_diaria', 'precio_mercado_interno_tn']
            
            df_final.to_csv(OUTPUT_FILE, index=False)
            
            print("\n" + "="*60)
            print(f"¡Historial de operaciones diarias generado con éxito!")
            print(f"Archivo guardado en: {OUTPUT_FILE}")
            print(f"Total de días con datos: {len(df_final)}")
            print("Resumen de los datos generados:")
            print(df_final.head())
            print("...")
            print(df_final.tail())
            print("="*60)
        else:
            print("\nNo se pudo generar ningún historial. Revisa los errores anteriores.")
    else:
        print("\nNo se pudo continuar debido a un error al cargar los precios históricos.")
