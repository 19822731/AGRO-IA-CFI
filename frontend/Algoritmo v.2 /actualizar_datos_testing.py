import investpy
import pandas as pd
import os
import time
from datetime import datetime, timedelta

# --- CONFIGURACIÓN PRINCIPAL ---
# Define los directorios y los activos a procesar.

# Directorio donde están los archivos históricos (SOLO LECTURA)
DIRECTORIO_HISTORICO = 'Datos'

# Directorio donde se guardarán los nuevos datos descargados para revisión
DIRECTORIO_TEST = 'datos_actualizados_test'

# Tiempo de espera en segundos entre cada solicitud
PAUSA_ENTRE_SOLICITUDES = 5

# Rango de fechas por defecto para activos sin historial
FECHA_INICIO_HISTORICO = '01/01/2010'

# Lista de activos a actualizar.
# Personaliza esta lista según tus archivos en DIRECTORIO_HISTORICO.
activos_a_actualizar = [
    {
        'archivo': 'Futuros azúcar Nº5 Londres.csv',
        'tipo': 'commodity',
        'nombre_investpy': 'White Sugar', # Corregido: Nombre estándar para el azúcar de Londres
        'pais_investpy': 'united kingdom'
    },
    {
        'archivo': 'Futuros azúcar Nº11 EE.UU.csv',
        'tipo': 'commodity',
        'nombre_investpy': 'US Sugar #11',
        'pais_investpy': 'united states'
    },
    {
        'archivo': 'USD_ARS.csv',
        'tipo': 'currency_cross',
        'nombre_investpy': 'USD/ARS',
        'pais_investpy': None
    },
    {
        'archivo': 'USD_BRL.csv',
        'tipo': 'currency_cross',
        'nombre_investpy': 'USD/BRL',
        'pais_investpy': None
    },
    {
        'archivo': 'Futuros Índice dólar-diciembre(DXZ5).csv',
        'tipo': 'index',
        'nombre_investpy': 'US Dollar Index',
        'pais_investpy': 'united states'
    },
    {
        'archivo': 'Índice dólar(DXY).csv',
        'tipo': 'index',
        'nombre_investpy': 'US Dollar Index',
        'pais_investpy': 'united states'
    },
    {
        'archivo': 'Futuros petróleo crudo WTI.csv',
        'tipo': 'commodity',
        'nombre_investpy': 'Crude Oil WTI',
        'pais_investpy': 'united states'
    },
    {
        'archivo': 'Futuros petróleo Brent.csv',
        'tipo': 'commodity',
        'nombre_investpy': 'Brent Oil',
        'pais_investpy': 'united kingdom'
    },
    {
        'archivo': 'Micro Henry Hub Natural Gas Futures.csv',
        'tipo': 'commodity',
        'nombre_investpy': 'Natural Gas',
        'pais_investpy': 'united states'
    },
    {
        'archivo': 'Dutch TTF Natural Gas Futures.csv',
        'tipo': 'commodity',
        'nombre_investpy': 'Dutch TTF Gas', # Corregido: Nombre más específico
        'pais_investpy': 'netherlands'
    },
    {
        'archivo': 'Futuros etanol.csv',
        'tipo': 'commodity',
        'nombre_investpy': 'Ethanol Futures', # Corregido: Probando con el nombre completo
        'pais_investpy': 'united states'
    }
]

# --- FIN DE LA CONFIGURACIÓN ---


def obtener_nuevos_datos(activo_config):
    """
    Lee el archivo histórico para determinar el rango de fechas,
    descarga los datos nuevos y los guarda en el directorio de testing.
    """
    nombre_archivo = activo_config['archivo']
    ruta_historica = os.path.join(DIRECTORIO_HISTORICO, nombre_archivo)
    ruta_destino_test = os.path.join(DIRECTORIO_TEST, nombre_archivo)
    
    fecha_fin_str = datetime.now().strftime('%d/%m/%Y')
    
    # Determinar la fecha de inicio leyendo el archivo histórico
    if os.path.exists(ruta_historica):
        print(f"Leyendo archivo histórico: '{nombre_archivo}'...")
        try:
            # CORRECCIÓN 2: Manejo de fechas más robusto.
            # 1. Leer el CSV usando la primera columna como índice, pero sin parsear fechas aún.
            df_existente = pd.read_csv(ruta_historica, index_col=0)
            # 2. Forzar la conversión del índice a formato datetime.
            # CORRECCIÓN 3: Añadir dayfirst=True para interpretar correctamente formatos como DD.MM.YYYY
            df_existente.index = pd.to_datetime(df_existente.index, dayfirst=True)
            
            if not df_existente.empty:
                ultima_fecha = df_existente.index.max()
                fecha_inicio = ultima_fecha + timedelta(days=1)
                fecha_inicio_str = fecha_inicio.strftime('%d/%m/%Y')
                print(f"Última fecha: {ultima_fecha.date()}. Se descargarán datos desde {fecha_inicio.date()}.")
            else:
                print("Archivo histórico vacío. Se descargará el historial completo.")
                fecha_inicio_str = FECHA_INICIO_HISTORICO
        except Exception as e:
            print(f"Error al leer o procesar la fecha en '{ruta_historica}': {e}. Se intentará descarga completa.")
            fecha_inicio_str = FECHA_INICIO_HISTORICO
    else:
        print(f"Archivo histórico no encontrado: '{ruta_historica}'. Se descargará historial completo.")
        fecha_inicio_str = FECHA_INICIO_HISTORICO

    # Prevenir descargas innecesarias si los datos ya están al día
    if datetime.strptime(fecha_inicio_str, '%d/%m/%Y') > datetime.now():
        print(f"Los datos para '{nombre_archivo}' ya están actualizados. No se necesita descarga.")
        return

    try:
        print(f"Solicitando datos para '{activo_config['nombre_investpy']}' de {fecha_inicio_str} a {fecha_fin_str}...")
        
        df_nuevos = None
        tipo_activo = activo_config['tipo']
        
        # Llamada a la función de investpy correspondiente
        if tipo_activo == 'commodity':
            df_nuevos = investpy.get_commodity_historical_data(
                commodity=activo_config['nombre_investpy'], country=activo_config['pais_investpy'],
                from_date=fecha_inicio_str, to_date=fecha_fin_str)
        elif tipo_activo == 'currency_cross':
            df_nuevos = investpy.get_currency_cross_historical_data(
                currency_cross=activo_config['nombre_investpy'],
                from_date=fecha_inicio_str, to_date=fecha_fin_str)
        elif tipo_activo == 'index':
            df_nuevos = investpy.get_index_historical_data(
                index=activo_config['nombre_investpy'], country=activo_config['pais_investpy'],
                from_date=fecha_inicio_str, to_date=fecha_fin_str)
        
        if df_nuevos is not None and not df_nuevos.empty:
            df_nuevos.index.name = 'Date'
            # Guardar los datos nuevos en un archivo nuevo en la carpeta de test
            df_nuevos.to_csv(ruta_destino_test, mode='w', header=True)
            print(f"¡Éxito! Se guardaron {len(df_nuevos)} filas nuevas en '{ruta_destino_test}'.")
        else:
            print(f"No se encontraron datos nuevos para '{activo_config['nombre_investpy']}'.")

    except Exception as e:
        print(f"ERROR al descargar o procesar '{activo_config['nombre_investpy']}': {e}")


if __name__ == '__main__':
    # Crear el directorio de testing si no existe
    os.makedirs(DIRECTORIO_TEST, exist_ok=True)
    
    print(f"--- Iniciando proceso de actualización ---")
    print(f"Los archivos originales en '{DIRECTORIO_HISTORICO}' no serán modificados.")
    print(f"Los nuevos datos se guardarán en '{DIRECTORIO_TEST}'.")
    
    for activo in activos_a_actualizar:
        print("-" * 60)
        obtener_nuevos_datos(activo)
        print(f"Pausa de {PAUSA_ENTRE_SOLICITUDES} segundos...")
        time.sleep(PAUSA_ENTRE_SOLICITUDES)
    
    print("-" * 60)
    print("--- Proceso de actualización finalizado. ---")
    print(f"\nRevisa los archivos generados en la carpeta '{DIRECTORIO_TEST}' antes de integrarlos a tus datos históricos.")
