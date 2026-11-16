import pandas as pd
import os
from datetime import datetime, timedelta
import random
import motor_prd_diario # Para obtener el PRD y comisiones dinámicas

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
        return f"Order(ID:{self.order_id}, Tipo:{self.order_type:6s}, Precio:${self.price:>9,.2f}, Cantidad:{self.quantity:>4d}, Desvio_PRD:{self.deviation_from_prd:>7.2f})"

# --- 3. Generar Órdenes de Ejemplo ---
def generate_sample_orders(num_orders, prd_actual, date_for_orders):
    orders = []
    for i in range(num_orders):
        order_id = f"ORD{i+1:02d}"
        order_type = random.choice(['compra', 'venta'])
        
        # Generar precios alrededor del PRD con cierta dispersión (+/- 8%)
        price_deviation = random.uniform(-0.08, 0.08)
        price = prd_actual * (1 + price_deviation)
        price = round(price, 2)

        quantity = random.randint(100, 800) # Bolsas de azúcar
        timestamp = date_for_orders + timedelta(hours=random.randint(9,17), minutes=random.randint(0,59))
        
        new_order = Order(order_id, order_type, price, quantity, timestamp)
        new_order.deviation_from_prd = abs(new_order.price - prd_actual)
        orders.append(new_order)
    
    return orders

# --- 4. Algoritmo de Matching con Priorización por PRD y Comisiones Dinámicas ---
def ejecutar_matching(all_orders, prd_actual):
    print(f"\n--- Ejecutando Motor de Calce con PRD de Referencia: ${prd_actual:,.2f} / bolsa ---")
    
    buy_orders = [o for o in all_orders if o.order_type == 'compra']
    sell_orders = [o for o in all_orders if o.order_type == 'venta']

    # Priorizar órdenes:
    # Compras: Mayor precio dispuesto a pagar, luego menor desviación del PRD
    buy_orders.sort(key=lambda x: (-x.price, x.deviation_from_prd))
    # Ventas: Menor precio exigido, luego menor desviación del PRD
    sell_orders.sort(key=lambda x: (x.price, x.deviation_from_prd))

    matched_trades = []
    
    # Bucle de matching atómico
    while buy_orders and sell_orders:
        best_buy = buy_orders[0]
        best_sell = sell_orders[0]

        if best_buy.price >= best_sell.price:
            # Hay un match de mercado
            trade_price = (best_buy.price + best_sell.price) / 2.0 # Precio de ejecución intermedio
            trade_quantity = min(best_buy.quantity, best_sell.quantity)
            valor_bruto = trade_price * trade_quantity
            
            # --- CÁLCULO DE COMISIONES DINÁMICAS BASADAS EN EL PRD ---
            info_comision = motor_prd_diario.calcular_comisiones_dinamicas(trade_price, prd_actual, k_adj=0.5)
            tasa_v = info_comision['tasa_vendedor_pct'] / 100.0
            tasa_c = info_comision['tasa_comprador_pct'] / 100.0
            
            comision_vendedor = valor_bruto * tasa_v
            comision_comprador = valor_bruto * tasa_c
            comision_plataforma = comision_vendedor + comision_comprador

            matched_trades.append({
                'buy_order_id': best_buy.order_id,
                'sell_order_id': best_sell.order_id,
                'price': trade_price,
                'quantity': trade_quantity,
                'valor_bruto': valor_bruto,
                'desvio_prd_pct': info_comision['desviacion_respecto_prd_pct'],
                'tasa_vendedor_pct': info_comision['tasa_vendedor_pct'],
                'tasa_comprador_pct': info_comision['tasa_comprador_pct'],
                'comision_vendedor': comision_vendedor,
                'comision_comprador': comision_comprador,
                'comision_plataforma': comision_plataforma,
                'neto_vendedor': valor_bruto - comision_vendedor,
                'total_comprador': valor_bruto + comision_comprador,
                'timestamp': datetime.now()
            })

            # Ajustar remanentes
            best_buy.quantity -= trade_quantity
            best_sell.quantity -= trade_quantity

            if best_buy.quantity == 0:
                buy_orders.pop(0)
            if best_sell.quantity == 0:
                sell_orders.pop(0)
        else:
            break 
            
    return matched_trades, buy_orders, sell_orders

# --- 5. Punto de Entrada del Simulador ---
if __name__ == "__main__":
    print("="*85)
    print("== SIMULADOR DE MOTOR DE MATCHING CON COMISIONES DINÁMICAS VINCULADAS AL PRD ==")
    print("="*85)

    # 1. Obtener PRD oficial
    fecha_simulacion = datetime(2025, 1, 15).date()
    prd_data = motor_prd_diario.calcular_prd_diario(fecha_simulacion)
    
    if prd_data is None:
        print("ERROR: No se pudo obtener el PRD para la simulación de matching.")
        exit()
        
    prd_actual = prd_data['prd']
    print(f"\n>> PRD Oficial de Referencia Dinámico: ${prd_actual:,.2f} / bolsa de 50 kg")

    # 2. Generar órdenes de mercado de prueba
    num_sample_orders = 16
    random.seed(42) # Reproducibilidad
    all_orders = generate_sample_orders(num_sample_orders, prd_actual, fecha_simulacion)
    
    print("\n--- [1] Libro de Órdenes Inicial (Dispersión respecto al PRD) ---")
    for order in all_orders:
        print(f"  {order}")

    # 3. Ejecutar el matching con cálculo de comisiones dinámicas
    matched_trades, remaining_buy, remaining_sell = ejecutar_matching(all_orders, prd_actual)

    print("\n" + "="*85)
    print("  [2] OPERACIONES CALZADAS Y RECAUDACIÓN DE COMISIONES DINÁMICAS")
    print("="*85)
    if matched_trades:
        total_volumen = 0
        total_monto = 0.0
        total_comisiones = 0.0
        
        for i, trade in enumerate(matched_trades, 1):
            total_volumen += trade['quantity']
            total_monto += trade['valor_bruto']
            total_comisiones += trade['comision_plataforma']
            
            print(f"  Calce #{i:02d}: {trade['buy_order_id']} (Comprador) <---> {trade['sell_order_id']} (Vendedor)")
            print(f"    • Precio Ejecución:    ${trade['price']:>10,.2f} / bolsa (Desvío vs PRD: {trade['desvio_prd_pct']:+.2f}%)")
            print(f"    • Cantidad Calzada:     {trade['quantity']:>10d} bolsas  (Monto Bruto: ${trade['valor_bruto']:,.2f})")
            print(f"    • Comisión Vendedor:    {trade['tasa_vendedor_pct']:>9.2f}% (${trade['comision_vendedor']:,.2f}) --> Neto a Cobrar: ${trade['neto_vendedor']:,.2f}")
            print(f"    • Comisión Comprador:   {trade['tasa_comprador_pct']:>9.2f}% (${trade['comision_comprador']:,.2f}) --> Total a Pagar:  ${trade['total_comprador']:,.2f}")
            print(f"    • Recaudación Plataforma: ${trade['comision_plataforma']:,.2f} ({(trade['comision_plataforma']/trade['valor_bruto'])*100:.2f}% sobre el monto)")
            print("    " + "-"*65)
            
        print("\n  RESUMEN TOTAL DE LA RUEDA DE MATCHING:")
        print(f"    >> Volumen Total Negociado:     {total_volumen:>10,d} bolsas ({(total_volumen*50)/1000:,.1f} Toneladas)")
        print(f"    >> Monto Transaccionado:        ${total_monto:>12,.2f} ARS")
        print(f"    >> Comisiones Totales Agro-IA:  ${total_comisiones:>12,.2f} ARS ({(total_comisiones/total_monto)*100:.2f}% promedio)")
    else:
        print("  No se encontraron operaciones calzadas.")

    print("\n--- [3] Órdenes Pendientes en el Libro ---")
    print(f"  • Compras Pendientes: {len(remaining_buy)}")
    for o in remaining_buy:
        print(f"    - {o}")
    print(f"  • Ventas Pendientes:  {len(remaining_sell)}")
    for o in remaining_sell:
        print(f"    - {o}")

    print("\n✓ Simulación de Matching y Comisiones Dinámicas completada con éxito.")
