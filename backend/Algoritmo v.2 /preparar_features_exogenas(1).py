import pandas as pd
import os
from statsmodels.tsa.api import STL
import warnings

warnings.filterwarnings("ignore")

# --- 1. Definición de Rutas ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'Datos')

INPUT_FILE = os.path.join(DATA_DIR, 'Precio Mercado Interno - Hoja 1.csv')
OUTPUT_FILE = os.path.join(DATA_DIR, 'feature_estacionalidad_precio.csv')

# --- 2. Cargar y Preparar Datos ---
def cargar_y_preparar_precios(file_path):
    print(f"Cargando historial de precios desde: {file_path}")
    try:
        df = pd.read_csv(
            file_path,
            skiprows=2,
            decimal=',',
            parse_dates=['Fecha'],
            dayfirst=True # Indicar que el día viene primero en el formato de fecha
        )
        df.rename(columns={'50Kg': 'precio'}, inplace=True)
        
        # Manejar fechas duplicadas promediando los precios para cada día
        df = df.groupby('Fecha')['precio'].mean().reset_index()
        
        df.set_index('Fecha', inplace=True)
        
        # Asegurar frecuencia diaria y rellenar huecos
        df = df.asfreq('D')
        df['precio'].fillna(method='ffill', inplace=True)
        
        print(f"Datos de precios cargados. Total de puntos: {len(df)}")
        print(f"Rango de fechas: {df.index.min()} a {df.index.max()}")
        return df['precio']
    except FileNotFoundError:
        print(f"ERROR: Archivo no encontrado en {file_path}")
        return None
    except Exception as e:
        print(f"ERROR al cargar o preparar los datos de precios: {e}")
        return None

# --- 3. Descomposición de Series Temporales ---
def descomponer_y_extraer_estacionalidad(serie_precios):
    print("\n--- Realizando descomposición STL para extraer estacionalidad dinámica ---")
    # STL (Seasonal and Trend decomposition using Loess) permite que la estacionalidad cambie con el tiempo.
    # period=365 para capturar la estacionalidad anual.
    # seasonal=7 es un parámetro de suavizado para el componente estacional (debe ser impar).
    stl = STL(serie_precios, period=365, seasonal=7)
    res = stl.fit()
    
    # El componente estacional es lo que nos interesa
    componente_estacional = res.seasonal
    print("Componente estacional dinámico extraído con éxito.")
    return componente_estacional

# --- 4. Guardar Feature ---
def guardar_feature(feature_series, file_path):
    print(f"\nGuardando feature de estacionalidad en: {file_path}")
    try:
        feature_series.to_csv(file_path, header=['estacionalidad_precio'])
        print("Feature guardada con éxito.")
    except Exception as e:
        print(f"ERROR al guardar la feature: {e}")

# --- Punto de Entrada del Script ---
if __name__ == "__main__":
    serie_precios = cargar_y_preparar_precios(INPUT_FILE)
    
    if serie_precios is not None:
        componente_estacional = descomponer_y_extraer_estacionalidad(serie_precios)
        if componente_estacional is not None:
            guardar_feature(componente_estacional, OUTPUT_FILE)
            print("\n¡Proceso de preparación de feature exógena completado!")
    else:
        print("No se pudo preparar la feature debido a errores en la carga de datos.")
