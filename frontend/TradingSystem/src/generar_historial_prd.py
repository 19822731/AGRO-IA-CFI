
import pandas as pd
import numpy as np
import os
import sys
from datetime import date, timedelta

def generate_prd_history():
    """
    Genera un historial completo de valores PRD ejecutando el motor
    de PRD para cada día en el rango de datos históricos.
    """
    print("--- Iniciando Generación de Historial PRD ---")

    # --- Configuración de Rutas ---
    # Rutas dentro del proyecto TradingSystem
    CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
    PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
    DATA_DIR = os.path.join(PROJECT_ROOT, 'data')
    
    # Rutas al proyecto AGRO-IA original para acceder al motor de PRD
    AGRO_IA_ROOT = os.path.dirname(PROJECT_ROOT)
    ALGORITMO_V2_DIR = os.path.join(AGRO_IA_ROOT, 'Algoritmo v.2 ') # Cuidado con el espacio al final

    # --- Añadir el directorio del Algoritmo v.2 al path para poder importar ---
    if ALGORITMO_V2_DIR not in sys.path:
        sys.path.append(ALGORITMO_V2_DIR)

    try:
        # Importar dinámicamente la función necesaria
        from motor_prd_diario import calcular_prd_diario
        print("Módulo 'motor_prd_diario' importado con éxito.")
    except ImportError as e:
        print(f"Error Crítico: No se pudo importar 'motor_prd_diario.py'. Asegúrate de que la ruta es correcta.")
        print(f"Ruta intentada: {ALGORITMO_V2_DIR}")
        print(f"Error: {e}")
        return
    except Exception as e:
        print(f"Ocurrió un error inesperado al importar el módulo: {e}")
        return

    # --- Determinar el rango de fechas ---
    print("Determinando el rango de fechas a partir de los datos históricos...")
    try:
        df_dates = pd.read_csv(
            os.path.join(DATA_DIR, 'Futuros azúcar Nº11 EE.UU.csv'),
            usecols=['Fecha'],
            parse_dates=['Fecha'],
            dayfirst=True # El formato es DD.MM.YYYY, dayfirst ayuda a pandas a interpretarlo
        )
        start_date = df_dates['Fecha'].min().date()
        end_date = df_dates['Fecha'].max().date()
        print(f"Rango de fechas determinado: Desde {start_date} hasta {end_date}")
    except Exception as e:
        print(f"Error al leer el rango de fechas: {e}")
        return

    # --- Iterar y Calcular PRD para cada día ---
    print("Calculando el PRD para cada día en el rango. Esto puede tardar varios minutos...")
    
    all_prd_data = []
    current_date = start_date
    
    # El motor_prd_diario necesita que ciertos ficheros existan, especialmente
    # el plan estratégico. Asumimos que ya fue generado por AGRO-IA.
    while current_date <= end_date:
        try:
            # Llamar a la función importada
            # Pasamos los parámetros de K por defecto que están en la firma de la función
            resultado_prd = calcular_prd_diario(fecha_analisis=current_date)
            
            if resultado_prd and 'prd' in resultado_prd:
                all_prd_data.append({
                    'Fecha': current_date,
                    'PRD': resultado_prd['prd']
                })
                # Imprimir progreso cada 100 días
                if (current_date - start_date).days % 100 == 0:
                    print(f"  Procesando fecha: {current_date}, PRD calculado: {resultado_prd['prd']:.2f}")

        except Exception as e:
            # El motor puede fallar si no encuentra datos para un día específico
            print(f"  ADVERTENCIA: No se pudo calcular el PRD para {current_date}. Error: {e}")
            # Aun así, añadimos la fecha para mantener la continuidad del índice
            all_prd_data.append({
                'Fecha': current_date,
                'PRD': np.nan # Usamos NaN para indicar fallo
            })

        current_date += timedelta(days=1)
        
    # --- Guardar Historial ---
    if not all_prd_data:
        print("No se generaron datos de PRD. Abortando.")
        return

    print("Cálculo completado. Guardando historial de PRD...")
    df_prd_history = pd.DataFrame(all_prd_data)
    df_prd_history['Fecha'] = pd.to_datetime(df_prd_history['Fecha'])
    df_prd_history.set_index('Fecha', inplace=True)
    
    # Rellenar NaNs por si hubo fallos, usando el último valor válido
    df_prd_history['PRD'].ffill(inplace=True)
    df_prd_history['PRD'].bfill(inplace=True) # Rellenar al principio si es necesario

    output_path = os.path.join(DATA_DIR, 'historial_prd.csv')
    df_prd_history.to_csv(output_path)

    print(f"--- Historial de PRD guardado con éxito en: {output_path} ---")


if __name__ == '__main__':
    generate_prd_history()

