import pandas as pd

file_path = '/Users/arquimedescarrizo/agro-ia/data/mercado_interno.xlsx'
df_full = pd.read_excel(file_path, header=None)

# Find rows that contain the header 'Fecha'
header_rows_indices = df_full[df_full.apply(lambda row: 'Fecha' in str(row.values), axis=1)].index.tolist()
print(f"Header rows identified: {header_rows_indices}")

# Define the base headers
base_headers = ['Fecha', '50Kg', '1Kg', 's/iva', 'T/C', 'U$/K']

all_processed_dfs = []

# Iterate through the header rows, starting from the second one (to skip 2007 data)
for i in range(1, len(header_rows_indices)):
    start_header_row_index = header_rows_indices[i]
    
    # Determine the end row index for the current block's data
    # It's the row before the next header row, or the end of the DataFrame
    end_data_row_index = header_rows_indices[i+1] if i+1 < len(header_rows_indices) else len(df_full)
    
    # Extract the data block, starting from the row *after* the header
    data_block = df_full.iloc[start_header_row_index + 1 : end_data_row_index].copy()
    print(f"\n--- Processing block from row {start_header_row_index + 1} to {end_data_row_index} ---")
    print("Sample of raw data_block:")
    print(data_block.head().to_markdown(index=False))

    # Process each set of 6 columns within the data block
    processed_block_cols = []
    for j in range(0, data_block.shape[1], len(base_headers)):
        chunk = data_block.iloc[:, j:j + len(base_headers)].copy()
        
        # Only process if the chunk is not empty and has enough columns
        if not chunk.empty and chunk.shape[1] == len(base_headers):
            chunk.columns = base_headers
            
            print(f"\n--- DEBUGGING FECHA COLUMN (Block {i}, Chunk {j}) ---")
            print("Sample values before conversion:")
            print(chunk['Fecha'].head().to_markdown(index=False))
            print(f"Dtype before conversion: {chunk['Fecha'].dtype}")

            # Attempt to convert 'Fecha' column from string format first
            chunk['Fecha'] = pd.to_datetime(chunk['Fecha'], errors='coerce')
            print("Sample values after first conversion (string to datetime):")
            print(chunk['Fecha'].head().to_markdown(index=False))
            print(f"Dtype after first conversion: {chunk['Fecha'].dtype}")
            
            # For any NaT values, check if they are numeric (Excel serial dates) and convert
            numeric_dates_mask = chunk['Fecha'].isna() & pd.to_numeric(chunk['Fecha'], errors='coerce').notna()
            if numeric_dates_mask.any():
                chunk.loc[numeric_dates_mask, 'Fecha'] = pd.to_datetime(
                    pd.to_numeric(chunk.loc[numeric_dates_mask, 'Fecha']),
                    unit='D', origin='1899-12-30', errors='coerce'
                )
            print("Sample values after second conversion (numeric to datetime):")
            print(chunk['Fecha'].head().to_markdown(index=False))
            print(f"Dtype after second conversion: {chunk['Fecha'].dtype}")
            print("------------------------------")

            # Drop rows where 'Fecha' is still NaT (invalid dates)
            chunk.dropna(subset=['Fecha'], inplace=True)
            
            if not chunk.empty:
                processed_block_cols.append(chunk)
    
    if processed_block_cols:
        combined_chunk = pd.concat(processed_block_cols, ignore_index=True)
        all_processed_dfs.append(combined_chunk)

if all_processed_dfs:
    final_df = pd.concat(all_processed_dfs, ignore_index=True)
    final_df.sort_values(by='Fecha', inplace=True)
    print(final_df.head().to_markdown(index=False))
    print(final_df.columns.tolist())
    print(f"Total rows after processing: {len(final_df)}")
else:
    print("No data found after processing.")