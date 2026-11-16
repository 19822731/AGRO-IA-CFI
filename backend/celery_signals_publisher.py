# celery_signals_publisher.py  (cárgalo en el proceso web)
from celery import signals
from asgi_correlation_id import correlation_id

@signals.before_task_publish.connect
def inject_correlation_id(headers=None, **kwargs):
    cid = correlation_id.get()
    if not cid:
        return
    if headers is None:
        return
    # Inyectar o sobreescribir de forma explícita
    headers["X-Correlation-ID"] = cid
