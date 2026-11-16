# Usa una imagen slim para un tamaño final más pequeño
FROM python:3.12-slim

WORKDIR /app

# Instalar dependencias directamente desde requirements.txt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código de la aplicación
COPY . .

# Comando para ejecutar la aplicación
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
