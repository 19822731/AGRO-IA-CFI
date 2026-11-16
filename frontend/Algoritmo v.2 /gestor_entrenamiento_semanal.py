import os
import pickle
import sys
from datetime import datetime
import csv
import ast # Para convertir strings de tuplas/listas de nuevo a objetos Python

# Asegurarse de que el directorio actual esté en el path para poder importar el otro script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from entrenar_modelo_consumo import ejecutar_entrenamiento_y_evaluacion

# --- 1. Definición de Rutas ---
MODELOS_DIR = os.path.join(BASE_DIR, 'modelos')
CHAMPION_MODEL_PATH = os.path.join(MODELOS_DIR, 'modelo_consumo_sarima.pkl')
CHALLENGER_MODEL_PATH = os.path.join(MODELOS_DIR, 'modelo_consumo_candidato.pkl')
HISTORIAL_RENDIMIENTO_FILE = os.path.join(BASE_DIR, 'historial_rendimiento_modelos.csv')

# --- 2. Funciones del Gestor ---

def get_champion_info(champion_path):
    """
    Carga el modelo campeón actual y devuelve su información completa (MAPE, parámetros y perfil de datos).
    """
    print(f"--- Cargando información del modelo Campeón desde: {champion_path} ---")
    default_info = {'mape': float('inf'), 'params': None, 'seasonal_params': None, 'data_profile': None}
    try:
        with open(champion_path, 'rb') as pfile:
            champion_data = pickle.load(pfile)
        
        if champion_data.get('mape_score') is not None:
            print(f"Rendimiento del Campeón actual (MAPE): {champion_data['mape_score']:.2%}")
            return {
                'mape': champion_data.get('mape_score'),
                'params': champion_data.get('model_params'),
                'seasonal_params': champion_data.get('model_seasonal_params'),
                'data_profile': champion_data.get('data_profile')
            }
        else:
            print("ADVERTENCIA: El modelo Campeón no tiene una puntuación de rendimiento guardada.")
            return default_info
    except FileNotFoundError:
        print("ADVERTENCIA: No se encontró un modelo Campeón. El primer contendiente será coronado automáticamente.")
        return default_info
    except Exception as e:
        print(f"ERROR al leer el modelo Campeón: {e}")
        return default_info

def get_elite_suggestions(history_file, top_n=3):
    """
    Lee el historial de rendimiento y devuelve las N mejores configuraciones de parámetros.
    """
    print(f"\n--- Analizando 'memoria' de entrenamientos desde: {history_file} ---")
    if not os.path.exists(history_file):
        print("No se encontró historial de rendimiento. Se procederá con una búsqueda libre.")
        return []
    try:
        with open(history_file, 'r') as csvfile:
            reader = csv.DictReader(csvfile)
            valid_runs = [row for row in reader if row.get('winner') in ['challenger', 'champion'] and row.get('challenger_mape')]
            valid_runs.sort(key=lambda x: float(x['challenger_mape']))
        
        suggestions = []
        for run in valid_runs[:top_n]:
            try:
                params = ast.literal_eval(run['winner_params'])
                seasonal_params = ast.literal_eval(run['winner_seasonal_params'])
                suggestions.append({'params': params, 'seasonal_params': seasonal_params})
            except (ValueError, SyntaxError): continue
        print(f"Se han extraído {len(suggestions)} sugerencia(s) de élite del historial.")
        return suggestions
    except Exception as e:
        print(f"ERROR al leer o procesar el historial de sugerencias: {e}")
        return []

def promote_challenger_to_champion(challenger_path, champion_path):
    """Reemplaza el modelo campeón con el contendiente."""
    print(f"--- Promocionando Contendiente a Campeón ---")
    try:
        if os.path.exists(champion_path): os.remove(champion_path)
        os.rename(challenger_path, champion_path)
        print(f"¡Nuevo Campeón coronado!: {champion_path}")
    except Exception as e:
        print(f"ERROR CRÍTICO al promocionar el nuevo modelo: {e}")

def registrar_resultado_entrenamiento(timestamp, champion_mape, challenger_mape, winner, winner_params, winner_seasonal_params, data_profile):
    """Registra los resultados de la sesión de entrenamiento y el perfil de los datos en un archivo CSV."""
    print(f"\n--- Registrando resultados en la 'memoria' ({HISTORIAL_RENDIMIENTO_FILE}) ---")
    file_exists = os.path.isfile(HISTORIAL_RENDIMIENTO_FILE)
    
    # Asegurarse de que el perfil de datos es un diccionario
    data_profile = data_profile or {}

    try:
        # Los encabezados ahora incluyen las claves del perfil de datos
        fieldnames = ['timestamp', 'champion_mape', 'challenger_mape', 'winner', 'winner_params', 'winner_seasonal_params'] + list(data_profile.keys())
        
        with open(HISTORIAL_RENDIMIENTO_FILE, 'a', newline='') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            if not file_exists:
                writer.writeheader()
            
            # Combinar los datos del entrenamiento con el perfil de los datos
            row_data = {
                'timestamp': timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                'champion_mape': f"{champion_mape:.4f}" if champion_mape != float('inf') else 'inf',
                'challenger_mape': f"{challenger_mape:.4f}" if not (challenger_mape is None or challenger_mape != challenger_mape) else 'NaN',
                'winner': winner,
                'winner_params': str(winner_params),
                'winner_seasonal_params': str(winner_seasonal_params)
            }
            row_data.update(data_profile) # Añadir las métricas del perfil de datos
            
            writer.writerow(row_data)
        print("Resultados registrados con éxito en la memoria a largo plazo.")
    except Exception as e:
        print(f"ERROR al registrar los resultados en la memoria: {e}")

# --- 3. Punto de Entrada del Script ---

if __name__ == "__main__":
    print("\n" + "="*70)
    print("== GESTOR DE REENTRENAMIENTO CON APRENDIZAJE (CHAMPION/CHALLENGER) ==")
    print("="*70)

    current_timestamp = datetime.now()

    # 1. Obtener información del campeón actual
    champion_info = get_champion_info(CHAMPION_MODEL_PATH)

    # 2. Obtener sugerencias de la "memoria" (historial de ejecuciones)
    elite_suggestions = get_elite_suggestions(HISTORIAL_RENDIMIENTO_FILE)

    # 3. Entrenar un nuevo modelo "contendiente" usando las sugerencias
    print("\n--- Entrenando nuevo modelo Contendiente (usando sugerencias de élite) ---")
    challenger_results = ejecutar_entrenamiento_y_evaluacion(CHALLENGER_MODEL_PATH, elite_suggestions=elite_suggestions)

    # Manejar fallo en el entrenamiento
    if challenger_results is None:
        print("\nEl entrenamiento del Contendiente falló. El Campeón actual se mantiene.")
        if os.path.exists(CHALLENGER_MODEL_PATH): os.remove(CHALLENGER_MODEL_PATH)
        registrar_resultado_entrenamiento(current_timestamp, champion_info['mape'], None, 'champion_retained_fail', champion_info['params'], champion_info['seasonal_params'], champion_info['data_profile'])
        exit()

    # 4. Comparar modelos
    print("\n--- Comparación de Modelos ---")
    print(f"  - Campeón actual (MAPE):   {champion_info['mape']:.2%}")
    print(f"  - Contendiente nuevo (MAPE): {challenger_results['mape']:.2%}")
    print("---------------------------------")
    
    # 5. Decidir el ganador y registrar el resultado completo
    if challenger_results['mape'] < champion_info['mape']:
        print("\n¡VICTORIA DEL CONTENDIENTE! El nuevo modelo es mejor.")
        promote_challenger_to_champion(CHALLENGER_MODEL_PATH, CHAMPION_MODEL_PATH)
        registrar_resultado_entrenamiento(current_timestamp, champion_info['mape'], challenger_results['mape'], 'challenger', challenger_results['params'], challenger_results['seasonal_params'], challenger_results['data_profile'])
    else:
        print("\nEL CAMPEÓN RETIENE SU TÍTULO. El modelo actual sigue siendo superior.")
        if os.path.exists(CHALLENGER_MODEL_PATH): os.remove(CHALLENGER_MODEL_PATH)
        registrar_resultado_entrenamiento(current_timestamp, champion_info['mape'], challenger_results['mape'], 'champion', champion_info['params'], champion_info['seasonal_params'], champion_info['data_profile'])

    print("\n¡Proceso de gestión de reentrenamiento completado!")
