import pandas as pd
import os
import warnings

# Ignorar advertencias de pandas
warnings.filterwarnings('ignore')

print("Iniciando la creación del Dataset Maestro v3 (Corrección ARS)...")

# --- 1. Definición de Rutas ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'DATOS')
OUTPUT_FILE = os.path.join(DATA_DIR, 'dataset_maestro_COMPLETO.csv')

# --- 2. Configuración de Archivos ---
FILES_CONFIG = [
    # ... (Todas las configuraciones de los otros 14 archivos van aquí, 
    #      son idénticas al script anterior) ...
    
    # --- Benchmarks Azúcar (Global) ---
    {
        'filename': 'Futuros azúcar Nº11 EE.UU.csv',
        'date_col': 'Fecha', 'date_format': '%d.%m.%Y',
        'cols_to_use': ['Último', 'Máximo', 'Mínimo'],
        'rename_map': {'Último': 'sugar_11', 'Máximo': 'sugar_11_high', 'Mínimo': 'sugar_11_low'},
        'skiprows': 0, 'decimal': ',', 'thousands': None
    },
    {
        'filename': 'Futuros azúcar Nº5 Londres.csv',
        'date_col': 'Fecha', 'date_format': '%d.%m.%Y',
        'cols_to_use': ['Último', 'Máximo', 'Mínimo'],
        'rename_map': {'Último': 'sugar_5', 'Máximo': 'sugar_5_high', 'Mínimo': 'sugar_5_low'},
        'skiprows': 0, 'decimal': ',', 'thousands': None
    },
    
    # --- Benchmarks Azúcar y Etanol (Brasil - Cepea) ---
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
        'skiprows': 0, 'decimal': ',', 'thousands': None
    },
    {
        'filename': 'Futuros petróleo Brent.csv',
        'date_col': 'Fecha', 'date_format': '%d.%m.%Y',
        'cols_to_use': ['Último', 'Máximo', 'Mínimo'],
        'rename_map': {'Último': 'oil_brent', 'Máximo': 'oil_brent_high', 'Mínimo': 'oil_brent_low'},
        'skiprows': 0, 'decimal': ',', 'thousands': None
    },
    {
        'filename': 'Futuros etanol.csv',
        'date_col': 'Fecha', 'date_format': '%d.%m.%Y',
        'cols_to_use': ['Último', 'Máximo', 'Mínimo'],
        'rename_map': {'Último': 'ethanol_cbot', 'Máximo': 'ethanol_cbot_high', 'Mínimo': 'ethanol_cbot_low'},
        'skiprows': 0, 'decimal': ',', 'thousands': None
    },
    {
        'filename': 'Micro Henry Hub Natural Gas Futures.csv',
        'date_col': 'Fecha', 'date_format': '%d.%m.%Y',
        'cols_to_use': ['Último', 'Máximo', 'Mínimo'],
        'rename_map': {'Último': 'natgas_hh', 'Máximo': 'natgas_hh_high', 'Mínimo': 'natgas_hh_low'},
        'skiprows': 0, 'decimal': ',', 'thousands': None
    },
    {
        'filename': 'Dutch TTF Natural Gas Futures.csv',
        'date_col': 'Date', 'date_format': '%m/%d/%Y', 
        'cols_to_use': ['Price', 'High', 'Low'],
        'rename_map': {'Price': 'natgas_ttf', 'High': 'natgas_ttf_high', 'Low': 'natgas_ttf_low'},
        'skiprows': 0, 'decimal': '.', 'thousands': None
    },
    
    # --- Divisas e Índices ---
    {
        'filename': 'Índice dólar(DXY).csv',
        'date_col': 'Fecha', 'date_format': '%d.%m.%Y',
        'cols_to_use': ['Último', 'Máximo', 'Mínimo'],
        'rename_map': {'Último': 'fx_dxy', 'Máximo': 'fx_dxy_high', 'Mínimo': 'fx_dxy_low'},
        'skiprows': 0, 'decimal': ',', 'thousands': None
    },
    {
        'filename': 'Futuros Índice dólar-diciembre(DXZ5).csv',
        'date_col': 'Fecha', 'date_format': '%d.%m.%Y',
        'cols_to_use': ['Último', 'Máximo', 'Mínimo'],
        'rename_map': {'Último': 'fx_dx_future', 'Máximo': 'fx_dx_future_high', 'Mínimo': 'fx_dx_future_low'},
        'skiprows': 0, 'decimal': ',', 'thousands': None
    },
    {
        'filename': ' USD_BRL.csv',
        'date_col': 'Fecha', 'date_format': '%d.%m.%Y',
        'cols_to_use': ['Último'],
        'rename_map': {'Último': 'fx_brl_usd'},
        'skiprows': 0, 'decimal': ',', 'thousands': None
    },
    # ---- INICIO DE LA CORRECCIÓN ----
    # No usaremos la config estándar para ARS
    #{
    #    'filename': 'USD_ARS.csv',
    #    'date_col': 'Fecha', 'date_format': '%d.%m.%Y',
    #    'cols_to_use': ['Último'],
    #    'rename_map': {'Último': 'fx_ars_usd'},
    #    'skiprows': 0, 'decimal': ',', 
    #    'thousands': '.'
    #}
    # ---- FIN DE LA CORRECCIÓN ----
]

# --- 3. Bucle de Carga y Limpieza ---
all_dataframes = []
print(f"Iniciando el procesamiento de {len(FILES_CONFIG)} archivos...")

for config in FILES_CONFIG:
    file_path = os.path.join(DATA_DIR, config['filename'])
    try:
        all_cols_to_use = [config['date_col']] + config['cols_to_use']
        
        df = pd.read_csv(
            file_path,
            encoding='utf-8-sig',
            skiprows=config['skiprows'],
            usecols=all_cols_to_use,
            decimal=config['decimal'],
            thousands=config.get('thousands', None)
        )
        
        df[config['date_col']] = pd.to_datetime(df[config['date_col']], format=config['date_format'], errors='coerce')
        df.dropna(subset=[config['date_col']], inplace=True)
        
        for col in config['cols_to_use']:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            
        full_rename_map = config['rename_map'].copy()
        full_rename_map[config['date_col']] = 'Date'
        df.rename(columns=full_rename_map, inplace=True)
        
        df.set_index('Date', inplace=True)

        # --- Post-procesamiento específico para este archivo ---
        if 'post_process' in config:
            for new_col, source_cols in config['post_process'].items():
                # Asegurarse de que las columnas existen antes de intentar sumarlas
                existing_source_cols = [col for col in source_cols if col in df.columns]
                if existing_source_cols:
                    df[new_col] = df[existing_source_cols].sum(axis=1)
                    df.drop(columns=existing_source_cols, inplace=True) # Eliminar columnas originales si se suman
                else:
                    print(f"  ⚠️ Advertencia: No se encontraron columnas fuente para '{new_col}' en {config['filename']}. Saltando post-procesamiento.")

        all_dataframes.append(df)
        print(f"  ✅ Procesado: {config['filename']}")

    except FileNotFoundError:
        print(f"  ❌ ERROR: No se encontró el archivo {config['filename']}. Saltando.")
    except Exception as e:
        print(f"  ❌ ERROR procesando {config['filename']}: {e}. Saltando.")

# ---- INICIO DE LA CORRECCIÓN (PROCESO MANUAL PARA ARS) ----
print("\n--- Procesando 'USD_ARS.csv' manualmente ---")
try:
    file_path_ars = os.path.join(DATA_DIR, 'USD_ARS.csv')
    
    # Leer las columnas de interés, tratando 'Último' como texto
    df_ars = pd.read_csv(
        file_path_ars,
        encoding='utf-8-sig',
        usecols=['Fecha', 'Último'],
        dtype={'Último': 'object'} # Leer 'Último' como texto (string)
    )
    
    # 1. Limpiar Fechas
    df_ars['Fecha'] = pd.to_datetime(df_ars['Fecha'], format='%d.%m.%Y', errors='coerce')
    df_ars.dropna(subset=['Fecha'], inplace=True)
    
    # 2. Limpieza Manual de 'Último'
    #    Paso 1: Quitar los puntos de miles (ej. '1.417,1096' -> '1417,1096')
    col_limpia = df_ars['Último'].str.replace('.', '', regex=False)
    #    Paso 2: Reemplazar la coma decimal por un punto (ej. '1417,1096' -> '1417.1096')
    col_limpia = col_limpia.str.replace(',', '.', regex=False)
    
    # 3. Convertir a numérico
    df_ars['fx_ars_usd'] = pd.to_numeric(col_limpia, errors='coerce')
    
    # 4. Establecer Índice y seleccionar la columna final
    df_ars.set_index('Fecha', inplace=True)
    all_dataframes.append(df_ars[['fx_ars_usd']])
    print("  ✅ Procesado: USD_ARS.csv (manual)")

except FileNotFoundError:
    print(f"  ❌ ERROR: No se encontró el archivo USD_ARS.csv. Saltando.")
except Exception as e:
    print(f"  ❌ ERROR procesando USD_ARS.csv (manual): {e}. Saltando.")
# ---- FIN DE LA CORRECCIÓN ----


# --- 4. Consolidación Final ---
if not all_dataframes:
    print("\nNo se pudo procesar ningún archivo. Saliendo.")
else:
    print(f"\nUniendo {len(all_dataframes)} DataFrames...")
    df_maestro = pd.concat(all_dataframes, axis=1)
    df_maestro.sort_index(inplace=True)
    
    df_maestro = df_maestro.fillna(method='ffill') 
    df_maestro = df_maestro.fillna(method='bfill')
    
    # --- 5. Guardado Final ---
    df_maestro.to_csv(OUTPUT_FILE)
    
    print("\n" + "="*50)
    print(f"✅ ¡ÉXITO! Se creó tu nuevo archivo maestro en:")
    print(f"{OUTPUT_FILE}")
    print(f"Dimensiones finales: {df_maestro.shape}")
    print("--- Últimos 5 registros (Revisar fx_ars_usd): ---")
    print(df_maestro.tail())
    print("="*50)