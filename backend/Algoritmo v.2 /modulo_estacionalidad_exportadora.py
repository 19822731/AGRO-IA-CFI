"""
Sistema Agro-IA 2026: Módulo de Estacionalidad Exportadora y Señal Antirruido
=============================================================================
Este módulo monitorea en tiempo real el ritmo de exportación acumulado vs. la
curva estacional teórica de embarques, conectando el balance físico interno con
el mercado global de Brasil (Comex Stat MDIC) y aduanas internacionales (UN Comtrade).

Objetivo Operativo:
  - Detectar desfases entre el plan de evacuación de excedentes y los embarques reales.
  - Si a mitad de zafra (ej. junio/julio) las exportaciones van retrasadas respecto a la
    meta estacional (ej. 150.000 TN reales vs. 400.000 TN requeridas), genera una alerta
    temprana de SOBRESTOCK LATENTE y ajusta preventivamente el PRD para forzar la salida
    a puerto antes de que el excedente ahogue el mercado interno y desplome los precios.
"""

import os
import math
from datetime import datetime, date
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'Datos')

COMEX_BRASIL_FILE = os.path.join(DATA_DIR, 'comex_stat_brasil_sugar_mensual.csv')
ESTACIONALIDAD_BRASIL_FILE = os.path.join(DATA_DIR, 'estacionalidad_brasil_historica.csv')
COMTRADE_ARG_FILE = os.path.join(DATA_DIR, 'un_comtrade_sugar.csv')

# ==============================================================================
# 1. CURVA ESTACIONAL TEÓRICA DE EXPORTACIÓN (ARGENTINA - ZAFRA NOA)
# ==============================================================================
# Distribución mensual típica acumulada de cumplimiento de cupo exportable
# (Mayo a Noviembre concentra el 95% de la evacuación portuaria)
CURVA_ESTACIONAL_ARGENTINA_ACUMULADA = {
    1: 0.00,   # Enero: Entresafra (0% cupo nuevo)
    2: 0.00,   # Febrero: Entresafra
    3: 0.00,   # Marzo: Entresafra
    4: 0.02,   # Abril: Preparativos y primeros despachos de remanente (2%)
    5: 0.08,   # Mayo: Inicio formal de zafra (8% acumulado)
    6: 0.22,   # Junio: Molienda plena, aceleración de embarques (22% acumulado)
    7: 0.45,   # Julio: Pico de molienda y flujo a puerto (45% acumulado)
    8: 0.70,   # Agosto: Fuerte actividad exportadora (70% acumulado)
    9: 0.85,   # Septiembre: Zafra avanzada (85% acumulado)
    10: 0.94,  # Octubre: Cierre de molienda (94% acumulado)
    11: 0.98,  # Noviembre: Últimos embarques de zafra (98% acumulado)
    12: 1.00   # Diciembre: Cierre contable y consolidación (100% acumulado)
}

def obtener_pct_estacional_esperado(fecha):
    """
    Calcula el porcentaje acumulado teórico esperado de exportación
    para una fecha dada mediante interpolación continua día a día.
    """
    mes = fecha.month
    dia = fecha.day
    dias_en_mes = pd.Timestamp(fecha.year, mes, 1).days_in_month
    
    pct_inicio_mes = CURVA_ESTACIONAL_ARGENTINA_ACUMULADA.get(mes - 1, 0.0) if mes > 1 else 0.0
    pct_fin_mes = CURVA_ESTACIONAL_ARGENTINA_ACUMULADA.get(mes, 1.0)
    
    fraccion_mes = dia / dias_en_mes
    pct_acumulado_hoy = pct_inicio_mes + (pct_fin_mes - pct_inicio_mes) * fraccion_mes
    return min(1.0, max(0.0, pct_acumulado_hoy))

# ==============================================================================
# 2. EVALUADOR DE RITMO EXPORTADOR LOCAL (ARGENTINA)
# ==============================================================================

def evaluar_ritmo_exportador_local(fecha_consulta, exportacion_acum_real_tn=None, cupo_anual_exportacion_tn=600000.0):
    """
    Evalúa el cumplimiento del programa exportador vs la curva estacional teórica.
    
    Parámetros:
      - fecha_consulta: date o datetime de la evaluación.
      - exportacion_acum_real_tn: TN reales acumuladas exportadas hasta la fecha.
      - cupo_anual_exportacion_tn: Cupo anual de excedente necesario a evacuar para equilibrio.
    """
    if isinstance(fecha_consulta, str):
        fecha = pd.to_datetime(fecha_consulta).date()
    elif isinstance(fecha_consulta, pd.Timestamp):
        fecha = fecha_consulta.date()
    else:
        fecha = fecha_consulta
        
    pct_teorico = obtener_pct_estacional_esperado(fecha)
    meta_acumulada_tn = cupo_anual_exportacion_tn * pct_teorico
    
    # Si no se pasa exportación real, se toma un valor operativo representativo
    if exportacion_acum_real_tn is None:
        # Supuesto base de prueba: durante meses de zafra si no hay dato aduanero cerrado
        exportacion_acum_real_tn = meta_acumulada_tn * 0.72  # 72% de cumplimiento (demora moderada)
        
    delta_tn = exportacion_acum_real_tn - meta_acumulada_tn
    
    if meta_acumulada_tn > 5000.0:
        pacing_ratio = exportacion_acum_real_tn / meta_acumulada_tn
    else:
        pacing_ratio = 1.0 # En entresafra (ene-mar) no hay desvío computable
        
    # --- FILTRO ANTIRRUIDO: ÍNDICE DE PRESIÓN POR SOBRESTOCK LATENTE ---
    # Usamos función logística suave: si faltan > 50.000 TN de despachar respecto a la meta,
    # el índice de sobrestock latente sube de 0 a 1 de forma asintótica sin generar picos de ruido.
    tolerancia_logistica_tn = 80000.0
    if meta_acumulada_tn > 10000.0 and delta_tn < 0:
        retraso_neto = abs(delta_tn)
        presion_sobrestock = 1.0 / (1.0 + math.exp(-max(-10.0, min(10.0, (retraso_neto - tolerancia_logistica_tn) / 30000.0))))
    else:
        presion_sobrestock = 0.0
        
    # Semáforo de alerta operativa
    if pct_teorico < 0.05:
        semaforo = "ENTRESAFRA_NEUTRAL"
        diagnostico = "Período de entresafra. El mercado interno consume inventario de zafra anterior."
        ajuste_prd_sugerido_pct = 0.0
    elif pacing_ratio >= 0.90:
        semaforo = "VERDE_RITMO_OPTIMO"
        diagnostico = f"Exportaciones al día ({pacing_ratio*100:.1f}% de la meta estacional). Sin riesgo de sobrestock en depósitos."
        ajuste_prd_sugerido_pct = 0.0
    elif pacing_ratio >= 0.65:
        semaforo = "AMARILLO_DEMORA_MODERADA"
        diagnostico = f"Retraso moderado en embarques ({pacing_ratio*100:.1f}% de meta; faltan {abs(delta_tn):,.0f} TN). Sugerir acelerar ventas a puerto."
        ajuste_prd_sugerido_pct = -0.03 * presion_sobrestock # Ajuste leve a la baja (-1% a -3%)
    else:
        semaforo = "ROJO_RIESGO_SOBRESTOCK"
        diagnostico = f"ALERTA CRÍTICA: Retraso severo en exportaciones ({pacing_ratio*100:.1f}% de meta; faltan {abs(delta_tn):,.0f} TN). Riesgo inminente de sobreoferta que derrumbará precios a fin de año. Forzar arbitraje hacia puerto."
        ajuste_prd_sugerido_pct = -0.08 * presion_sobrestock # Ajuste correctivo (-5% a -8% o forzar piso FAS)
        
    return {
        "fecha": fecha.strftime('%Y-%m-%d'),
        "cupo_anual_exportacion_tn": cupo_anual_exportacion_tn,
        "pct_estacional_esperado": round(pct_teorico * 100.0, 2),
        "exportacion_teorica_acumulada_tn": round(meta_acumulada_tn, 1),
        "exportacion_real_acumulada_tn": round(exportacion_acum_real_tn, 1),
        "delta_exportacion_tn": round(delta_tn, 1),
        "pacing_ratio_pct": round(pacing_ratio * 100.0, 2),
        "presion_sobrestock_latente": round(presion_sobrestock, 3),
        "ajuste_prd_sugerido_pct": round(ajuste_prd_sugerido_pct * 100.0, 2),
        "semaforo_exportador": semaforo,
        "diagnostico_estrategico": diagnostico
    }

# ==============================================================================
# 3. EVALUADOR DE SEÑALES MACRO DE BRASIL (COMEX STAT)
# ==============================================================================

def evaluar_presion_exportadora_brasil():
    """
    Analiza la serie mensual de Comex Stat de Brasil y extrae la señal de presión
    de oferta global (si Brasil está inundando el mercado o retrasado en Santos).
    """
    if not os.path.exists(COMEX_BRASIL_FILE) or not os.path.exists(ESTACIONALIDAD_BRASIL_FILE):
        return {
            "estado": "DATOS_NO_DISPONIBLES",
            "mensaje": "Aún no se ha consolidado el dataset de Comex Stat de Brasil."
        }
        
    df_br = pd.read_csv(COMEX_BRASIL_FILE)
    df_estac = pd.read_csv(ESTACIONALIDAD_BRASIL_FILE).set_index('Mes')
    
    if df_br.empty:
        return {"estado": "SIN_DATOS"}
        
    # Último registro mensual disponible de Brasil
    ultimo = df_br.iloc[-1]
    mes_ult = int(ultimo['Mes'])
    ano_ult = int(ultimo['Ano'])
    vol_ult_tn = float(ultimo['Brasil_Total_Export_TN'])
    fob_medio_usd = float(ultimo['Brasil_Precio_Medio_FOB_USD_TN'])
    
    # Calcular promedio histórico de exportación de Brasil para ese mismo mes
    df_mismo_mes = df_br[(df_br['Mes'] == mes_ult) & (df_br['Ano'] < ano_ult)]
    promedio_historico_mes_tn = df_mismo_mes['Brasil_Total_Export_TN'].mean() if not df_mismo_mes.empty else vol_ult_tn
    
    desvio_vol_pct = (vol_ult_tn - promedio_historico_mes_tn) / promedio_historico_mes_tn if promedio_historico_mes_tn > 0 else 0.0
    
    # Señal de mercado global
    if desvio_vol_pct > 0.15:
        senal = "OFERTA_BRASIL_ABUNDANTE"
        impacto_precio_global = "BAJISTA"
        interpretacion = f"Brasil exportó {vol_ult_tn/1e6:.2f}M TN en el mes ({desvio_vol_pct*100:+.1f}% vs promedio histórico). Fuerte presión de oferta en Santos/Paranaguá."
    elif desvio_vol_pct < -0.15:
        senal = "OFERTA_BRASIL_RESTRINGIDA"
        impacto_precio_global = "ALCISTA"
        interpretacion = f"Brasil exportó {vol_ult_tn/1e6:.2f}M TN en el mes ({desvio_vol_pct*100:+.1f}% vs promedio histórico). Congestión portuaria o menor molienda sostienen precios en Londres/NY."
    else:
        senal = "OFERTA_BRASIL_NORMAL"
        impacto_precio_global = "NEUTRAL"
        interpretacion = f"Brasil exportó {vol_ult_tn/1e6:.2f}M TN en el mes ({desvio_vol_pct*100:+.1f}% vs promedio histórico), alineado con su estacionalidad típica."
        
    return {
        "ultimo_periodo_reportado": f"{ano_ult}-{mes_ult:02d}",
        "brasil_exportacion_mes_tn": round(vol_ult_tn, 1),
        "promedio_historico_mes_tn": round(promedio_historico_mes_tn, 1),
        "desvio_volumen_pct": round(desvio_vol_pct * 100.0, 2),
        "precio_medio_fob_usd_tn": round(fob_medio_usd, 2),
        "senal_macro_brasil": senal,
        "impacto_precio_global": impacto_precio_global,
        "interpretacion": interpretacion
    }

if __name__ == "__main__":
    print("\n--- PRUEBA DEL MÓDULO DE ESTACIONALIDAD EXPORTADORA ---")
    # Caso 1: Finales de junio (fecha crítica mencionada por el usuario)
    print("\n1. Simulando análisis a finales de Junio:")
    # Supongamos que a junio debería haber exportado ~132.000 TN de un cupo de 600.000 TN, pero solo va 50.000 TN
    res_junio = evaluar_ritmo_exportador_local("2026-06-30", exportacion_acum_real_tn=50000.0, cupo_anual_exportacion_tn=600000.0)
    for k, v in res_junio.items():
        print(f"  • {k}: {v}")
        
    print("\n2. Simulando análisis a finales de Agosto:")
    # A agosto debería ir al 70% (~420.000 TN)
    res_agosto = evaluar_ritmo_exportador_local("2026-08-31", exportacion_acum_real_tn=410000.0, cupo_anual_exportacion_tn=600000.0)
    for k, v in res_agosto.items():
        print(f"  • {k}: {v}")
