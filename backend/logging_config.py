# logging_config.py
import logging
import os
from pythonjsonlogger import jsonlogger
from asgi_correlation_id import CorrelationIdFilter

def setup_logging():
    level = os.getenv("LOG_LEVEL", "INFO").upper()

    root = logging.getLogger()
    root.handlers.clear()
    root.setLevel(level)

    handler = logging.StreamHandler()

    # Mensaje base; los campos extra llegan por el filtro
    fmt = "%(asctime)s %(levelname)s %(name)s %(message)s"
    formatter = jsonlogger.JsonFormatter(fmt=fmt)
    handler.setFormatter(formatter)

    # Inyecta `correlation_id` en cada registro si está presente en el contexto
    handler.addFilter(CorrelationIdFilter(
        uuid_length=32,              # IDs compactos
        default_value="-"           # si no hay contexto
    ))

    root.addHandler(handler)

    # Ejemplo de reducción de ruido (ajusta a gusto)
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
