import pandas as pd
import os
from datetime import datetime, timedelta
import random
import motor_prd_diario # Para obtener el PRD

# --- 1. Definición de Rutas ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# --- 2. Estructura de Órdenes ---
class Order:
    def __init__(self, order_id, order_type, price, quantity, timestamp):
        self.order_id = order_id
        self.order_type = order_type # 'compra' o 'venta'
        self.price = price
        self.quantity = quantity
        self.timestamp = timestamp
        self.deviation_from_prd = None # Se calculará después

    def __repr__(self):
        return f"Order(ID:{self.order_id}, Tipo:{self.order_type}, Precio:{self.price}, Cantidad:{self.quantity}, PRD_Dev:{self.deviation_from_prd:.2f})"

# --- 3. Generar Órdenes de Ejemplo ---
def generate_sample_orders(num_orders, prd_actual, date_for_orders):
    orders = []
    for i in range(num_orders):
        order_id = f"ORD{i+1}"
        order_type = random.choice(['compra', 'venta'])
        
        # Generar precios alrededor del PRD con cierta dispersión
        price_deviation = random.uniform(-0.10, 0.10) # +/- 10% del PRD
        price = prd_actual * (1 + price_deviation)
        price = round(price, 2) # Redondear a 2 decimales

        quantity = random.randint(100, 1000) # Cantidades aleatorias
        timestamp = date_for_orders + timedelta(hours=random.randint(9,17), minutes=random.randint(0,59))
        
        new_order = Order(order_id, order_type, price, quantity, timestamp)
        new_order.deviation_from_prd = abs(new_order.price - prd_actual) # Calcular aquí
        orders.append(new_order)
    
    return orders

# --- 4. Algoritmo de Matching con Priorización por PRD ---
def ejecutar_matching(all_orders, prd_actual):
    print(f"\n--- Ejecutando Matching para PRD: ${prd_actual:,.2f} ---")
    
    buy_orders = [o for o in all_orders if o.order_type == 'compra']
    sell_orders = [o for o in all_orders if o.order_type == 'venta']

    # Las desviaciones del PRD ya están calculadas en generate_sample_orders
    # No es necesario recalcular aquí.

    # Priorizar órdenes:
    # Compras: Mayor precio, luego menor desviación del PRD
    buy_orders.sort(key=lambda x: (-x.price, x.deviation_from_prd))
    # Ventas: Menor precio, luego menor desviación del PRD
    sell_orders.sort(key=lambda x: (x.price, x.deviation_from_prd))

    matched_trades = []
    
    # Bucle de matching
    while buy_orders and sell_orders:
        best_buy = buy_orders[0]
        best_sell = sell_orders[0]

        if best_buy.price >= best_sell.price:
            # Hay un match!
            trade_price = (best_buy.price + best_sell.price) / 2 # Precio de ejecución promedio
            trade_quantity = min(best_buy.quantity, best_sell.quantity)

            matched_trades.append({
                'buy_order_id': best_buy.order_id,
                'sell_order_id': best_sell.order_id,
                'price': trade_price,
                'quantity': trade_quantity,
                'timestamp': datetime.now() # Timestamp de ejecución
            })

            # Ajustar cantidades o remover órdenes
            best_buy.quantity -= trade_quantity
            best_sell.quantity -= trade_quantity

            if best_buy.quantity == 0:
                buy_orders.pop(0)
            if best_sell.quantity == 0:
                sell_orders.pop(0)
        else:
            # No hay match al precio actual, intentar con la siguiente mejor orden
            # Esto es una simplificación. En un motor real, la lógica es más compleja.
            # Aquí, si la mejor compra no puede igualar la mejor venta, asumimos que no hay más matches
            # con estas órdenes específicas.
            break 
            
    return matched_trades, buy_orders, sell_orders

# --- Punto de Entrada del Script ---
if __name__ == "__main__":
    print("="*70)
    print("== SIMULADOR DE MOTOR DE MATCHING DE TRANSACCIONES ==")
    print("="*70)

    # 1. Obtener un PRD de ejemplo
    # Usaremos una fecha de backtesting para obtener un PRD calculado
    fecha_simulacion = datetime(2025, 1, 15).date()
    prd_data = motor_prd_diario.calcular_prd_diario(fecha_simulacion)
    
    if prd_data is None:
        print("ERROR: No se pudo obtener el PRD para la simulación de matching.")
        exit()
        
    prd_actual = prd_data['prd']
    print(f"\nPRD Obtenido para {fecha_simulacion}: ${prd_actual:,.2f}")

    # 2. Generar órdenes de ejemplo
    num_sample_orders = 20
    all_orders = generate_sample_orders(num_sample_orders, prd_actual, fecha_simulacion)
    
    print("\n--- Órdenes Generadas (antes de matching) ---")
    for order in all_orders:
        print(order)

    # 3. Ejecutar el algoritmo de matching
    matched_trades, remaining_buy, remaining_sell = ejecutar_matching(all_orders, prd_actual)

    print("\n--- Operaciones Emparejadas ---")
    if matched_trades:
        for trade in matched_trades:
            print(f"  Compra ID: {trade['buy_order_id']}, Venta ID: {trade['sell_order_id']}, Precio: ${trade['price']:,.2f}, Cantidad: {trade['quantity']}")
    else:
        print("  No se encontraron operaciones emparejadas.")

    print("\n--- Órdenes de Compra Pendientes ---")
    if remaining_buy:
        for order in remaining_buy:
            print(order)
    else:
        print("  No hay órdenes de compra pendientes.")

    print("\n--- Órdenes de Venta Pendientes ---")
    if remaining_sell:
        for order in remaining_sell:
            print(order)
    else:
        print("  No hay órdenes de venta pendientes.")

    print("\n¡Simulación de Matching Completada!")
