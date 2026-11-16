import pandas as pd
import numpy as np
import os
import warnings
import pmdarima as pm

# --- 0. Configuración ---
warnings.filterwarnings('ignore', 'statsmodels.tsa.arima.model.ARIMA', UserWarning)

# --- 1. Definición de Rutas ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'DATOS')
PRONOSTICO_DIR = os.path.join(BASE_DIR, 'pronosticos')
os.makedirs(PRONOSTICO_DIR, exist_ok=True)

INPUT_FILE = os.path.join(DATA_DIR, 'Balance Azucarero - Hoja 1.csv')
OUTPUT_FILE = os.path.join(PRONOSTICO_DIR, 'pronostico_consumo_mensual.csv')

# --- 2. Carga y Preparación de Datos ---
def cargar_datos_consumo():
    """
    Carga y limpia la serie temporal de consumo de azúcar.
    """
    print(f"--- Cargando datos de consumo desde: {INPUT_FILE} ---")
    try:
        df = pd.read_csv(INPUT_FILE, skiprows=3, header=None, encoding='utf-8-sig')
        df.columns = [
            'Fecha', 'stock_inicial', 'produccion_tucuman', 'produccion_salta_jujuy',
            'consumo_azucar', 'consumo_alcohol', 'exportacion', 'stock_final'
        ]
        print("\n--- DEBUG: DF después de carga inicial y asignación de columnas ---")
        print(df[['Fecha', 'consumo_azucar']].head())
        print(f"Shape: {df.shape}, NaNs en consumo_azucar: {df['consumo_azucar'].isnull().sum()}")
        
        # Limpiar y convertir datos
        df['Fecha'] = pd.to_datetime(df['Fecha'], format='%d-%m-%y')
        df.set_index('Fecha', inplace=True)
        
        # Usaremos 'consumo_azucar' como la serie a pronosticar
        df['consumo_azucar'] = pd.to_numeric(df['consumo_azucar'].str.strip(), errors='coerce') # Añadido .str.strip() por si acaso
        print("\n--- DEBUG: DF después de set_index y to_numeric ---")
        print(df['consumo_azucar'].head())
        print(f"Shape: {df.shape}, NaNs en consumo_azucar: {df['consumo_azucar'].isnull().sum()}")
        
        # Asegurarse de que la serie tenga frecuencia mensual para SARIMA
        # Rellenar meses faltantes si los hubiera y luego interpolar
        df = df.asfreq('MS') # 'MS' para inicio de mes
        print("\n--- DEBUG: DF después de asfreq('MS') ---")
        print(df['consumo_azucar'].head())
        print(f"Shape: {df.shape}, NaNs en consumo_azucar: {df['consumo_azucar'].isnull().sum()}")

        df['consumo_azucar'] = df['consumo_azucar'].interpolate(method='time')
        print("\n--- DEBUG: DF después de interpolate ---")
        print(df['consumo_azucar'].head())
        print(f"Shape: {df.shape}, NaNs en consumo_azucar: {df['consumo_azucar'].isnull().sum()}")
        
        # Eliminar cualquier fila con NaN restante
        df.dropna(subset=['consumo_azucar'], inplace=True)

        if df.empty:
            print("--- ERROR: No se encontraron datos de consumo válidos después de la limpieza. ---")
            print("--- Por favor, revisa el formato de la columna 'consumo_azucar' en el archivo de entrada. ---")
            return None
        
        print(f"Datos cargados. Rango de fechas: {df.index.min().strftime('%Y-%m')} a {df.index.max().strftime('%Y-%m')}")
        return df['consumo_azucar']
        
    except FileNotFoundError:
        print(f"--- ERROR: No se encontró el archivo de entrada: {INPUT_FILE} ---")
        return None
    except Exception as e:
        print(f"--- ERROR al procesar los datos: {e} ---")
        return None

# --- 3. Entrenamiento y Pronóstico con Auto-SARIMA ---
def entrenar_y_pronosticar(serie_consumo):
    """
    Entrena un modelo auto-SARIMA y genera pronósticos.
    """
    if serie_consumo is None or serie_consumo.empty:
        print("No hay datos para entrenar el modelo.")
        return None

    print("\n--- Entrenando modelo Auto-SARIMA... (puede tardar unos minutos) ---")
    
    # auto_arima encontrará los mejores parámetros (p,d,q)(P,D,Q,m)
    # m=12 indica estacionalidad anual (12 meses)
    sarima_model = pm.auto_arima(serie_consumo,
                                 start_p=1, start_q=1,
                                 test='adf',       # Usar test ADF para encontrar 'd'
                                 max_p=3, max_q=3,
                                 m=12,             # Estacionalidad anual
                                 d=None,           # Dejar que el test ADF lo determine
                                 seasonal=True,    # Activar búsqueda de parámetros estacionales
                                 start_P=0,
                                 D=1,              # Forzar D=1 es común en series con estacionalidad
                                 trace=True,
                                 error_action='ignore',  
                                 suppress_warnings=True, 
                                 stepwise=True)

    print("\n--- Modelo SARIMA Óptimo Encontrado ---")
    print(sarima_model.summary())

    # Generar pronóstico para los próximos 12 meses
    n_periods = 12
    pronostico, conf_int = sarima_model.predict(n_periods=n_periods, return_conf_int=True)
    
    # Crear un DataFrame con los resultados
    last_date = serie_consumo.index[-1]
    pronostico_index = pd.date_range(start=last_date + pd.DateOffset(months=1), periods=n_periods, freq='MS')
    
    df_pronostico = pd.DataFrame({
        'fecha': pronostico_index,
        'consumo_pronosticado': pronostico
    })
    
    return df_pronostico

# --- 4. Punto de Entrada del Script ---
if __name__ == "__main__":
    # 1. Cargar datos
    serie_consumo_historico = cargar_datos_consumo()
    
    # 2. Entrenar y pronosticar
    if serie_consumo_historico is not None:
        df_pronostico_final = entrenar_y_pronosticar(serie_consumo_historico)
        
        # 3. Guardar resultados
        if df_pronostico_final is not None:
            df_pronostico_final.to_csv(OUTPUT_FILE, index=False)
            print(f"\n--- Pronóstico de consumo guardado con éxito en: {OUTPUT_FILE} ---")
            print(df_pronostico_final)
