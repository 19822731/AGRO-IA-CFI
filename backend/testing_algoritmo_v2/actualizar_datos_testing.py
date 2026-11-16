import investpy
import yfinance as yf
import pandas as pd
import os
import time
import sys
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

# Agregar directorio padre al path para importar modelos y base de datos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import SessionLocal
import models

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
        'nombre_investpy': 'White Sugar',
        'pais_investpy': 'united kingdom',
        'ticker_yfinance': 'SW=F', # White Sugar Futures (London)
        'db_tipo_precio': 'contrato_5' # Etiqueta para la BD
    },
    {
        'archivo': 'Futuros azúcar Nº11 EE.UU.csv',
        'tipo': 'commodity',
        'nombre_investpy': 'US Sugar #11',
        'pais_investpy': 'united states',
        'ticker_yfinance': 'SB=F', # Sugar #11 Futures (US)
        'db_tipo_precio': 'contrato_11' # Etiqueta para la BD
    },
    {
        'archivo': 'USD_ARS.csv',
        'tipo': 'currency_cross',
        'nombre_investpy': 'USD/ARS',
        'pais_investpy': None,
        'ticker_yfinance': 'ARS=X',
        'db_tipo_precio': 'usd_ars'
    },
    {
        'archivo': 'USD_BRL.csv',
        'tipo': 'currency_cross',
        'nombre_investpy': 'USD/BRL',
        'pais_investpy': None,
        'ticker_yfinance': 'BRL=X',
        'db_tipo_precio': 'usd_brl'
    },
    # ... otros activos (se pueden agregar db_tipo_precio si se necesitan en el dashboard)
]

# --- FIN DE LA CONFIGURACIÓN ---

def guardar_en_bd(df, tipo_precio):
    """Guarda los datos del DataFrame en la base de datos."""
    if df is None or df.empty:
        return

    db: Session = SessionLocal()
    try:
        print(f"💾 Guardando {len(df)} registros en BD para '{tipo_precio}'...")
        count = 0
        for index, row in df.iterrows():
            fecha = index.to_pydatetime() if isinstance(index, pd.Timestamp) else pd.to_datetime(index).to_pydatetime()
            
            # Verificar si ya existe el registro
            existe = db.query(models.PrecioHistorico).filter(
                models.PrecioHistorico.fecha == fecha,
                models.PrecioHistorico.tipo_precio == tipo_precio
            ).first()
            
            if not existe:
                # Asumimos que la columna de precio es 'Close' o la primera columna numérica
                precio = row.get('Close') if 'Close' in row else row.iloc[0]
                
                nuevo_precio = models.PrecioHistorico(
                    fecha=fecha,
                    precio=precio,
                    tipo_precio=tipo_precio
                )
                db.add(nuevo_precio)
                count += 1
        
        db.commit()
        print(f"✅ Se insertaron {count} nuevos registros en la BD.")
    except Exception as e:
        print(f"❌ Error al guardar en BD: {e}")
        db.rollback()
    finally:
        db.close()

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
            
            # GUARDAR EN BD
            if 'db_tipo_precio' in activo_config:
                guardar_en_bd(df_nuevos, activo_config['db_tipo_precio'])

        else:
            print(f"No se encontraron datos nuevos para '{activo_config['nombre_investpy']}'.")

    except Exception as e:
        print(f"⚠️ ERROR con investpy para '{activo_config['nombre_investpy']}': {e}")
        
        # FALLBACK A YFINANCE
        ticker_yf = activo_config.get('ticker_yfinance')
        if ticker_yf:
            print(f"🔄 Intentando fallback con yfinance para '{ticker_yf}'...")
            try:
                # Convertir fechas a formato YYYY-MM-DD para yfinance
                start_date_yf = datetime.strptime(fecha_inicio_str, '%d/%m/%Y').strftime('%Y-%m-%d')
                end_date_yf = datetime.strptime(fecha_fin_str, '%d/%m/%Y').strftime('%Y-%m-%d')
                
                df_nuevos = yf.download(ticker_yf, start=start_date_yf, end=end_date_yf, progress=False)
                
                if df_nuevos is not None and not df_nuevos.empty:
                    # yfinance devuelve MultiIndex en columnas a veces, aplanamos si es necesario
                    if isinstance(df_nuevos.columns, pd.MultiIndex):
                         df_nuevos.columns = df_nuevos.columns.get_level_values(0)
                    
                    # Renombrar columnas para mantener consistencia si es necesario, 
                    # pero por ahora solo guardamos. Investpy suele dar 'Close', YF también.
                    df_nuevos.index.name = 'Date'
                    
                    # Guardar
                    df_nuevos.to_csv(ruta_destino_test, mode='w', header=True)
                    print(f"✅ ¡Éxito con yfinance! Se guardaron {len(df_nuevos)} filas nuevas en '{ruta_destino_test}'.")
                    
                    # GUARDAR EN BD
                    if 'db_tipo_precio' in activo_config:
                        guardar_en_bd(df_nuevos, activo_config['db_tipo_precio'])

                else:
                    print(f"❌ FALLO fallback: Datos vacíos para '{ticker_yf}' en yfinance.")
            except Exception as eyf:
                print(f"❌ ERROR CRÍTICO en fallback yfinance: {eyf}")
        else:
            print(f"❌ No hay ticker de yfinance configurado para este activo.")


if __name__ == '__main__':
    # Crear el directorio de testing si no existe
    os.makedirs(DIRECTORIO_TEST, exist_ok=True)
    
    print(f"--- Iniciando proceso de actualización ---")
    print(f"Los archivos originales en '{DIRECTORIO_HISTORICO}' no serán modificados.")
    print(f"Los nuevos datos se guardarán en '{DIRECTORIO_TEST}' y en la BASE DE DATOS.")
    
    for activo in activos_a_actualizar:
        print("-" * 60)
        obtener_nuevos_datos(activo)
        print(f"Pausa de {PAUSA_ENTRE_SOLICITUDES} segundos...")
        time.sleep(PAUSA_ENTRE_SOLICITUDES)
    
    print("-" * 60)
    print("--- Proceso de actualización finalizado. ---")
    print(f"\nRevisa los archivos generados en la carpeta '{DIRECTORIO_TEST}'.")
