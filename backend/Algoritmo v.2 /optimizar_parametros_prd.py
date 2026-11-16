import pandas as pd
import os
from datetime import date
import itertools # Para generar combinaciones de parámetros
import numpy as np
import json # Para guardar y cargar el progreso
import multiprocessing
from functools import partial
import math

import motor_prd_diario
import evaluar_costo_prd

# --- 1. Definición de Rutas y Fechas de Backtesting ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Las mismas fechas de backtesting que en panel_de_control.py
fechas_para_analizar = [
    date(2025, 1, 15),
    date(2025, 7, 20),
    date(2025, 3, 10),
    date(2025, 11, 5)
]

# --- 2. Definir Espacio de Búsqueda para los Parámetros del PRD y Pesos de la Función de Costo ---
search_space = {
    'K_MIN': np.round(np.arange(0.05, 0.4, 0.05), 2).tolist(),
    'K_MAX': np.round(np.arange(0.5, 1.0, 0.05), 2).tolist(),
    'UMBRAL_DESVIACION': np.round(np.arange(0.01, 0.15, 0.01), 2).tolist(),
    'PENDIENTE_SIGMOIDE': np.arange(10, 151, 10).tolist(),
    'PESOS': [
        # Originales
        {'volatilidad_prd': 0.5, 'desviacion_stock': 0.5, 'penalizacion_rango_stock': 0.0},
        {'volatilidad_prd': 0.4, 'desviacion_stock': 0.4, 'penalizacion_rango_stock': 0.2},
        {'volatilidad_prd': 0.2, 'desviacion_stock': 0.6, 'penalizacion_rango_stock': 0.2},
        {'volatilidad_prd': 0.6, 'desviacion_stock': 0.2, 'penalizacion_rango_stock': 0.2},
        {'volatilidad_prd': 0.3, 'desviacion_stock': 0.3, 'penalizacion_rango_stock': 0.4},
        {'volatilidad_prd': 0.1, 'desviacion_stock': 0.7, 'penalizacion_rango_stock': 0.2},
        {'volatilidad_prd': 0.7, 'desviacion_stock': 0.1, 'penalizacion_rango_stock': 0.2},
        {'volatilidad_prd': 0.33, 'desviacion_stock': 0.33, 'penalizacion_rango_stock': 0.34},
        # Nuevas combinaciones
        {'volatilidad_prd': 0.8, 'desviacion_stock': 0.1, 'penalizacion_rango_stock': 0.1},
        {'volatilidad_prd': 0.1, 'desviacion_stock': 0.8, 'penalizacion_rango_stock': 0.1},
        {'volatilidad_prd': 0.1, 'desviacion_stock': 0.1, 'penalizacion_rango_stock': 0.8},
        {'volatilidad_prd': 0.6, 'desviacion_stock': 0.3, 'penalizacion_rango_stock': 0.1},
        {'volatilidad_prd': 0.3, 'desviacion_stock': 0.6, 'penalizacion_rango_stock': 0.1},
        {'volatilidad_prd': 0.1, 'desviacion_stock': 0.3, 'penalizacion_rango_stock': 0.6},
        {'volatilidad_prd': 0.25, 'desviacion_stock': 0.25, 'penalizacion_rango_stock': 0.5},
        {'volatilidad_prd': 0.5, 'desviacion_stock': 0.25, 'penalizacion_rango_stock': 0.25},
        {'volatilidad_prd': 0.25, 'desviacion_stock': 0.5, 'penalizacion_rango_stock': 0.25},
        # Combinaciones con pasos de 0.1
        {'volatilidad_prd': 0.1, 'desviacion_stock': 0.2, 'penalizacion_rango_stock': 0.7},
        {'volatilidad_prd': 0.1, 'desviacion_stock': 0.4, 'penalizacion_rango_stock': 0.5},
        {'volatilidad_prd': 0.1, 'desviacion_stock': 0.6, 'penalizacion_rango_stock': 0.3},
        {'volatilidad_prd': 0.2, 'desviacion_stock': 0.1, 'penalizacion_rango_stock': 0.7},
        {'volatilidad_prd': 0.2, 'desviacion_stock': 0.3, 'penalizacion_rango_stock': 0.5},
        {'volatilidad_prd': 0.2, 'desviacion_stock': 0.5, 'penalizacion_rango_stock': 0.3},
        {'volatilidad_prd': 0.3, 'desviacion_stock': 0.1, 'penalizacion_rango_stock': 0.6},
        {'volatilidad_prd': 0.3, 'desviacion_stock': 0.2, 'penalizacion_rango_stock': 0.5},
        {'volatilidad_prd': 0.3, 'desviacion_stock': 0.4, 'penalizacion_rango_stock': 0.3},
        {'volatilidad_prd': 0.4, 'desviacion_stock': 0.1, 'penalizacion_rango_stock': 0.5},
        {'volatilidad_prd': 0.4, 'desviacion_stock': 0.2, 'penalizacion_rango_stock': 0.4},
        {'volatilidad_prd': 0.4, 'desviacion_stock': 0.3, 'penalizacion_rango_stock': 0.3},
    ],
    'NORMALIZATION_METHOD': ['min_max', 'z_score', 'none']
}

# --- 3. Función Worker para Procesamiento Paralelo ---
def procesar_combinacion(params_tuple, fechas_analisis):
    """
    Procesa una única combinación de parámetros.
    Esta función se ejecuta en un proceso separado.
    """
    K_MIN, K_MAX, UMBRAL_DESVIACION, PENDIENTE_SIGMOIDE, pesos_actuales, normalization_method = params_tuple

    if K_MIN >= K_MAX:
        return (float('inf'), None)

    all_simulation_results = []
    for fecha in fechas_analisis:
        resultados_diarios = motor_prd_diario.calcular_prd_diario(
            fecha_analisis=fecha,
            K_MIN=K_MIN,
            K_MAX=K_MAX,
            UMBRAL_DESVIACION=UMBRAL_DESVIACION,
            PENDIENTE_SIGMOIDE=PENDIENTE_SIGMOIDE
        )
        if resultados_diarios is not None:
            all_simulation_results.append({
                'fecha': resultados_diarios['fecha_analisis'],
                'prd': resultados_diarios['prd'],
                'stock_real_hoy': resultados_diarios['stock_real_hoy'],
                'stock_esperado_hoy': resultados_diarios['stock_esperado_hoy']
            })

    if all_simulation_results:
        df_simulation_results = pd.DataFrame(all_simulation_results)
        df_simulation_results.set_index('fecha', inplace=True)
        
        current_cost = evaluar_costo_prd.calcular_costo(
            df_simulation_results, 
            pesos=pesos_actuales, 
            normalization_method=normalization_method
        )
        
        params = {
            'K_MIN': K_MIN, 'K_MAX': K_MAX, 'UMBRAL_DESVIACION': UMBRAL_DESVIACION,
            'PENDIENTE_SIGMOIDE': PENDIENTE_SIGMOIDE, 'PESOS': pesos_actuales,
            'NORMALIZATION_METHOD': normalization_method
        }
        return (current_cost, params)
    
    return (float('inf'), None)

# --- 4. Función de Optimización Paralela con Checkpointing ---
def optimizar_parametros_prd(fechas_analisis, search_space, checkpoint_file='optimization_checkpoint.json', num_cores=7):
    best_cost = float('inf')
    best_params = {}
    completed_chunks = []

    # Cargar progreso si existe un checkpoint
    if os.path.exists(checkpoint_file):
        try:
            with open(checkpoint_file, 'r') as f:
                checkpoint = json.load(f)
                best_cost = checkpoint.get('best_cost', float('inf'))
                best_params = checkpoint.get('best_params', {})
                completed_chunks = checkpoint.get('completed_chunks', [])
                print(f"--- Reanudando optimización. {len(completed_chunks)} lotes ya completados. ---")
        except (json.JSONDecodeError, IOError) as e:
            print(f"Advertencia: No se pudo leer el archivo de checkpoint '{checkpoint_file}'. Se iniciará desde el principio. Error: {e}")

    # Generar todas las combinaciones posibles de parámetros
    all_param_combinations = list(itertools.product(
        search_space['K_MIN'], search_space['K_MAX'], search_space['UMBRAL_DESVIACION'],
        search_space['PENDIENTE_SIGMOIDE'], search_space['PESOS'], search_space['NORMALIZATION_METHOD']
    ))
    
    total_combinations = len(all_param_combinations)
    
    # Dividir combinaciones en lotes (chunks)
    chunk_size = num_cores * 4 
    chunks = [all_param_combinations[i:i + chunk_size] for i in range(0, total_combinations, chunk_size)]
    total_chunks = len(chunks)

    print(f"--- Iniciando optimización paralela con {num_cores} núcleos ---")
    print(f"Total de combinaciones a probar: {total_combinations} (dividido en {total_chunks} lotes)")

    # Crear un pool de procesos
    with multiprocessing.Pool(processes=num_cores) as pool:
        
        # Usar partial para pasar el argumento fijo 'fechas_analisis' a la función worker
        worker_func = partial(procesar_combinacion, fechas_analisis=fechas_analisis)

        for i, chunk in enumerate(chunks):
            if i in completed_chunks:
                print(f"\n--- Saltando lote {i+1}/{total_chunks} (ya completado) ---")
                continue

            print(f"\n--- Procesando lote {i+1}/{total_chunks} ({len(chunk)} combinaciones) ---")
            
            results = pool.map(worker_func, chunk)
            
            # Encontrar el mejor resultado de este lote
            for cost, params in results:
                if params and cost < best_cost:
                    best_cost = cost
                    best_params = params
                    print(f"  ¡Nuevo mejor costo encontrado: {best_cost:,.2f}!")
            
            # Guardar progreso después de cada lote
            completed_chunks.append(i)
            try:
                with open(checkpoint_file, 'w') as f:
                    json.dump({
                        'best_cost': best_cost,
                        'best_params': best_params,
                        'completed_chunks': completed_chunks
                    }, f, indent=4)
            except IOError as e:
                print(f"Error: No se pudo escribir en el archivo de checkpoint. El progreso de este lote no se guardará. Error: {e}")

    print("\n" + "="*70)
    print("== OPTIMIZACIÓN COMPLETADA ==")
    print("="*70)
    print(f"Mejor Costo Encontrado: {best_cost:,.2f}")
    print(f"Mejores Parámetros: {best_params}")
    
    # Eliminar el archivo de checkpoint al completar exitosamente
    if os.path.exists(checkpoint_file):
        os.remove(checkpoint_file)
        print(f"--- Archivo de checkpoint '{checkpoint_file}' eliminado. ---")

    return best_params, best_cost

# --- Punto de Entrada del Script ---
if __name__ == "__main__":
    # Asegurarse de que el número de núcleos no exceda el máximo disponible
    max_cores = multiprocessing.cpu_count()
    # Usar 3 núcleos, asegurándose de no exceder el total disponible
    cores_a_usar = min(3, max_cores)
    
    best_params, best_cost = optimizar_parametros_prd(
        fechas_para_analizar, 
        search_space,
        num_cores=cores_a_usar
    )
