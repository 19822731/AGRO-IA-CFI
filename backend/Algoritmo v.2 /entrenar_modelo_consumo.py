import pandas as pd
import numpy as np
import os
import pickle
from pmdarima import auto_arima
import warnings
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error, mean_squared_error
from math import sqrt

warnings.filterwarnings("ignore") # Suprimir advertencias para una salida más limpia

# --- 1. Definición de Rutas ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SIMULACION_DIR = os.path.join(BASE_DIR, 'simulaciones')
MODELOS_DIR = os.path.join(BASE_DIR, 'modelos')
os.makedirs(MODELOS_DIR, exist_ok=True) # Asegurarse de que el directorio de modelos exista

HISTORIAL_OPERACIONES_FILE = os.path.join(SIMULACION_DIR, 'historial_operaciones_diarias.csv')
MODEL_OUTPUT_FILE = os.path.join(MODELOS_DIR, 'modelo_consumo_sarima.pkl')
EXOG_FEATURE_FILE = os.path.join(BASE_DIR, 'Datos', 'feature_estacionalidad_precio.csv') # Nueva ruta

# --- 2. Cargar y Preparar Datos ---
def cargar_y_preparar_datos(file_path):
    print(f"Cargando datos desde: {file_path}")
    try:
        df = pd.read_csv(file_path, parse_dates=['fecha'])
        df.set_index('fecha', inplace=True)
        # Limpiar nombres de columnas: eliminar espacios y caracteres no ASCII
        df.columns = df.columns.str.strip().str.replace(r'[^\x00-\x7F]+', '', regex=True)
        
        # Acceder a la columna por posición como workaround para el KeyError persistente
        # Asumimos que 'consumo_real_diario' es la segunda columna (índice 1)
        df_consumo = df.iloc[:, 1]

        # Asegurarse de que el índice sea de frecuencia diaria
        df_consumo = df_consumo.asfreq('D')
        # Rellenar cualquier día faltante con el valor anterior (o 0 si es al inicio)
        df_consumo.fillna(method='ffill', inplace=True)
        df_consumo.fillna(0, inplace=True) # Rellenar NaNs iniciales si los hubiera
        
        # Seleccionar la serie de consumo
        serie_consumo = df_consumo
        print(f"Datos cargados. Total de puntos: {len(serie_consumo)}")
        print(f"Rango de fechas: {serie_consumo.index.min()} a {serie_consumo.index.max()}")
        return serie_consumo
    except FileNotFoundError:
        print(f"ERROR: Archivo no encontrado en {file_path}")
        return None
    except Exception as e:
        print(f"ERROR al cargar o preparar los datos: {e}")
        return None

def cargar_feature_exogena(file_path):
    print(f"Cargando feature exógena desde: {file_path}")
    try:
        df_exog = pd.read_csv(file_path, parse_dates=['Fecha'])
        df_exog.set_index('Fecha', inplace=True)
        df_exog = df_exog.asfreq('D')
        df_exog.fillna(method='ffill', inplace=True)
        df_exog.fillna(0, inplace=True) # Rellenar NaNs iniciales
        print("Feature exógena cargada con éxito.")
        return df_exog
    except FileNotFoundError:
        print(f"ERROR: Archivo de feature exógena no encontrado en {file_path}")
        return None
    except Exception as e:
        print(f"ERROR al cargar la feature exógena: {e}")
        return None

# --- 3. Entrenar Modelo SARIMAX ---
def entrenar_modelo_sarimax(serie_consumo, exog_data, elite_suggestions=None):
    """
    Entrena un modelo SARIMAX de forma inteligente:
    1. Prueba las configuraciones de élite sugeridas por el historial.
    2. Realiza una búsqueda abierta con auto_arima.
    3. Compara y devuelve el mejor modelo encontrado.
    """
    model_type = "SARIMAX" if exog_data is not None else "SARIMA"
    print(f"\n--- Iniciando entrenamiento del modelo {model_type} (con aprendizaje de historial) ---")
    
    best_elite_model = None
    best_elite_aic = float('inf')

    # 1. Probar las sugerencias de élite del historial
    if elite_suggestions:
        print(f"\n--- Probando {len(elite_suggestions)} sugerencia(s) de élite del historial ---")
        for i, suggestion in enumerate(elite_suggestions):
            try:
                order, seasonal_order = suggestion['params'], suggestion['seasonal_params']
                # pmdarima espera tuplas, pero JSON las convierte en listas, así que las convertimos de nuevo
                order = tuple(order)
                seasonal_order = tuple(seasonal_order)

                print(f"Probando sugerencia {i+1}: order={order}, seasonal_order={seasonal_order}")
                
                # Usamos auto_arima con parámetros fijos para forzar una configuración específica
                elite_model = auto_arima(serie_consumo, 
                                         X=exog_data,
                                         start_p=order[0], start_q=order[2],
                                         max_p=order[0], max_q=order[2],
                                         d=order[1],
                                         seasonal=True,
                                         m=seasonal_order[3],
                                         start_P=seasonal_order[0], start_Q=seasonal_order[2],
                                         max_P=seasonal_order[0], max_Q=seasonal_order[2],
                                         D=seasonal_order[1],
                                         suppress_warnings=True, error_action='ignore',
                                         stepwise=False, # Forzar prueba exacta de esta configuración
                                         n_fits=1) # Solo probar esta configuración

                current_aic = elite_model.aic()
                print(f"Resultado de la sugerencia {i+1}: AIC = {current_aic:.2f}")
                if current_aic < best_elite_aic:
                    best_elite_aic = current_aic
                    best_elite_model = elite_model
            except Exception as e:
                print(f"Error al probar la sugerencia {suggestion}: {e}")
                continue
        
        if best_elite_model:
            print(f"\nMejor modelo de élite encontrado: AIC = {best_elite_aic:.2f}, Parámetros: {best_elite_model.order}, {best_elite_model.seasonal_order}")

    # 2. Ejecutar auto_arima para búsqueda libre
    print("\n--- Ejecutando búsqueda libre con auto_arima para encontrar nuevos patrones ---")
    auto_arima_model = auto_arima(serie_consumo, 
                                  X=exog_data,
                                  start_p=1, start_q=1,
                                  max_p=3, max_q=3,
                                  m=7,
                                  seasonal=True,
                                  d=None, D=None,
                                  trace=True,
                                  error_action='ignore',  
                                  suppress_warnings=True, 
                                  stepwise=True)
    
    auto_arima_aic = auto_arima_model.aic()
    print(f"\nMejor modelo de búsqueda libre encontrado: AIC = {auto_arima_aic:.2f}, Parámetros: {auto_arima_model.order}, {auto_arima_model.seasonal_order}")

    # 3. Comparar y devolver el mejor modelo absoluto
    if best_elite_model and best_elite_aic < auto_arima_aic:
        print("\n--- El mejor modelo de élite del historial ha ganado. ---")
        print(best_elite_model.summary())
        return best_elite_model
    else:
        print("\n--- El modelo de la búsqueda libre de auto_arima ha ganado o empatado. ---")
        print(auto_arima_model.summary())
        return auto_arima_model

# --- 4. Guardar Modelo ---
from statsmodels.tsa.seasonal import seasonal_decompose

# --- 4. Caracterización de Datos ---
def caracterizar_datos(serie):
    """Calcula un perfil de características básicas de la serie de datos."""
    print("\n--- Caracterizando datos de entrenamiento ---")
    profile = {}
    try:
        profile['data_mean'] = serie.mean()
        profile['data_std_dev'] = serie.std()
        
        # Calcular fuerza de la estacionalidad (requiere al menos 2 ciclos)
        if len(serie) > 365 * 2:
            decomposition = seasonal_decompose(serie, model='additive', period=365)
            residuals_var = np.var(decomposition.resid.dropna())
            data_var = np.var(serie)
            if data_var > 0:
                profile['data_seasonality_strength'] = max(0, 1 - (residuals_var / data_var))
            else:
                profile['data_seasonality_strength'] = 0
        else:
            profile['data_seasonality_strength'] = None
            
        print(f"Perfil de datos: {profile}")
        return profile
    except Exception as e:
        print(f"ADVERTENCIA: No se pudo completar la caracterización de datos: {e}")
        return {
            'data_mean': None,
            'data_std_dev': None,
            'data_seasonality_strength': None
        }

# --- 5. Guardar Modelo ---
def guardar_modelo(model, training_end_date, mape_score, model_params, model_seasonal_params, data_profile, file_path):
    """Guarda el modelo y toda su metadata en un archivo."""
    print(f"\nGuardando modelo y metadata en: {file_path}")
    try:
        model_data = {
            'model': model,
            'training_end_date': training_end_date,
            'mape_score': mape_score,
            'model_params': model_params,
            'model_seasonal_params': model_seasonal_params,
            'data_profile': data_profile # Nueva metadata
        }
        with open(file_path, 'wb') as pfile:
            pickle.dump(model_data, pfile)
        print(f"Modelo guardado con éxito. Fin de entrenamiento: {training_end_date.strftime('%Y-%m-%d')}, MAPE: {mape_score:.2%}")
        print(f"Parámetros del modelo: {model_params}, Parámetros estacionales: {model_seasonal_params}")
    except Exception as e:
        print(f"ERROR al guardar el modelo: {e}")

def ejecutar_entrenamiento_y_evaluacion(output_file_path, elite_suggestions=None):
    """
    Función principal que carga y caracteriza datos, entrena (con sugerencias), evalúa y guarda el modelo.
    Devuelve un diccionario con la métrica de rendimiento (MAPE), los parámetros y el perfil de los datos.
    """
    # Cargar datos de consumo y la feature exógena
    serie_consumo = cargar_y_preparar_datos(HISTORIAL_OPERACIONES_FILE)
    df_exog = cargar_feature_exogena(EXOG_FEATURE_FILE)
    
    if serie_consumo is None or df_exog is None:
        print("Cancelando entrenamiento debido a errores en la carga de datos.")
        return None

    # --- Alineación de Datos ---
    combined_df = pd.concat([serie_consumo, df_exog], axis=1, join='inner')
    combined_df.columns = ['consumo', 'estacionalidad_precio']
    y = combined_df['consumo']
    X = combined_df[['estacionalidad_precio']]
    print(f"\nDatos combinados y alineados. Nuevo total de puntos: {len(y)}")

    # --- Caracterizar los datos ANTES de entrenar ---
    data_profile = caracterizar_datos(y)

    # --- Evaluación del Modelo ---
    print("\n" + "="*70)
    print("== EVALUACIÓN DE RENDIMIENTO DEL MODELO SARIMAX ==")
    print("="*70)

    train_size = int(len(y) * 0.8)
    y_train, y_test = y[:train_size], y[train_size:]
    X_train, X_test = X[:train_size], X[train_size:]
    
    print(f"Tamaño del conjunto de entrenamiento: {len(y_train)}")
    print(f"Tamaño del conjunto de prueba: {len(y_test)}")

    modelo_para_eval = entrenar_modelo_sarimax(y_train, X_train, elite_suggestions)
    predictions = modelo_para_eval.predict(n_periods=len(y_test), X=X_test)
    
    mape = mean_absolute_percentage_error(y_test, predictions)
    
    print("\n--- Métricas de Rendimiento (sobre conjunto de prueba) ---")
    print(f"  Error Porcentual Absoluto Medio (MAPE): {mape:.2%}")
    print("----------------------------------------------------------")

    # --- Re-entrenamiento y Guardado del Modelo Final ---
    print("\n" + "="*70)
    print("== RE-ENTRENAMIENTO DEL MODELO FINAL CON TODOS LOS DATOS ==")
    print("="*70)
    
    modelo_final = entrenar_modelo_sarimax(y, X, elite_suggestions)
    if modelo_final is not None:
        last_training_date = y.index[-1]
        model_params = modelo_final.order
        model_seasonal_params = modelo_final.seasonal_order
        # Guardar el modelo final junto con toda la metadata
        guardar_modelo(modelo_final, last_training_date, mape, model_params, model_seasonal_params, data_profile, output_file_path)
        return {
            'mape': mape,
            'params': model_params,
            'seasonal_params': model_seasonal_params,
            'data_profile': data_profile # Devolver también el perfil
        }
    else:
        return None

# --- Punto de Entrada del Script ---
if __name__ == "__main__":
    print("--- Ejecutando script de entrenamiento en modo standalone (sin sugerencias) ---")
    resultados_entrenamiento = ejecutar_entrenamiento_y_evaluacion(MODEL_OUTPUT_FILE, elite_suggestions=None)
    if resultados_entrenamiento is not None:
        print(f"\n¡Proceso de entrenamiento y guardado completado! MAPE final: {resultados_entrenamiento['mape']:.2%}")
        print(f"Parámetros del modelo: {resultados_entrenamiento['params']}, Parámetros estacionales: {resultados_entrenamiento['seasonal_params']}")
    else:
        print("\nEl proceso de entrenamiento falló.")

