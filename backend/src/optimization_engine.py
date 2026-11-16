"""Módulo para el motor de optimización del marketplace de azúcar.

Este módulo contiene la clase `OptimizationEngine` que se encarga de calcular
el saldo exportable dinámico y optimizar la estrategia de ventas basándose
en las predicciones de producción y consumo, así como en los niveles de stock.
"""

import pandas as pd
import logging

# Configuración básica del logger para este módulo
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class OptimizationEngine:
    """Clase que implementa el cerebro predictivo y optimizador del sistema.

    Se encarga de analizar las predicciones y el estado actual del stock para
    determinar la estrategia óptima de venta (interna vs. exportación) y el
    saldo exportable dinámico.
    """
    def __init__(self):
        """Inicializa una nueva instancia de OptimizationEngine.
        """
        pass

    def calculate_dynamic_exportable_balance(self,
                                              predicted_production: float,
                                              predicted_consumption: float,
                                              current_stock: float,
                                              strategic_internal_stock: float) -> float:
        """Calcula el 'Saldo Exportable Dinámico' del azúcar.

        Este saldo representa la cantidad de azúcar que puede ser destinada a la exportación
        sin comprometer el stock estratégico interno, o la cantidad que se necesita importar
        para alcanzar dicho stock.

        Args:
            predicted_production (float): Producción mensual pronosticada en toneladas métricas (TM).
            predicted_consumption (float): Consumo mensual pronosticado en toneladas métricas (TM).
            current_stock (float): Stock actual de azúcar en toneladas métricas (TM).
            strategic_internal_stock (float): Nivel de stock interno estratégico deseado en TM.

        Returns:
            float: Saldo exportable dinámico en toneladas métricas (TM).
                   Un valor positivo indica excedente, un valor negativo indica déficit.
        """
        # Lógica simplificada por ahora. Esto se expandirá para simular miles de escenarios.
        projected_stock = current_stock + predicted_production - predicted_consumption
        delta_s = projected_stock - strategic_internal_stock

        # Si el stock proyectado es mayor que el estratégico, hay un excedente exportable.
        # Si es menor, el saldo exportable es negativo (necesidad de importar o reducir exportaciones).
        dynamic_exportable_balance = delta_s

        logger.info(f"Stock Proyectado: {projected_stock:.2f} TM")
        logger.info(f"Desviación (ΔS): {delta_s:.2f} TM")
        logger.info(f"Saldo Exportable Dinámico: {dynamic_exportable_balance:.2f} TM")

        return dynamic_exportable_balance

    def optimize_sales_strategy(self,
                                 predicted_production: float,
                                 predicted_consumption: float,
                                 current_stock: float,
                                 strategic_internal_stock: float,
                                 market_price_internal: float,
                                 market_price_export: float) -> dict:
        """Optimiza la combinación de venta interna vs. exportación para maximizar el valor.

        Esta es una versión simplificada que prioriza cubrir el consumo interno y exportar
        el excedente. La implementación real implicaría simulaciones complejas o programación lineal
        para encontrar la combinación óptima.

        Args:
            predicted_production (float): Producción mensual pronosticada en TM.
            predicted_consumption (float): Consumo mensual pronosticado en TM.
            current_stock (float): Stock actual de azúcar en TM.
            strategic_internal_stock (float): Nivel de stock interno estratégico deseado en TM.
            market_price_internal (float): Precio de mercado interno actual por TM.
            market_price_export (float): Precio de mercado de exportación actual por TM.

        Returns:
            dict: Un diccionario que contiene la estrategia óptima:
                  - 'internal_sales' (float): Cantidad de azúcar a vender internamente en TM.
                  - 'export_sales' (float): Cantidad de azúcar a exportar en TM.
                  - 'total_value' (float): Valor total estimado de las ventas.
                  - 'dynamic_exportable_balance' (float): El saldo exportable dinámico calculado.
        """
        dynamic_exportable_balance = self.calculate_dynamic_exportable_balance(
            predicted_production, predicted_consumption, current_stock, strategic_internal_stock
        )

        internal_sales = predicted_consumption # Priorizar cubrir el consumo interno
        export_sales = 0.0

        if dynamic_exportable_balance > 0:
            # Si hay excedente, intentar exportar
            export_sales = dynamic_exportable_balance

        # Aquí se podría añadir lógica más compleja para decidir entre venta interna y exportación
        # basada en precios, costos, etc. Por ejemplo, si el precio de exportación es muy bajo,
        # quizás sea mejor mantener el stock o vender más internamente si hay demanda.

        total_value = (internal_sales * market_price_internal) + (export_sales * market_price_export)

        logger.info(f"Estrategia Óptima (simplificada): Venta Interna = {internal_sales:.2f} TM, Exportación = {export_sales:.2f} TM")
        logger.info(f"Valor Total Estimado: {total_value:.2f}")

        return {
            "internal_sales": internal_sales,
            "export_sales": export_sales,
            "total_value": total_value,
            "dynamic_exportable_balance": dynamic_exportable_balance
        }

if __name__ == '__main__':
    optimizer = OptimizationEngine()

    # Ejemplo de uso
    prod = 1000
    cons = 800
    stock = 500
    strategic_stock = 400
    price_internal = 100
    price_export = 90

    logger.info("\n--- Calculando Saldo Exportable Dinámico ---")
    optimizer.calculate_dynamic_exportable_balance(prod, cons, stock, strategic_stock)

    logger.info("\n--- Optimizando Estrategia de Ventas ---")
    optimizer.optimize_sales_strategy(prod, cons, stock, strategic_stock, price_internal, price_export)
