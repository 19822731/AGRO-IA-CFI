import os
import pandas as pd
from datetime import date
import sys # Importar sys para sys.exit

# Importar las funciones principales de los otros dos scripts
import simulacion_balance
import motor_prd_diario
import evaluar_costo_prd # Importar el módulo para calcular el costo

# --- Parámetros Óptimos Encontrados (desde optimizar_parametros_prd.py) ---
# Estos parámetros se obtuvieron de la última ejecución de optimización
BEST_PRD_PARAMS = {
    'K_MIN': 0.15, 
    'K_MAX': 0.5, 
    'UMBRAL_DESVIACION': 0.14, 
    'PENDIENTE_SIGMOIDE': 10, 
    'PESOS': {'volatilidad_prd': 0.8, 'desviacion_stock': 0.1, 'penalizacion_rango_stock': 0.1}, 
    'NORMALIZATION_METHOD': 'z_score'
}

def ejecutar_panel_de_control(fecha_analisis=None):
    """
    Presenta un informe consolidado para una fecha específica, leyendo de otros scripts/archivos.
    No orquesta la generación de archivos.
    """
    print("="*70)
    print("== PANEL DE CONTROL INTEGRADO: ESTRATEGIA Y TÁCTICA ==")
    print("="*70)

    # --- 1. CAPA ESTRATÉGICA: Verificación del Plan Anual ---
    print("\n--- PASO 1: Verificando Plan Estratégico Anual ---")
    
    plan_file = simulacion_balance.OUTPUT_FILE
    if not os.path.exists(plan_file):
        print(f"ERROR: Archivo de plan estratégico no encontrado en '{plan_file}'.")
        print("Por favor, asegúrate de que 'simulacion_balance.py' se haya ejecutado previamente para generar el plan.")
        sys.exit(1) # Salir si el archivo no existe
    else:
        print(f"Plan estratégico encontrado en: {plan_file}")

    # --- 2. CAPA TÁCTICA: Ejecutando Motor de PRD Diario ---
    print("\n--- PASO 2: Ejecutando Motor Táctico Diario (PRD) ---")
    
    # Llamar a la función del motor diario para obtener los resultados
    # Se pasa la fecha de análisis y los parámetros óptimos del PRD
    resultados_diarios = motor_prd_diario.calcular_prd_diario(
        fecha_analisis=fecha_analisis,
        K_MIN=BEST_PRD_PARAMS['K_MIN'],
        K_MAX=BEST_PRD_PARAMS['K_MAX'],
        UMBRAL_DESVIACION=BEST_PRD_PARAMS['UMBRAL_DESVIACION'],
        PENDIENTE_SIGMOIDE=BEST_PRD_PARAMS['PENDIENTE_SIGMOIDE']
    )
    
    if resultados_diarios is None:
        print("\n--- ANÁLISIS FALLIDO: El motor de PRD diario no pudo completarse. ---")
        return

    # --- 3. INFORME CONSOLIDADO ---
    print("\n" + "="*70)
    print("== INFORME CONSOLIDADO DEL PANEL DE CONTROL ==")
    print(f"== Fecha del Análisis Táctico: {resultados_diarios['fecha_analisis'].strftime('%Y-%m-%d')} ==")
    print("="*70)

    # Mostrar el resultado del análisis táctico
    print("\n--- Resumen Táctico Diario ---")
    print(f"  Desviación de Stock vs. Plan: {resultados_diarios['desviacion_stock_pct']:.2%}")
    print(f"  PRECIO DE REFERENCIA DINÁMICO (PRD) HOY: ${resultados_diarios['prd']:,.2f}")
    print(f"\n  Análisis del Día: {resultados_diarios['analisis_texto']}")
    
    # Ya no se muestra el contexto del plan estratégico mensual aquí para evitar el ValueError
    # Se asume que el usuario puede consultar el archivo simulacion_balance_anual_final.csv directamente.

    print("\n" + "="*70)
    print("== FIN DEL INFORME ==")
    print("="*70)


if __name__ == "__main__":
    # Demostración de backtesting para varias fechas
    # Ajustadas para que coincidan con el rango de fechas del plan estratégico diario (desde 2025)
    fechas_para_analizar = [
        date(2025, 1, 15),  # Mediados de enero de 2025
        date(2025, 7, 20),  # Plena zafra de 2025
        date(2025, 3, 10),  # Antes de la zafra de 2025
        date(2025, 11, 5)   # Finales de 2025
    ]

    all_simulation_results = [] # Lista para almacenar los resultados de cada día

    for fecha in fechas_para_analizar:
        resultados_diarios = motor_prd_diario.calcular_prd_diario(
            fecha_analisis=fecha,
            K_MIN=BEST_PRD_PARAMS['K_MIN'],
            K_MAX=BEST_PRD_PARAMS['K_MAX'],
            UMBRAL_DESVIACION=BEST_PRD_PARAMS['UMBRAL_DESVIACION'],
            PENDIENTE_SIGMOIDE=BEST_PRD_PARAMS['PENDIENTE_SIGMOIDE']
        )
        
        if resultados_diarios is not None:
            # Recopilar solo los datos necesarios para el cálculo del costo
            all_simulation_results.append({
                'fecha': resultados_diarios['fecha_analisis'],
                'prd': resultados_diarios['prd'],
                'stock_real_hoy': resultados_diarios['stock_real_hoy'],
                'stock_esperado_hoy': resultados_diarios['stock_esperado_hoy']
            })
            
            # Imprimir el informe consolidado (opcional, se puede mover a una función)
            print("\n" + "="*70)
            print("== INFORME CONSOLIDADO DEL PANEL DE CONTROL ==")
            print(f"== Fecha del Análisis Táctico: {resultados_diarios['fecha_analisis'].strftime('%Y-%m-%d')} ==")
            print("="*70)
            print("\n--- Resumen Táctico Diario ---")
            print(f"  Desviación de Stock vs. Plan: {resultados_diarios['desviacion_stock_pct']:.2%}")
            print(f"  PRECIO DE REFERENCIA DINÁMICO (PRD) HOY: ${resultados_diarios['prd']:,.2f}")
            print(f"\n  Análisis del Día: {resultados_diarios['analisis_texto']}")
            print("\n" + "="*70)
            print("== FIN DEL INFORME ==")
            print("="*70)
        else:
            print(f"\n--- ANÁLISIS FALLIDO para la fecha {fecha.strftime('%Y-%m-%d')}. ---")
        
        print("\n" + "#"*70 + "\n") # Separador entre análisis

    # --- Evaluación del Costo Total de la Simulación ---
    if all_simulation_results:
        df_simulation_results = pd.DataFrame(all_simulation_results)
        df_simulation_results.set_index('fecha', inplace=True)
        
        costo_total_simulacion = evaluar_costo_prd.calcular_costo(
            df_simulation_results,
            pesos=BEST_PRD_PARAMS['PESOS'],
            normalization_method=BEST_PRD_PARAMS['NORMALIZATION_METHOD']
        )
        print(f"\nCosto Total de la Simulación (para todas las fechas analizadas): {costo_total_simulacion:,.2f}")
    else:
        print("\nNo hay resultados de simulación para calcular el costo.")