import re

pdf_text = """PROYECCION BALANCE AZUCARERO DE LA ZAFRA 2025/2026-- 1º Quincena Julio de 2025-
2º ESTIMACION- CON INFORME EEAOC S/PROD.CAÑA Y ÁREA SEMBRADA, Y CON UNA HIPOTESIS
DE BAJA PROBABILIDAD DE HELADAS SEVERAS
ARQUÍMEDES CARRIZO
ASOCIADOS
BALANCE AZUCARERO DE CAÑA DE AZÚCAR ZAFRA 2025/2026
16/07/2025
AZUCARES
TM
290.000
1.-Existencia inicial al 31-05-2025
2.-Produccion azucar equivalente
2.1.Tucuman
1.810.000
2.2.-Salta y Jujuy
800.000
1.-OFERTA
2.900.000
3.-Demanda Interna Proyectada-Junio 2025-Mayo2026
1.250.000
4.- Azucar equivalente destinada a Alcohol Proyectada-Junio 2025-Mayo 2026-
650.000
5.-Exportaciones Proyectadas-Junio2025-Mayo 2026
500.000
6.-Ajustes por posibles errores estadisticos
0
II.-DEMANDA
2.400.000
6.-Existencia final normal al 31-5-26
110.000
III.-EXCEDENTE O DEFICIT
390.000 EXCEDENTE"""

def extract_value(pattern, text, is_float=True):
    match = re.search(pattern, text, re.DOTALL)
    if match:
        value_str = match.group(1).replace('.', '').replace(',', '.')
        if is_float:
            try:
                return float(value_str)
            except ValueError:
                return value_str # Fallback if conversion fails
        else:
            return value_str.strip()
    return None

# Corrected patterns based on value position relative to label
extracted_data = {
    "Existencia_Inicial_31-05-2025": extract_value(r'([\d\.]+)\s*\n1\.-Existencia inicial al 31-05-2025', pdf_text),
    "Produccion_Proyectada_Tucuman": extract_value(r'2\.1\.Tucuman\s*\n([\d\.]+)', pdf_text),
    "Produccion_Proyectada_Salta_Jujuy": extract_value(r'2\.2\.-Salta y Jujuy\s*\n([\d\.]+)', pdf_text),
    "Oferta_Total_Proyectada": extract_value(r'1\.-OFERTA\s*\n([\d\.]+)', pdf_text),
    "Demanda_Interna_Proyectada": extract_value(r'3\.-Demanda Interna Proyectada-Junio 2025-Mayo2026\s*\n([\d\.]+)', pdf_text),
    "Demanda_Alcohol_Proyectada": extract_value(r'4\.- Azucar equivalente destinada a Alcohol Proyectada-Junio 2025-Mayo 2026-\s*\n([\d\.]+)', pdf_text),
    "Exportaciones_Proyectadas": extract_value(r'5\.-Exportaciones Proyectadas-Junio2025-Mayo 2026\s*\n([\d\.]+)', pdf_text),
    "Ajustes_por_posibles_errores_estadisticos": extract_value(r'6\.-Ajustes por posibles errores estadisticos\s*\n([\d\.]+)', pdf_text),
    "Demanda_Total_Proyectada": extract_value(r'II\.-DEMANDA\s*\n([\d\.]+)', pdf_text),
    "Existencia_Final": extract_value(r'6\.-Existencia final normal al 31-5-26\s*\n([\d\.]+)', pdf_text),
    "Excedente": extract_value(r'III\.-EXCEDENTE O DEFICIT\s*\n([\d\.]+ EXCEDENTE)', pdf_text, is_float=False)
}

# Format data into CSV string
csv_lines = ["Concepto,Valor_TM"]
for concepto, valor in extracted_data.items():
    csv_lines.append(f"{concepto},{valor}")

csv_content = "\n".join(csv_lines)

# Print the CSV content (for verification)
print(csv_content)

# Write to a CSV file
with open('/Users/arquimedescarrizo/agro-ia/data/balance_azucarero_processed.csv', 'w') as f:
    f.write(csv_content)

print("\nCSV file 'balance_azucarero_processed.csv' created successfully.")
