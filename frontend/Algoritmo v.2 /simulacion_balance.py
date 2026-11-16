import pandas as pd
import numpy as np
import os

# --- 1. Definición de Rutas ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, 'simulaciones')
os.makedirs(OUTPUT_DIR, exist_ok=True)
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'simulacion_balance_anual_final.csv') # Nombre de archivo final (mensual)
OUTPUT_FILE_DAILY = os.path.join(OUTPUT_DIR, 'simulacion_balance_diario_final.csv') # Nuevo nombre de archivo final (diario)

# --- 2. Función para Cargar Supuestos Anuales Dinámicamente ---
def get_supuestos_anuales():
    """
    Lee el archivo de Balance Azucarero y extrae los supuestos anuales
    para el año más reciente disponible en el archivo.
    """
    print("--- Cargando Supuestos Anuales desde el archivo 'Balance Azucarero'... ---")
    try:
        balance_file_path = os.path.join(os.path.dirname(__file__), 'DATOS', 'Balance Azucarero - Hoja 1.csv')
        df_balance = pd.read_csv(balance_file_path, skiprows=3, header=None, encoding='utf-8-sig')

        df_balance.columns = [
            'Fecha', 'stock_inicial', 'produccion_tucuman', 'produccion_salta_jujuy',
            'consumo_azucar', 'consumo_alcohol', 'exportacion', 'stock_final'
        ]
        
        df_balance['Fecha'] = pd.to_datetime(df_balance['Fecha'], format='%d-%m-%y')
        
        numeric_cols = [
            'stock_inicial', 'produccion_tucuman', 'produccion_salta_jujuy',
            'consumo_azucar', 'consumo_alcohol', 'exportacion', 'stock_final'
        ]
        for col in numeric_cols:
            df_balance[col] = pd.to_numeric(df_balance[col], errors='coerce')

        df_balance['produccion_anual_estimada'] = df_balance['produccion_tucuman'] + df_balance['produccion_salta_jujuy']
        df_balance['consumo_anual_estimado'] = df_balance['consumo_azucar'] + df_balance['consumo_alcohol']
        
        # Seleccionar el año más reciente del archivo
        latest_year_data = df_balance.sort_values('Fecha', ascending=False).iloc[0]
        
        supuestos = {
            "produccion_anual": latest_year_data['produccion_anual_estimada'],
            "consumo_anual": latest_year_data['consumo_anual_estimado'],
            "stock_inicial": latest_year_data['stock_inicial'],
            "fecha_supuestos": latest_year_data['Fecha'] # Añadir la fecha de los supuestos
        }
        
        print(f"Supuestos cargados para el año {latest_year_data['Fecha'].year}:")
        return supuestos

    except Exception as e:
        print(f"--- ERROR al cargar los supuestos anuales: {e} ---")
        print("Usando valores de respaldo.")
        return {
            "produccion_anual": 2_610_000,
            "consumo_anual": 1_950_000,
            "stock_inicial": 400_000
        }

def ejecutar_simulacion_anual():
    """
    Ejecuta la simulación completa del balance anual y guarda los resultados.
    """
    # --- 3. Definición de Supuestos para la Simulación ---
    supuestos = get_supuestos_anuales()

    produccion_anual_estimada = supuestos['produccion_anual']
    consumo_anual_estimado = supuestos['consumo_anual']
    stock_inicial_anual = supuestos['stock_inicial']

    # Calculamos el consumo mensual promedio
    consumo_mensual_estimado = consumo_anual_estimado / 12

    # Patrón de Distribución de la Zafra (Abril a Octubre)
    patron_zafra = {
        1: 0.00, 2: 0.00, 3: 0.00,
        4: 0.05, 5: 0.10, 6: 0.20,
        7: 0.25, 8: 0.25, 9: 0.10,
        10: 0.05, 11: 0.00, 12: 0.00
    }

    # Stock Estratégico Objetivo (2.5 meses de consumo promedio)
    stock_estrategico_objetivo = consumo_mensual_estimado * 2.5

    print(f"Producción Anual Estimada: {produccion_anual_estimada:,.0f} TN")
    print(f"Consumo Anual Estimado: {consumo_anual_estimado:,.0f} TN")
    print(f"Consumo Mensual Promedio: {consumo_mensual_estimado:,.0f} TN")
    print(f"Stock Inicial (Enero): {stock_inicial_anual:,.0f} TN")
    print(f"Stock Estratégico Objetivo: {stock_estrategico_objetivo:,.0f} TN")

    # --- 3. Ejecución de la Simulación Mensual ---
    print("\n--- Ejecutando Simulación Mensual ---")

    # Inicializar lista para almacenar los resultados de cada mes
    resultados_simulacion = []

    # Stock inicial para el primer mes de la simulación
    stock_inicial_mes = stock_inicial_anual

    # Iterar por cada mes del año
    for mes_num in range(1, 13):
        # Calcular producción del mes
        produccion_mes = produccion_anual_estimada * patron_zafra[mes_num]
        
        # Consumo del mes
        consumo_mes = consumo_mensual_estimado
        
        # Stock proyectado antes de cualquier exportación
        stock_proyectado_sin_exportar = stock_inicial_mes + produccion_mes - consumo_mes
        
        # Calcular exportación sugerida
        exportacion_sugerida = max(0, stock_proyectado_sin_exportar - stock_estrategico_objetivo)
        
        # Calcular stock final del mes
        stock_final_mes = stock_proyectado_sin_exportar - exportacion_sugerida
        
        # Guardar resultados del mes
        resultados_simulacion.append({
            'Mes': mes_num,
            'Stock Inicial (TN)': stock_inicial_mes,
            'Producción (TN)': produccion_mes,
            'Consumo (TN)': consumo_mes,
            'Stock Proyectado (sin exportar) (TN)': stock_proyectado_sin_exportar,
            'Stock Estratégico Objetivo (TN)': stock_estrategico_objetivo,
            'Exportación Sugerida (TN)': exportacion_sugerida,
            'Stock Final (TN)': stock_final_mes
        })
        
        # El stock final de este mes es el stock inicial del próximo
        stock_inicial_mes = stock_final_mes

    # Convertir resultados a DataFrame
    df_simulacion = pd.DataFrame(resultados_simulacion)

    # --- 4. Mostrar y Guardar Resultados Mensuales ---
    print("\n--- Resultados de la Simulación Mensual de Balance Azucarero ---")
    print(df_simulacion)

    df_simulacion.to_csv(OUTPUT_FILE, index=False)
    print(f"\nResultados de la simulación mensual guardados en: {OUTPUT_FILE}")

    # --- 5. Generar Plan Estratégico Diario ---
    print("\n--- Generando Plan Estratégico Diario ---")
    daily_goals_list = []
    
    # Obtener el año de la simulación
    simulation_year = supuestos['fecha_supuestos'].year

    # Iterar por cada mes en el DataFrame de simulación mensual
    for index, row in df_simulacion.iterrows():
        mes_num = int(row['Mes'])
        
        # Calcular el número de días en el mes
        first_day_of_month = pd.Timestamp(simulation_year, mes_num, 1)
        dias_en_mes = first_day_of_month.days_in_month

        # Calcular objetivos diarios
        consumo_diario_objetivo = row['Consumo (TN)'] / dias_en_mes
        produccion_diaria_objetivo = row['Producción (TN)'] / dias_en_mes
        
        # Para el stock, interpolamos linealmente desde el stock inicial del mes
        # hasta el stock final del mes (que es el stock inicial del siguiente mes)
        stock_inicial_mes = row['Stock Inicial (TN)']
        stock_final_mes_objetivo = row['Stock Final (TN)'] # Este es el objetivo al final del mes

        # Generar fechas para el mes
        fechas_del_mes = pd.date_range(start=first_day_of_month, periods=dias_en_mes, freq='D')

        for i, fecha_diaria in enumerate(fechas_del_mes):
            # Interpolación lineal para el stock diario objetivo
            # El stock objetivo diario se calcula como una interpolación entre el stock inicial del mes
            # y el stock final objetivo del mes.
            stock_diario_objetivo = stock_inicial_mes + \
                                    (stock_final_mes_objetivo - stock_inicial_mes) * \
                                    ((i + 1) / dias_en_mes)
            
            daily_goals_list.append({
                'Fecha': fecha_diaria,
                'Consumo Diario Objetivo (TN)': consumo_diario_objetivo,
                'Produccion Diaria Objetivo (TN)': produccion_diaria_objetivo,
                'Stock Diario Objetivo (TN)': stock_diario_objetivo,
                'Stock Estratégico Mensual (TN)': row['Stock Estratégico Objetivo (TN)'] # Mantener el mensual como referencia
            })
    
    df_daily_goals = pd.DataFrame(daily_goals_list)
    df_daily_goals.set_index('Fecha', inplace=True)
    
    df_daily_goals.to_csv(OUTPUT_FILE_DAILY)
    print(f"Resultados de la simulación diaria guardados en: {OUTPUT_FILE_DAILY}")

    print("\n¡Simulación completada!")

if __name__ == "__main__":
    ejecutar_simulacion_anual()
