# celery_signals_worker.py  (cárgalo en el worker)
from celery import signals
from asgi_correlation_id import correlation_id
import logging
from logging_config import setup_logging

_TOKEN = None

# Configurar logging JSON y filtro de CID al iniciar el worker
@signals.worker_process_init.connect
def configure_worker_logging(**kwargs):
    setup_logging()
    logging.getLogger(__name__).info("Worker logging configured")

# Antes de ejecutar cada tarea, setear el CID en el contexto
@signals.task_prerun.connect
def bind_cid_to_context(task=None, **kwargs):
    global _TOKEN
    try:
        headers = getattr(task.request, "headers", {}) or {}
        cid = headers.get("X-Correlation-ID")
        if cid:
            _TOKEN = correlation_id.set(cid)
    except Exception:
        pass

@signals.task_postrun.connect
def clear_cid_after_task(*_, **__):
    # Resetea el contexto para no “arrastrar” el CID a tareas futuras
    global _TOKEN
    if _TOKEN is not None:
        try:
            correlation_id.reset(_TOKEN)
            _TOKEN = None
        except Exception:
            pass