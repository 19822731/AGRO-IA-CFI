import pandas as pd
import numpy as np
import os
from datetime import datetime, date, timedelta
import math
import pickle
import copy # Añadido para copiar el modelo
from statsmodels.tsa.statespace.sarimax import SARIMAXResultsWrapper
from pmdarima import ARIMA # Para cargar el modelo SARIMA

# --- 1. Definición de Rutas y Parámetros ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'DATOS')
SIMULACION_DIR = os.path.join(BASE_DIR, 'simulaciones')
MODELOS_DIR = os.path.join(BASE_DIR, 'modelos') # Nuevo directorio para modelos

PLAN_ESTRATEGICO_FILE = os.path.join(SIMULACION_DIR, 'simulacion_balance_anual_final.csv')
PLAN_ESTRATEGICO_DIARIO_FILE = os.path.join(SIMULACION_DIR, 'simulacion_balance_diario_final.csv') # Nuevo archivo de plan diario
PRECIO_INTERNO_FILE = os.path.join(DATA_DIR, 'Precio Mercado Interno - Hoja 1.csv')
HISTORIAL_OPERACIONES_FILE = os.path.join(SIMULACION_DIR, 'historial_operaciones_diarias.csv')
MODELO_CONSUMO_SARIMA_FILE = os.path.join(MODELOS_DIR, 'modelo_consumo_sarima.pkl') # Ruta al modelo SARIMA

# Parámetros para el cálculo del PRD
# K = 0.5        # Factor de Sensibilidad (0.1 a 1.0). Define la reacción del precio.

# --- Cargar Historial de Operaciones Diarias (una sola vez) ---
try:
    df_historial_operaciones = pd.read_csv(HISTORIAL_OPERACIONES_FILE, parse_dates=['fecha'])
    df_historial_operaciones.set_index('fecha', inplace=True)
    # Limpiar nombres de columnas: eliminar espacios y caracteres no ASCII
    df_historial_operaciones.columns = df_historial_operaciones.columns.str.strip().str.replace(r'[^\x00-\x7F]+', '', regex=True)
    print(f"Historial de operaciones diarias cargado desde: {HISTORIAL_OPERACIONES_FILE}")
except FileNotFoundError:
    print(f"ERROR: No se encontró el archivo de historial de operaciones diarias: {HISTORIAL_OPERACIONES_FILE}")
    print("Por favor, asegúrate de haber ejecutado 'generar_historial_operaciones.py' primero.")
    df_historial_operaciones = None
except Exception as e:
    print(f"ERROR al cargar el historial de operaciones diarias: {e}")
    df_historial_operaciones = None

# --- Cargar Plan Estratégico Diario (una sola vez) ---
df_plan_diario = None
try:
    df_plan_diario = pd.read_csv(PLAN_ESTRATEGICO_DIARIO_FILE, parse_dates=['Fecha'])
    df_plan_diario.set_index('Fecha', inplace=True)
    print(f"Plan estratégico diario cargado desde: {PLAN_ESTRATEGICO_DIARIO_FILE}")
except FileNotFoundError:
    print(f"ERROR: No se encontró el archivo del plan estratégico diario: {PLAN_ESTRATEGICO_DIARIO_FILE}")
    print("Por favor, asegúrate de haber ejecutado 'simulacion_balance.py' primero.")
except Exception as e:
    print(f"ERROR al cargar el plan estratégico diario: {e}")

# --- Cargar Modelo SARIMA de Consumo (una sola vez) ---
modelo_sarima_consumo = None
fecha_fin_entrenamiento = None
try:
    with open(MODELO_CONSUMO_SARIMA_FILE, 'rb') as pfile:
        model_data = pickle.load(pfile)
        modelo_sarima_consumo = model_data['model']
        fecha_fin_entrenamiento = model_data['training_end_date']
    print(f"Modelo SARIMA de consumo cargado desde: {MODELO_CONSUMO_SARIMA_FILE}")
    print(f"Fecha de fin de entrenamiento del modelo base: {fecha_fin_entrenamiento.strftime('%Y-%m-%d')}")
except FileNotFoundError:
    print(f"ERROR: No se encontró el archivo del modelo SARIMA de consumo: {MODELO_CONSUMO_SARIMA_FILE}")
    print("Por favor, asegúrate de haber ejecutado 'entrenar_modelo_consumo.py' con el formato nuevo.")
except Exception as e:
    print(f"ERROR al cargar el modelo SARIMA de consumo: {e}")

# --- Cargar Feature de Estacionalidad (una sola vez) ---
df_seasonality = None
try:
    df_seasonality = pd.read_csv(os.path.join(DATA_DIR, 'feature_estacionalidad_precio.csv'), parse_dates=['Fecha'])
    df_seasonality.set_index('Fecha', inplace=True)
    df_seasonality = df_seasonality.asfreq('D')
    print(f"Feature de estacionalidad cargada desde: {os.path.join(DATA_DIR, 'feature_estacionalidad_precio.csv')}")
except FileNotFoundError:
    print(f"ADVERTENCIA: No se encontró el archivo de feature de estacionalidad. Las predicciones SARIMA pueden fallar.")
except Exception as e:
    print(f"ADVERTENCIA: Error al cargar la feature de estacionalidad: {e}")


# --- 2. Funciones de Obtención de Datos ---

def get_precio_base_dinamico(fecha_actual):
    """
    Obtiene el precio base del historial de operaciones para la fecha_actual.
    """
    if df_historial_operaciones is None:
        return 1000 # Valor de respaldo si no hay historial
    
    try:
        # Convertir la fecha a Timestamp para asegurar la coincidencia en el índice
        fecha_ts = pd.Timestamp(fecha_actual)
        precio_tn = df_historial_operaciones.loc[fecha_ts, 'precio_mercado_interno_tn']
        
        if pd.isna(precio_tn):
            # Si el precio es NaN para ese día, buscar el último precio válido anterior
            precio_tn = df_historial_operaciones.loc[:fecha_ts, 'precio_mercado_interno_tn'].dropna().iloc[-1]
            
        print(f"Precio Base (P_base) dinámico obtenido: ${precio_tn:,.2f}/TN (del {fecha_actual.strftime('%Y-%m-%d')})")
        return precio_tn
    except KeyError:
        print(f"ADVERTENCIA: No se encontró precio histórico para la fecha {fecha_actual.strftime('%Y-%m-%d')}.")
        return 1000 # Valor de respaldo
    except Exception as e:
        print(f"ADVERTENCIA: Error al obtener precio histórico para {fecha_actual.strftime('%Y-%m-%d')}: {e}")
        return 1000 # Valor de respaldo

def get_datos_reales_acumulados_mes(hoy):
    """
    Obtiene los datos reales acumulados de consumo y producción para el mes actual
    hasta la fecha 'hoy' desde el historial de operaciones.
    """
    if df_historial_operaciones is None:
        return None
    
    mes_actual = hoy.month
    año_actual = hoy.year
    
    # Filtrar datos del historial para el mes y año actual, hasta la fecha 'hoy'
    df_mes_hasta_hoy = df_historial_operaciones[
        (df_historial_operaciones.index.month == mes_actual) &
        (df_historial_operaciones.index.year == año_actual) &
        (df_historial_operaciones.index <= pd.Timestamp(hoy)) # Convertir hoy a Timestamp
    ]
    
    if df_mes_hasta_hoy.empty:
        print(f"ADVERTENCIA: No se encontraron datos históricos para el mes {mes_actual} hasta {hoy.strftime('%Y-%m-%d')}.")
        return None
        
    consumo_real_acumulado = df_mes_hasta_hoy['consumo_real_diaria'].sum()
    produccion_real_acumulada = df_mes_hasta_hoy['produccion_real_diaria'].sum()
    
    return {
        'consumo_real_acumulado': consumo_real_acumulado,
        'produccion_real_acumulada': produccion_real_acumulada
    }

def calcular_k_dinamico(delta_s_diario, K_MIN, K_MAX, UMBRAL_DESVIACION, PENDIENTE_SIGMOIDE):
    """
    Calcula el factor de sensibilidad K de forma dinámica usando una función sigmoide.
    """
    # Usamos el valor absoluto de la desviación para que K reaccione igual a desviaciones positivas o negativas
    abs_delta_s = abs(delta_s_diario)
    
    # Una versión simplificada para asegurar que K_MIN y K_MAX se respeten bien
    # y que la transición sea clara.
    # La función sigmoide estándar va de 0 a 1. La escalamos y desplazamos.
    
    # Normalizar la desviación para la sigmoide
    x = PENDIENTE_SIGMOIDE * (abs_delta_s - UMBRAL_DESVIACION)
    
    # Calcular el valor sigmoide (entre 0 y 1)
    sigmoid_val = 1 / (1 + math.exp(-x))
    
    # Escalar y desplazar para que K vaya de K_MIN a K_MAX
    k_dinamico = K_MIN + (K_MAX - K_MIN) * sigmoid_val
    
    return k_dinamico

def get_consumo_esperado_mensual_forecast(year, month, df_historial_operaciones):
    """
    Genera un pronóstico de consumo diario para un mes específico utilizando el modelo SARIMAX
    de forma optimizada, proyectando la estacionalidad del año anterior.
    """
    if modelo_sarima_consumo is None or fecha_fin_entrenamiento is None:
        print("ADVERTENCIA: Modelo SARIMA o su fecha de entrenamiento no están cargados. No se puede pronosticar.")
        return None
    if df_seasonality is None:
        print("ADVERTENCIA: Datos de estacionalidad no cargados. No se puede generar pronóstico con variables exógenas.")
        return None

    # Determinar el rango de fechas para el pronóstico
    start_of_month = pd.Timestamp(year, month, 1)
    n_periods_to_forecast = start_of_month.days_in_month
    forecast_dates = pd.date_range(start=start_of_month, periods=n_periods_to_forecast, freq='D')

    # --- Proyectar la variable exógena (estacionalidad) ---
    try:
        # Crear fechas del año anterior para buscar la estacionalidad
        past_dates = [d - pd.DateOffset(years=1) for d in forecast_dates]
        # Reindexar para asegurar que tenemos todos los valores, rellenando si es necesario
        X_forecast = df_seasonality.reindex(past_dates, method='ffill')
        if X_forecast.isnull().any().any():
             # Si aún hay nulos (al principio del historial), rellenar hacia atrás
            X_forecast.fillna(method='bfill', inplace=True)
        
        # El índice del DataFrame exógeno DEBE coincidir con las fechas del pronóstico
        X_forecast.index = forecast_dates
    except Exception as e:
        print(f"ERROR al proyectar la variable exógena de estacionalidad: {e}")
        return None

    # --- Lógica de Actualización y Predicción Optimizada ---
    try:
        # 1. Crear una copia del modelo para no alterar el original cargado en memoria
        model_to_update = copy.deepcopy(modelo_sarima_consumo)
        
        # 2. Determinar los datos nuevos para la actualización
        update_start_date = fecha_fin_entrenamiento + timedelta(days=1)
        update_end_date = start_of_month - timedelta(days=1)
        
        if update_start_date <= update_end_date:
            # Acceder a la columna por posición como workaround para el KeyError persistente
            new_data_y = df_historial_operaciones.iloc[:, 1].loc[update_start_date:update_end_date]
            # También necesitamos los datos exógenos para el período de actualización
            new_data_X = df_seasonality.loc[update_start_date:update_end_date]
            
            if not new_data_y.empty and not new_data_X.empty:
                print(f"Actualizando modelo con {len(new_data_y)} nuevos puntos de datos (de {update_start_date.date()} a {update_end_date.date()})...")
                model_to_update.update(new_data_y, X=new_data_X)
        
        # 3. Generar el pronóstico para el mes completo usando la estacionalidad proyectada
        # Usar n_periods y X. La indexación se corregirá manualmente.
        forecast_result_series = model_to_update.predict(
            n_periods=n_periods_to_forecast,
            X=X_forecast
        )

        # Crear la serie de pronóstico con el índice correcto
        forecast_series = pd.Series(forecast_result_series.values, index=forecast_dates)
        
        return forecast_series
        
    except Exception as e:
        print(f"ERROR al generar pronóstico SARIMA optimizado para {month}/{year}: {e}")
        return None

def calcular_desviacion_proyectada(hoy, stock_real_hoy, df_historial, df_plan_diario):
    """
    Calcula la desviación de stock proyectada para los próximos 7 días de forma optimizada,
    usando el modelo SARIMAX con estacionalidad proyectada.
    """
    print("--- Calculando Desviación Proyectada a 7 días (Optimizado) ---")
    
    if modelo_sarima_consumo is None or fecha_fin_entrenamiento is None:
        print("ADVERTENCIA: Modelo SARIMA o su fecha de entrenamiento no están cargados. No se puede proyectar desviación.")
        return 0.0
    if df_seasonality is None:
        print("ADVERTENCIA: Datos de estacionalidad no cargados. No se puede generar pronóstico con variables exógenas.")
        return 0.0

    # --- Preparar fechas para el pronóstico de 7 días ---
    forecast_dates_7d = pd.date_range(start=pd.Timestamp(hoy) + timedelta(days=1), periods=7, freq='D')

    # --- Proyectar la variable exógena (estacionalidad) para los próximos 7 días ---
    try:
        past_dates_7d = [d - pd.DateOffset(years=1) for d in forecast_dates_7d]
        X_forecast_7d = df_seasonality.reindex(past_dates_7d, method='ffill')
        if X_forecast_7d.isnull().any().any():
            X_forecast_7d.fillna(method='bfill', inplace=True)
        X_forecast_7d.index = forecast_dates_7d
    except Exception as e:
        print(f"ERROR al proyectar la variable exógena de estacionalidad para 7 días: {e}")
        return 0.0

    # 1. Pronosticar consumo para los próximos 7 días
    try:
        # Lógica de actualización optimizada
        model_to_update = copy.deepcopy(modelo_sarima_consumo)
        
        update_start_date = fecha_fin_entrenamiento + timedelta(days=1)
        update_end_date = pd.Timestamp(hoy) # Convertir hoy a Timestamp para comparación
        
        if update_start_date <= update_end_date:
            new_data_y = df_historial.iloc[:, 1].loc[update_start_date:update_end_date]
            new_data_X = df_seasonality.loc[update_start_date:update_end_date]
            
            if not new_data_y.empty and not new_data_X.empty:
                print(f"Actualizando modelo para proyección con {len(new_data_y)} nuevos puntos (de {update_start_date.date()} a {update_end_date.date()})...")
                model_to_update.update(new_data_y, X=new_data_X)

        forecast_result_series_7d = model_to_update.predict(
            n_periods=7,
            X=X_forecast_7d
        )
        consumo_pronosticado_7d = pd.Series(forecast_result_series_7d.values, index=forecast_dates_7d)

    except Exception as e:
        print(f"ADVERTENCIA: No se pudo pronosticar el consumo a 7 días con el método optimizado: {e}. No se calculará la desviación proyectada.")
        return 0.0

    # 2. Simular el stock para los próximos 7 días
    stock_proyectado = stock_real_hoy
    for i in range(7):
        fecha_futura = pd.Timestamp(hoy) + timedelta(days=i+1) # Convertir a Timestamp
        try:
            produccion_diaria_objetivo = df_plan_diario.loc[fecha_futura, 'Produccion Diaria Objetivo (TN)']
            consumo_diario_pronosticado = consumo_pronosticado_7d.iloc[i]
            stock_proyectado += produccion_diaria_objetivo - consumo_diario_pronosticado
        except KeyError:
            print(f"ADVERTENCIA: No se encontraron datos en el plan diario para {fecha_futura.strftime('%Y-%m-%d')}. Se omite este día en la proyección.")
            continue

    # 3. Obtener el stock objetivo para dentro de 7 días
    try:
        fecha_objetivo = pd.Timestamp(hoy) + timedelta(days=7) # Convertir a Timestamp
        stock_objetivo_7d = df_plan_diario.loc[fecha_objetivo, 'Stock Diario Objetivo (TN)']
        stock_estrategico = df_plan_diario.loc[fecha_objetivo, 'Stock Estratégico Mensual (TN)']
    except KeyError:
        print(f"ADVERTENCIA: No se encontraron datos de stock objetivo para {fecha_objetivo.strftime('%Y-%m-%d')}. No se calculará la desviación proyectada.")
        return 0.0

    # 4. Calcular la desviación proyectada
    if stock_estrategico == 0:
        return 0.0
    
    delta_s_proyectado = (stock_proyectado - stock_objetivo_7d) / stock_estrategico
    print(f"Desviación de Stock Proyectada a 7 días: {delta_s_proyectado:.2%}")
    
    return delta_s_proyectado

# --- 3. Motor de Cálculo del PRD Diario ---
def calcular_prd_diario(fecha_analisis=None, K_MIN=0.20, K_MAX=0.80, UMBRAL_DESVIACION=0.05, PENDIENTE_SIGMOIDE=50):
    """
    Calcula el Precio de Referencia Dinámico (PRD) para una fecha específica.
    Si no se proporciona fecha, usa la fecha actual del sistema.
    """
    print("--- Iniciando Motor de PRD Diario ---")
    
    hoy = fecha_analisis if fecha_analisis else date.today()
    
    # --- Obtener P_base dinámico ---
    P_BASE = get_precio_base_dinamico(hoy)
    if P_BASE == 1000: # Si se usó el valor de respaldo, es un error crítico para el PRD
        print("ERROR CRÍTICO: No se pudo obtener un precio base válido. No se puede calcular el PRD.")
        return None
    
    # --- Cargar Plan Estratégico ---
    try:
        df_plan = pd.read_csv(PLAN_ESTRATEGICO_FILE)
    except FileNotFoundError:
        print(f"--- ERROR ---")
        print(f"No se encontró el archivo del plan estratégico: {PLAN_ESTRATEGICO_FILE}")
        print("Asegúrate de haber ejecutado primero el script 'simulacion_balance.py'.")
        return None

    # --- Obtener objetivos del mes ---
    mes_actual = hoy.month
    dia_actual = hoy.day
    dias_en_mes = pd.Timestamp(hoy).days_in_month
    
    try:
        objetivos_mensuales = df_plan[df_plan['Mes'] == mes_actual].iloc[0]
    except IndexError:
        print(f"No se encontraron objetivos para el mes {mes_actual} en el plan estratégico.")
        return None

    print(f"Fecha de Análisis: {hoy.strftime('%Y-%m-%d')}")
    print(f"Objetivo de Consumo para el mes {mes_actual}: {objetivos_mensuales['Consumo (TN)']:,.0f} TN")
    
    # --- Obtener datos reales acumulados del historial ---
    datos_reales_acumulados = get_datos_reales_acumulados_mes(hoy)
    if datos_reales_acumulados is None:
        print("ERROR CRÍTICO: No se pudieron obtener datos reales acumulados del historial. No se puede calcular el PRD.")
        return None
    
    # --- Calcular Desviación de Stock Diaria (ΔS_Diario) ---
    
    # --- Obtener objetivos diarios ---
    if df_plan_diario is None:
        print("ERROR CRÍTICO: No se cargó el plan estratégico diario. No se puede calcular el PRD.")
        return None
    
    try:
        objetivos_diarios = df_plan_diario.loc[pd.Timestamp(hoy)]
    except KeyError:
        print(f"ERROR CRÍTICO: No se encontraron objetivos diarios para la fecha {hoy.strftime('%Y-%m-%d')} en el plan estratégico diario.")
        return None

    print(f"Fecha de Análisis: {hoy.strftime('%Y-%m-%d')}")
    print(f"Objetivo de Consumo Diario: {objetivos_diarios['Consumo Diario Objetivo (TN)']:.0f} TN")

    # 1. Calcular el Stock Esperado para hoy según el plan diario
    stock_esperado_hoy = objetivos_diarios['Stock Diario Objetivo (TN)']
    
    # --- Calcular Consumo Esperado Acumulado usando el modelo SARIMA ---
    # Obtener el pronóstico diario para todo el mes
    start_of_month = pd.Timestamp(hoy.year, hoy.month, 1) # Definir start_of_month aquí
    pronostico_consumo_diario_mes = get_consumo_esperado_mensual_forecast(
        hoy.year, hoy.month, df_historial_operaciones
    )

    if pronostico_consumo_diario_mes is None:
        print("ADVERTENCIA: No se pudo generar el pronóstico SARIMA. Usando objetivo diario del plan.")
        consumo_esperado_acumulado = objetivos_diarios['Consumo Diario Objetivo (TN)'] * hoy.day # Multiplicar por día para simular acumulado
    else:
        # Sumar los pronósticos diarios desde el inicio del mes hasta hoy
        # Asegurarse de que el índice del pronóstico sea DatetimeIndex para loc
        consumo_esperado_acumulado = pronostico_consumo_diario_mes.loc[start_of_month:pd.Timestamp(hoy)].sum()
        # Asegurarse de que no haya valores negativos en el pronóstico acumulado
        consumo_esperado_acumulado = max(0, consumo_esperado_acumulado)

    produccion_esperada_acumulada = objetivos_diarios['Produccion Diaria Objetivo (TN)'] * hoy.day # Multiplicar por día para simular acumulado
    
    # 2. Calcular el Stock Real de hoy
    stock_real_hoy = objetivos_mensuales['Stock Inicial (TN)'] + datos_reales_acumulados['produccion_real_acumulada'] - datos_reales_acumulados['consumo_real_acumulado']
    
    # 3. Calcular la Desviación
    stock_estrategico = objetivos_diarios['Stock Estratégico Mensual (TN)']
    
    # Evitar división por cero si el stock estratégico es 0
    if stock_estrategico == 0:
        print("ADVERTENCIA: Stock Estratégico Objetivo es 0. La desviación de stock no se puede calcular.")
        delta_s_diario = 0
    else:
        delta_s_diario = (stock_real_hoy - stock_esperado_hoy) / stock_estrategico
    
    # 4. Calcular la Desviación Proyectada a 7 días
    delta_s_proyectado = calcular_desviacion_proyectada(hoy, stock_real_hoy, df_historial_operaciones, df_plan_diario)

    # 5. Combinar desviación actual y proyectada (lógica proactiva)
    # Se da más peso a la desviación actual (60%) y menos a la proyectada (40%)
    peso_actual = 0.6
    peso_proyectado = 0.4
    delta_s_combinado = (peso_actual * delta_s_diario) + (peso_proyectado * delta_s_proyectado)
    print(f"Desviación Combinada (Actual y Proyectada): {delta_s_combinado:.2%}")

    # --- Calcular K Dinámico ---
    # Usamos la desviación combinada para un ajuste proactivo
    K_dinamico = calcular_k_dinamico(delta_s_combinado, K_MIN, K_MAX, UMBRAL_DESVIACION, PENDIENTE_SIGMOIDE)
    print(f"Factor K Dinámico: {K_dinamico:.2f} (para ΔS Combinado: {delta_s_combinado:.2%})")

    # --- Calcular PRD ---
    # Usamos la desviación combinada para el cálculo final del PRD
    prd = P_BASE * (1 - K_dinamico * delta_s_combinado)
    
    # --- Mostrar Resultados ---
    print("\n--- Análisis Táctico Diario ---")
    print(f"Consumo Real Acumulado: {datos_reales_acumulados['consumo_real_acumulado']:>15,.0f} TN")
    print(f"Consumo Esperado a la Fecha: {consumo_esperado_acumulado:>10,.0f} TN")
    print(f"Stock Real Hoy: {stock_real_hoy:>24,.0f} TN")
    print(f"Stock Esperado Hoy: {stock_esperado_hoy:>20,.0f} TN")
    print(f"Desviación de Stock (ΔS): {delta_s_diario:>16.2%}")
    
    print("\n" + "="*50)
    print(f"  PRECIO DE REFERENCIA DINÁMICO (PRD) HOY: ${prd:,.2f}")
    print("="*50)
    
    if delta_s_diario < 0:
        analisis = "El consumo real es mayor al esperado. El PRD ha subido para moderar la demanda."
    elif delta_s_diario > 0:
        analisis = "El consumo real es menor al esperado. El PRD ha bajado para incentivar la demanda."
    else:
        analisis = "El mercado está alineado con el plan estratégico."
        
    print(f"\nAnálisis: {analisis}")

    # Devolver los resultados clave para que puedan ser usados por otros scripts
    resultados = {
        "prd": prd,
        "desviacion_stock_pct": delta_s_diario,
        "analisis_texto": analisis,
        "fecha_analisis": hoy,
        "stock_real_hoy": stock_real_hoy,
        "stock_esperado_hoy": stock_esperado_hoy,
        "consumo_real_acumulado": datos_reales_acumulados['consumo_real_acumulado'],
        "consumo_esperado_acumulado": consumo_esperado_acumulado,
        "k_dinamico": K_dinamico
    }
    return resultados

# --- Punto de Entrada del Script ---
if __name__ == "__main__":
    # Para demostración, podemos analizar una fecha específica del historial
    # Asegúrate de que esta fecha exista en tu historial_operaciones_diarias.csv
    fecha_demostracion = date(2025, 6, 15) 
    
    # Asegurarse de que el plan estratégico existe. Si no, ejecutar la simulación.
    # Esta verificación es más robusta si se hace en el panel de control.
    if not os.path.exists(PLAN_ESTRATEGICO_FILE):
        print("Archivo de plan estratégico no encontrado. Ejecutando 'simulacion_balance.py' primero...")
        try:
            import simulacion_balance
            simulacion_balance.ejecutar_simulacion_anual()
        except ImportError:
            print("No se pudo importar 'simulacion_balance'. Por favor, ejecuta 'simulacion_balance.py' manualmente.")
            exit()
            
    calcular_prd_diario(fecha_demostracion)
