import os
import zipfile

# Carpeta raíz (la actual desde donde se ejecuta el script)
carpeta_raiz = os.getcwd()

# Nombre del archivo ZIP a crear
nombre_zip = "scripts_ia.zip"

# Crear el archivo ZIP
with zipfile.ZipFile(nombre_zip, "w", zipfile.ZIP_DEFLATED) as zipf:
    for carpeta_actual, subcarpetas, archivos in os.walk(carpeta_raiz):
        for archivo in archivos:
            if archivo.endswith(".py"):
                ruta_completa = os.path.join(carpeta_actual, archivo)
                ruta_relativa = os.path.relpath(ruta_completa, carpeta_raiz)
                zipf.write(ruta_completa, ruta_relativa)

print(f"Se creó el archivo '{nombre_zip}' con todos los scripts .py.")
