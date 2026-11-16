import pandas as pd
import numpy as np
from sklearn.metrics import mean_absolute_error

# --- Parámetros de Normalización (Min-Max) ---
# Estos valores deben ser definidos con conocimiento del dominio o a partir de un análisis histórico.
# Representan el "peor caso tolerable" para cada métrica.
MAX_TOLERABLE_VOLATILIDAD_PRD = 150000.0  # Ejemplo: 150,000 $/TN de desviación estándar
MAX_TOLERABLE_DESVIACION_STOCK = 70000.0 # Ejemplo: 70,000 TN de MAE
MAX_TOLERABLE_PENALIZACION_RANGO_STOCK = 1.0 # Ejemplo: 1.0 significa que la penalización total es igual al stock esperado promedio

def _normalizar_componente(value, method, normalization_params):
    """
    Normaliza un único componente de costo.
    """
    if method == 'min_max':
        min_val = normalization_params.get('min_val', 0)
        max_val = normalization_params.get('max_val')
        if max_val is None or max_val == min_val:
            return value # No se puede normalizar si no hay rango o es cero
        return (value - min_val) / (max_val - min_val)
    elif method == 'z_score':
        mean_val = normalization_params.get('mean_val')
        std_val = normalization_params.get('std_val')
        if std_val is None or std_val == 0:
            return value # No se puede normalizar si la desviación estándar es cero
        return (value - mean_val) / std_val
    else: # 'none' o método desconocido
        return value

def calcular_costo(df_resultados_simulacion, pesos=None, normalization_method='min_max'):
    """
    Calcula un costo combinado basado en la volatilidad del PRD, la desviación del stock
    y una penalización por salirse de un rango de stock aceptable.

    Args:
        df_resultados_simulacion (pd.DataFrame): DataFrame con los resultados de la simulación,
                                                debe contener 'prd', 'stock_real_hoy', 'stock_esperado_hoy'.
        pesos (dict, optional): Diccionario de pesos para cada componente del costo.
                                Por defecto: {'volatilidad_prd': 0.4, 'desviacion_stock': 0.4, 'penalizacion_rango_stock': 0.2}.
        normalization_method (str): Método de normalización a aplicar ('min_max', 'z_score', 'none').

    Returns:
        float: El costo combinado de la simulación.
    """
    if pesos is None:
        pesos = {
            'volatilidad_prd': 0.4,
            'desviacion_stock': 0.4,
            'penalizacion_rango_stock': 0.2
        }

    # --- 1. Volatilidad del PRD (raw) ---
    raw_volatilidad_prd = df_resultados_simulacion['prd'].std()
    
    # --- 2. Desviación del Stock (MAE) (raw) ---
    raw_desviacion_stock = mean_absolute_error(
        df_resultados_simulacion['stock_real_hoy'],
        df_resultados_simulacion['stock_esperado_hoy']
    )
    
    # --- 3. Penalización por Rango de Stock (raw) ---
    stock_tolerance_pct = 0.10 
    lower_bound = df_resultados_simulacion['stock_esperado_hoy'] * (1 - stock_tolerance_pct)
    upper_bound = df_resultados_simulacion['stock_esperado_hoy'] * (1 + stock_tolerance_pct)
    
    out_of_range_lower = df_resultados_simulacion['stock_real_hoy'] < lower_bound
    out_of_range_upper = df_resultados_simulacion['stock_real_hoy'] > upper_bound
    
    penalty_lower = (lower_bound - df_resultados_simulacion['stock_real_hoy'][out_of_range_lower]).sum()
    penalty_upper = (df_resultados_simulacion['stock_real_hoy'][out_of_range_upper] - upper_bound[out_of_range_upper]).sum()
    
    raw_penalizacion_rango_stock = penalty_lower + penalty_upper
    
    if df_resultados_simulacion['stock_esperado_hoy'].mean() > 0:
        raw_penalizacion_rango_stock /= df_resultados_simulacion['stock_esperado_hoy'].mean()
    else:
        raw_penalizacion_rango_stock = 0

    # --- Normalización de Componentes ---
    volatilidad_prd_norm = raw_volatilidad_prd
    desviacion_stock_norm = raw_desviacion_stock
    penalizacion_rango_stock_norm = raw_penalizacion_rango_stock

    if normalization_method == 'min_max':
        volatilidad_prd_norm = _normalizar_componente(raw_volatilidad_prd, 'min_max', 
                                                      {'max_val': MAX_TOLERABLE_VOLATILIDAD_PRD})
        desviacion_stock_norm = _normalizar_componente(raw_desviacion_stock, 'min_max', 
                                                       {'max_val': MAX_TOLERABLE_DESVIACION_STOCK})
        penalizacion_rango_stock_norm = _normalizar_componente(raw_penalizacion_rango_stock, 'min_max', 
                                                               {'max_val': MAX_TOLERABLE_PENALIZACION_RANGO_STOCK})
        # Asegurarse de que los valores normalizados no sean negativos (si el valor raw es menor que min_val=0)
        volatilidad_prd_norm = max(0, volatilidad_prd_norm)
        desviacion_stock_norm = max(0, desviacion_stock_norm)
        penalizacion_rango_stock_norm = max(0, penalizacion_rango_stock_norm)
        
    elif normalization_method == 'z_score':
        # ADVERTENCIA: Para una optimización robusta, mean_val y std_val deberían ser pre-calculados
        # sobre un dataset de referencia grande, no sobre los resultados de la simulación actual.
        # Aquí se calculan dinámicamente para demostración.
        mean_vol = df_resultados_simulacion['prd'].mean()
        std_vol = df_resultados_simulacion['prd'].std()
        mean_dev = df_resultados_simulacion['stock_real_hoy'].mean() - df_resultados_simulacion['stock_esperado_hoy'].mean()
        std_dev = (df_resultados_simulacion['stock_real_hoy'] - df_resultados_simulacion['stock_esperado_hoy']).std()
        
        # Para penalizacion_rango_stock, usaremos un promedio de su valor en la simulación
        # Esto es una simplificación para la demostración
        mean_pen = raw_penalizacion_rango_stock # Usamos el valor ya calculado
        std_pen = 0.1 # Asumimos una pequeña desviación estándar para la demostración
        
        volatilidad_prd_norm = _normalizar_componente(raw_volatilidad_prd, 'z_score', 
                                                      {'mean_val': mean_vol, 'std_val': std_vol})
        desviacion_stock_norm = _normalizar_componente(raw_desviacion_stock, 'z_score', 
                                                       {'mean_val': mean_dev, 'std_val': std_dev})
        penalizacion_rango_stock_norm = _normalizar_componente(raw_penalizacion_rango_stock, 'z_score', 
                                                               {'mean_val': mean_pen, 'std_val': std_pen})
        # Para Z-score, los valores pueden ser negativos, lo cual es aceptable.
        
    # --- Costo Combinado ---
    costo_total = (pesos['volatilidad_prd'] * volatilidad_prd_norm) + \
                  (pesos['desviacion_stock'] * desviacion_stock_norm) + \
                  (pesos['penalizacion_rango_stock'] * penalizacion_rango_stock_norm)

    print(f"\n--- Evaluación de Costo de la Simulación (Método: {normalization_method}) ---")
    print(f"  Volatilidad PRD (Raw):        {raw_volatilidad_prd:,.2f} -> Normalizado: {volatilidad_prd_norm:,.2f}")
    print(f"  Desviación Stock (Raw MAE):   {raw_desviacion_stock:,.2f} -> Normalizado: {desviacion_stock_norm:,.2f}")
    print(f"  Penalización Rango Stock (Raw): {raw_penalizacion_rango_stock:,.2f} -> Normalizado: {penalizacion_rango_stock_norm:,.2f}")
    print(f"  Costo Total Combinado:        {costo_total:,.2f}")
    
    return costo_total

if __name__ == "__main__":
    # Ejemplo de uso (simulado)
    print("Ejecutando ejemplo de cálculo de costo...")
    
    # Crear un DataFrame de resultados simulados
    fechas = pd.date_range(start='2025-01-01', periods=30, freq='D')
    df_ejemplo = pd.DataFrame({
        'prd': np.random.normal(loc=500000, scale=10000, size=30),
        'stock_real_hoy': np.random.normal(loc=300000, scale=50000, size=30),
        'stock_esperado_hoy': np.random.normal(loc=300000, scale=10000, size=30)
    }, index=fechas)
    
    print("\n--- Sin Normalización ---")
    costo_none = calcular_costo(df_ejemplo, normalization_method='none')
    print(f"\nCosto de ejemplo (sin normalización): {costo_none:,.2f}")

    print("\n--- Con Normalización Min-Max ---")
    costo_min_max = calcular_costo(df_ejemplo, normalization_method='min_max')
    print(f"\nCosto de ejemplo (Min-Max): {costo_min_max:,.2f}")

    print("\n--- Con Normalización Z-Score ---")
    costo_z_score = calcular_costo(df_ejemplo, normalization_method='z_score')
    print(f"\nCosto de ejemplo (Z-Score): {costo_z_score:,.2f}")
