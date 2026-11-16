import pytest
from src.optimization_engine import OptimizationEngine

@pytest.fixture
def optimization_engine_instance():
    return OptimizationEngine()

def test_calculate_dynamic_exportable_balance(optimization_engine_instance):
    # Escenario de superávit
    delta_s_positive = optimization_engine_instance.calculate_dynamic_exportable_balance(
        predicted_production=1000,
        predicted_consumption=500,
        current_stock=2000,
        strategic_internal_stock=1000
    )
    assert delta_s_positive == 1500.0 # 2000 + 1000 - 500 - 1000 = 1500

    # Escenario de escasez
    delta_s_negative = optimization_engine_instance.calculate_dynamic_exportable_balance(
        predicted_production=100,
        predicted_consumption=500,
        current_stock=200,
        strategic_internal_stock=1000
    )
    assert delta_s_negative == -1200.0 # 200 + 100 - 500 - 1000 = -1200

    # Escenario equilibrado
    delta_s_zero = optimization_engine_instance.calculate_dynamic_exportable_balance(
        predicted_production=500,
        predicted_consumption=500,
        current_stock=1000,
        strategic_internal_stock=1000
    )
    assert delta_s_zero == 0.0 # 1000 + 500 - 500 - 1000 = 0

def test_optimize_sales_strategy(optimization_engine_instance):
    # Escenario con excedente
    strategy_surplus = optimization_engine_instance.optimize_sales_strategy(
        predicted_production=1000,
        predicted_consumption=500,
        current_stock=2000,
        strategic_internal_stock=1000,
        market_price_internal=100,
        market_price_export=90
    )
    assert strategy_surplus['internal_sales'] == 500 # Cubre consumo interno
    assert strategy_surplus['export_sales'] == 1500 # Exporta el excedente
    assert strategy_surplus['total_value'] == (500 * 100) + (1500 * 90)

    # Escenario con déficit
    strategy_deficit = optimization_engine_instance.optimize_sales_strategy(
        predicted_production=100,
        predicted_consumption=500,
        current_stock=200,
        strategic_internal_stock=1000,
        market_price_internal=100,
        market_price_export=90
    )
    assert strategy_deficit['internal_sales'] == 500
    assert strategy_deficit['export_sales'] == 0 # No hay exportación si hay déficit
    assert strategy_deficit['total_value'] == (500 * 100) + (0 * 90)
