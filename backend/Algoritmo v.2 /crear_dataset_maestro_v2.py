import pandas as pd
import os
import warnings
import investpy
import yfinance as yf
import time
import sys
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

# Ignorar advertencias de pandas
warnings.filterwarnings('ignore')

# Agregar directorio padre al path para importar modelos y base de datos
# Asumiendo que este script está en "Algoritmo v.2 /" y el root está un nivel arriba
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from database import SessionLocal
    import models
except ImportError:
    print("⚠️ No se pudo importar la base de datos. La funcionalidad de guardado en BD no estará disponible.")
    SessionLocal = None

print("Iniciando la creación del Dataset Maestro v3 (Con Descarga y Fallback)...")

# --- 1. Definición de Rutas ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Intentar localizar la carpeta de datos. Puede ser 'DATOS' o 'Datos'
DATA_DIR = os.path.join(BASE_DIR, 'DATOS')
if not os.path.exists(DATA_DIR):
    DATA_DIR = os.path.join(BASE_DIR, 'Datos')
    if not os.path.exists(DATA_DIR):
        # Fallback a la carpeta del otro script si no existe aquí
        DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), 'testing_algoritmo_v2', 'Datos')

print(f"📂 Usando directorio de datos: {DATA_DIR}")
OUTPUT_FILE = os.path.join(DATA_DIR, 'dataset_maestro_COMPLETO.csv')

# --- Funciones de Descarga y BD ---

def guardar_en_bd(df, tipo_precio):
    """Guarda los datos del DataFrame en la base de datos."""
    if df is None or df.empty or SessionLocal is None:
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
                # Intentar obtener precio de varias columnas posibles
                precio = None
                if 'Close' in row: precio = row['Close']
                elif 'Último' in row: precio = row['Último']
                elif 'Price' in row: precio = row['Price']
                else: precio = row.iloc[0] # Fallback a la primera columna
                
                # Limpiar precio si es string
                if isinstance(precio, str):
                    precio = float(precio.replace('.', '').replace(',', '.'))

                if precio is not None:
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

def descargar_datos(config):
    """Descarga datos usando investpy o yfinance."""
    if 'nombre_investpy' not in config and 'ticker_yfinance' not in config:
        return # No es un activo descargable (ej. archivos locales de Brasil)

    nombre_archivo = config['filename']
    ruta_archivo = os.path.join(DATA_DIR, nombre_archivo)
    
    fecha_fin_str = datetime.now().strftime('%d/%m/%Y')
    fecha_inicio_str = '01/01/2010'

    # Determinar fecha inicio
    if os.path.exists(ruta_archivo):
        try:
            df_existente = pd.read_csv(ruta_archivo, index_col=0)
            # Intentar parsear índice
            try:
                df_existente.index = pd.to_datetime(df_existente.index, dayfirst=True)
                ultima_fecha = df_existente.index.max()
                fecha_inicio = ultima_fecha + timedelta(days=1)
                fecha_inicio_str = fecha_inicio.strftime('%d/%m/%Y')
            except:
                pass # Si falla, usa default
        except:
            pass
    
    if datetime.strptime(fecha_inicio_str, '%d/%m/%Y') > datetime.now():
        print(f"  Info: '{nombre_archivo}' ya está actualizado.")
        return

    print(f"  ⬇️ Actualizando '{nombre_archivo}' ({fecha_inicio_str} - {fecha_fin_str})...")
    
    df_nuevos = None
    
    # 1. Intentar Investpy
    if 'nombre_investpy' in config:
        try:
            if config.get('tipo') == 'commodity':
                df_nuevos = investpy.get_commodity_historical_data(commodity=config['nombre_investpy'], country=config.get('pais_investpy'), from_date=fecha_inicio_str, to_date=fecha_fin_str)
            elif config.get('tipo') == 'currency_cross':
                df_nuevos = investpy.get_currency_cross_historical_data(currency_cross=config['nombre_investpy'], from_date=fecha_inicio_str, to_date=fecha_fin_str)
            elif config.get('tipo') == 'index':
                df_nuevos = investpy.get_index_historical_data(index=config['nombre_investpy'], country=config.get('pais_investpy'), from_date=fecha_inicio_str, to_date=fecha_fin_str)
        except Exception as e:
            print(f"    ⚠️ Investpy falló: {e}")

    # 2. Fallback YFinance
    if (df_nuevos is None or df_nuevos.empty) and 'ticker_yfinance' in config:
        print(f"    🔄 Intentando fallback YFinance: {config['ticker_yfinance']}")
        try:
            start_date_yf = datetime.strptime(fecha_inicio_str, '%d/%m/%Y').strftime('%Y-%m-%d')
            end_date_yf = datetime.strptime(fecha_fin_str, '%d/%m/%Y').strftime('%Y-%m-%d')
            df_nuevos = yf.download(config['ticker_yfinance'], start=start_date_yf, end=end_date_yf, progress=False)
            
            if not df_nuevos.empty:
                print(f"    DEBUG: Columnas originales YF: {df_nuevos.columns}")
                if isinstance(df_nuevos.columns, pd.MultiIndex):
                    df_nuevos.columns = df_nuevos.columns.get_level_values(0)
                    print(f"    DEBUG: Columnas aplanadas: {df_nuevos.columns}")
                
        except Exception as e:
             print(f"    ❌ YFinance falló: {e}")

    # 3. Guardar y Actualizar BD
    if df_nuevos is not None and not df_nuevos.empty:
        # Normalizar columnas (aplicar tanto para Investpy como YFinance)
        print(f"    DEBUG: Columnas antes de renombrar: {df_nuevos.columns}")
        if isinstance(df_nuevos.columns, pd.MultiIndex):
            df_nuevos.columns = df_nuevos.columns.get_level_values(0)
        
        rename_map = {}
        if 'Último' in config['cols_to_use']: rename_map['Close'] = 'Último'
        elif 'Price' in config['cols_to_use']: rename_map['Close'] = 'Price'
        elif 'À vista R$' in config['cols_to_use']: rename_map['Close'] = 'À vista R$'
        
        if 'Máximo' in config['cols_to_use']: rename_map['High'] = 'Máximo'
        if 'Mínimo' in config['cols_to_use']: rename_map['Low'] = 'Mínimo'
        
        df_nuevos.rename(columns=rename_map, inplace=True)
        df_nuevos.index.name = config['date_col']
        print(f"    DEBUG: Columnas después de renombrar: {df_nuevos.columns}")

        # Guardar en CSV (append o overwrite)
    # Siempre intentar cargar el archivo completo (o lo que tengamos) a la BD para asegurar consistencia
    if os.path.exists(ruta_archivo) and 'db_tipo_precio' in config:
        try:
            # Leer el archivo completo para insertar en BD
            # Usamos pandas para leer y luego pasar a guardar_en_bd
            # Ojo: guardar_en_bd espera un DataFrame con índice fecha y columna de precio
            
            # Determinar columnas a leer
            cols = [config['date_col']] + config['cols_to_use']
            df_full = pd.read_csv(ruta_archivo, usecols=cols, decimal=config['decimal'], thousands=config.get('thousands'))
            
            # Parsear fecha
            df_full[config['date_col']] = pd.to_datetime(df_full[config['date_col']], format=config['date_format'], errors='coerce')
            df_full.dropna(subset=[config['date_col']], inplace=True)
            df_full.set_index(config['date_col'], inplace=True)
            
            # Renombrar para que guardar_en_bd lo entienda (busca 'Close', 'Último', 'Price')
            # Ya tenemos las columnas originales, guardar_en_bd tiene lógica para buscarlas.
            
            print(f"    💾 Sincronizando BD para '{config['db_tipo_precio']}' desde CSV...")
            guardar_en_bd(df_full, config['db_tipo_precio'])
            
        except Exception as e:
            print(f"    ❌ Error sincronizando BD para {nombre_archivo}: {e}")


# --- 2. Configuración de Archivos (Enriquecida) ---
FILES_CONFIG = [
    # --- Benchmarks Azúcar (Global) ---
    {
        'filename': 'Futuros azúcar Nº11 EE.UU.csv',
        'date_col': 'Fecha', 'date_format': '%d.%m.%Y',
        'cols_to_use': ['Último', 'Máximo', 'Mínimo'],
        'rename_map': {'Último': 'sugar_11', 'Máximo': 'sugar_11_high', 'Mínimo': 'sugar_11_low'},
        'skiprows': 0, 'decimal': ',', 'thousands': None,
        # Info Descarga
        'tipo': 'commodity', 'nombre_investpy': 'US Sugar #11', 'pais_investpy': 'united states',
        'ticker_yfinance': 'SB=F', 'db_tipo_precio': 'contrato_11'
    },
    {
        'filename': 'Futuros azúcar Nº5 Londres.csv',
        'date_col': 'Fecha', 'date_format': '%d.%m.%Y',
        'cols_to_use': ['Último', 'Máximo', 'Mínimo'],
        'rename_map': {'Último': 'sugar_5', 'Máximo': 'sugar_5_high', 'Mínimo': 'sugar_5_low'},
        'skiprows': 0, 'decimal': ',', 'thousands': None,
        # Info Descarga
        'tipo': 'commodity', 'nombre_investpy': 'White Sugar', 'pais_investpy': 'united kingdom',
        'ticker_yfinance': 'SW=F', 'db_tipo_precio': 'contrato_5'
    },
    
    # --- Benchmarks Azúcar y Etanol (Brasil - Cepea) - LOCALES ---
    {
        'filename': 'BRASIL-CEPEA-ESALQ- EN TN.xlsx - Plan 1.csv',
        'date_col': 'Data', 'date_format': '%d/%m/%Y',
        'cols_to_use': ['À vista R$', 'À vista US$'],
        'rename_map': {'À vista R$': 'cepea_azucar_brl_ton', 'À vista US$': 'cepea_azucar_usd_ton'},
        'skiprows': 3, 'decimal': ',', 'thousands': '.'
    },
    {
        'filename': 'AZUCAR CRISTAL-SANTOS EN TN .xlsx - Plan 1.csv',
        'date_col': 'Data', 'date_format': '%d/%m/%Y',
        'cols_to_use': ['À vista R$', 'À vista US$'],
        'rename_map': {'À vista R$': 'santos_azucar_brl_ton', 'À vista US$': 'santos_azucar_usd_ton'},
        'skiprows': 3, 'decimal': ',', 'thousands': '.'
    },
    {
        'filename': 'CEPEA_ETANOL-SAO PAULO.xlsx - Plan 1.csv',
        'date_col': 'Data', 'date_format': '%d/%m/%Y',
        'cols_to_use': ['À vista R$', 'À vista US$'],
        'rename_map': {'À vista R$': 'cepea_etanol_brl', 'À vista US$': 'cepea_etanol_usd'},
        'skiprows': 3, 'decimal': ',', 'thousands': '.'
    },
    {
        'filename': 'CEPEA-ETANOL SPOT.xlsx - Plan 1.csv',
        'date_col': 'Data', 'date_format': '%d/%m/%Y',
        'cols_to_use': ['À vista R$', 'À vista US$'],
        'rename_map': {'À vista R$': 'cepea_etanol_spot_brl', 'À vista US$': 'cepea_etanol_spot_usd'},
        'skiprows': 3, 'decimal': ',', 'thousands': '.'
    },

    # --- Benchmarks Energía ---
    {
        'filename': 'Futuros petróleo crudo WTI.csv',
        'date_col': 'Fecha', 'date_format': '%d.%m.%Y',
        'cols_to_use': ['Último', 'Máximo', 'Mínimo'],
        'rename_map': {'Último': 'oil_wti', 'Máximo': 'oil_wti_high', 'Mínimo': 'oil_wti_low'},
        'skiprows': 0, 'decimal': ',', 'thousands': None,
        # Info Descarga
        'tipo': 'commodity', 'nombre_investpy': 'Crude Oil WTI', 'pais_investpy': 'united states',
        'ticker_yfinance': 'CL=F'
    },
    {
        'filename': 'Futuros petróleo Brent.csv',
        'date_col': 'Fecha', 'date_format': '%d.%m.%Y',
        'cols_to_use': ['Último', 'Máximo', 'Mínimo'],
        'rename_map': {'Último': 'oil_brent', 'Máximo': 'oil_brent_high', 'Mínimo': 'oil_brent_low'},
        'skiprows': 0, 'decimal': ',', 'thousands': None,
        # Info Descarga
        'tipo': 'commodity', 'nombre_investpy': 'Brent Oil', 'pais_investpy': 'united kingdom',
        'ticker_yfinance': 'BZ=F'
    },
    {
        'filename': 'Futuros etanol.csv',
        'date_col': 'Fecha', 'date_format': '%d.%m.%Y',
        'cols_to_use': ['Último', 'Máximo', 'Mínimo'],
        'rename_map': {'Último': 'ethanol_cbot', 'Máximo': 'ethanol_cbot_high', 'Mínimo': 'ethanol_cbot_low'},
        'skiprows': 0, 'decimal': ',', 'thousands': None,
        # Info Descarga
        'tipo': 'commodity', 'nombre_investpy': 'Ethanol Futures', 'pais_investpy': 'united states',
        'ticker_yfinance': 'ZK=F'
    },
    {
        'filename': 'Micro Henry Hub Natural Gas Futures.csv',
        'date_col': 'Fecha', 'date_format': '%d.%m.%Y',
        'cols_to_use': ['Último', 'Máximo', 'Mínimo'],
        'rename_map': {'Último': 'natgas_hh', 'Máximo': 'natgas_hh_high', 'Mínimo': 'natgas_hh_low'},
        'skiprows': 0, 'decimal': ',', 'thousands': None,
        # Info Descarga
        'tipo': 'commodity', 'nombre_investpy': 'Natural Gas', 'pais_investpy': 'united states',
        'ticker_yfinance': 'NG=F'
    },
    {
        'filename': 'Dutch TTF Natural Gas Futures.csv',
        'date_col': 'Date', 'date_format': '%m/%d/%Y', 
        'cols_to_use': ['Price', 'High', 'Low'],
        'rename_map': {'Price': 'natgas_ttf', 'High': 'natgas_ttf_high', 'Low': 'natgas_ttf_low'},
        'skiprows': 0, 'decimal': '.', 'thousands': None,
        # Info Descarga
        'tipo': 'commodity', 'nombre_investpy': 'Dutch TTF Gas', 'pais_investpy': 'netherlands',
        'ticker_yfinance': 'TTF=F'
    },
    
    # --- Divisas e Índices ---
    {
        'filename': 'Índice dólar(DXY).csv',
        'date_col': 'Fecha', 'date_format': '%d.%m.%Y',
        'cols_to_use': ['Último', 'Máximo', 'Mínimo'],
        'rename_map': {'Último': 'fx_dxy', 'Máximo': 'fx_dxy_high', 'Mínimo': 'fx_dxy_low'},
        'skiprows': 0, 'decimal': ',', 'thousands': None,
        # Info Descarga
        'tipo': 'index', 'nombre_investpy': 'US Dollar Index', 'pais_investpy': 'united states',
        'ticker_yfinance': 'DX-Y.NYB'
    },
    {
        'filename': 'Futuros Índice dólar-diciembre(DXZ5).csv',
        'date_col': 'Fecha', 'date_format': '%d.%m.%Y',
        'cols_to_use': ['Último', 'Máximo', 'Mínimo'],
        'rename_map': {'Último': 'fx_dx_future', 'Máximo': 'fx_dx_future_high', 'Mínimo': 'fx_dx_future_low'},
        'skiprows': 0, 'decimal': ',', 'thousands': None,
        # Info Descarga
        'tipo': 'index', 'nombre_investpy': 'US Dollar Index', 'pais_investpy': 'united states',
        'ticker_yfinance': 'DX=F'
    },
    {
        'filename': 'USD_BRL.csv',
        'date_col': 'Fecha', 'date_format': '%d.%m.%Y',
        'cols_to_use': ['Último'],
        'rename_map': {'Último': 'fx_brl_usd'},
        'skiprows': 0, 'decimal': ',', 'thousands': None,
        # Info Descarga
        'tipo': 'currency_cross', 'nombre_investpy': 'USD/BRL', 'pais_investpy': None,
        'ticker_yfinance': 'BRL=X', 'db_tipo_precio': 'usd_brl'
    },
    {
        'filename': 'USD_ARS.csv',
        'date_col': 'Fecha', 'date_format': '%d.%m.%Y',
        'cols_to_use': ['Último'],
        'rename_map': {'Último': 'fx_ars_usd'},
        'skiprows': 0, 'decimal': ',', 'thousands': '.',
        # Info Descarga
        'tipo': 'currency_cross', 'nombre_investpy': 'USD/ARS', 'pais_investpy': None,
        'ticker_yfinance': 'ARS=X', 'db_tipo_precio': 'usd_ars'
    }
]

# --- 3. Descarga y Actualización ---
print("--- Fase 1: Descarga y Actualización de Datos ---")
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

for config in FILES_CONFIG:
    descargar_datos(config)
    time.sleep(1) # Pausa respetuosa

# --- 4. Bucle de Carga y Limpieza (Procesamiento) ---
print("\n--- Fase 2: Procesamiento y Creación de Dataset Maestro ---")
all_dataframes = []

for config in FILES_CONFIG:
    file_path = os.path.join(DATA_DIR, config['filename'])
    try:
        # Lógica especial para ARS que requiere limpieza manual
        if config['filename'] == 'USD_ARS.csv':
             # Procesamiento manual ARS (mantenido del script original)
             df = pd.read_csv(file_path, encoding='utf-8-sig', usecols=['Fecha', 'Último'], dtype={'Último': 'object'})
             df['Fecha'] = pd.to_datetime(df['Fecha'], format='%d.%m.%Y', errors='coerce')
             df.dropna(subset=['Fecha'], inplace=True)
             col_limpia = df['Último'].str.replace('.', '', regex=False).str.replace(',', '.', regex=False)
             df['fx_ars_usd'] = pd.to_numeric(col_limpia, errors='coerce')
             df.rename(columns={'Fecha': 'Date'}, inplace=True)
             df.set_index('Date', inplace=True)
             all_dataframes.append(df[['fx_ars_usd']])
             print(f"  ✅ Procesado: {config['filename']} (Manual ARS)")
             continue

        all_cols_to_use = [config['date_col']] + config['cols_to_use']
        
        # Verificar si el archivo existe antes de leer
        if not os.path.exists(file_path):
            print(f"  ⚠️ Archivo no encontrado: {config['filename']}. Saltando.")
            continue

        df = pd.read_csv(
            file_path,
            encoding='utf-8-sig',
            skiprows=config['skiprows'],
            usecols=all_cols_to_use,
            decimal=config['decimal'],
            thousands=config.get('thousands', None)
        )
        
        # Usar dayfirst=True para manejar DD.MM.YYYY y YYYY-MM-DD de forma flexible
        df[config['date_col']] = pd.to_datetime(df[config['date_col']], dayfirst=True, errors='coerce')
        df.dropna(subset=[config['date_col']], inplace=True)
        
        for col in config['cols_to_use']:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            
        full_rename_map = config['rename_map'].copy()
        full_rename_map[config['date_col']] = 'Date'
        df.rename(columns=full_rename_map, inplace=True)
        
        df.set_index('Date', inplace=True)

        all_dataframes.append(df)
        print(f"  ✅ Procesado: {config['filename']}")

    except Exception as e:
        print(f"  ❌ ERROR procesando {config['filename']}: {e}. Saltando.")


# --- 5. Consolidación Final ---
if not all_dataframes:
    print("\nNo se pudo procesar ningún archivo. Saliendo.")
else:
    print(f"\nUniendo {len(all_dataframes)} DataFrames...")
    df_maestro = pd.concat(all_dataframes, axis=1)
    df_maestro.sort_index(inplace=True)
    
    df_maestro = df_maestro.fillna(method='ffill') 
    df_maestro = df_maestro.fillna(method='bfill')
    
    # --- 6. Guardado Final ---
    df_maestro.to_csv(OUTPUT_FILE)
    
    print("\n" + "="*50)
    print(f"✅ ¡ÉXITO! Se creó tu nuevo archivo maestro en:")
    print(f"{OUTPUT_FILE}")
    print(f"Dimensiones finales: {df_maestro.shape}")
    print("="*50)