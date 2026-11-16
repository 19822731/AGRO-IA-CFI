# app/utils/db_retry.py
import time
import random
import logging
from sqlalchemy.exc import OperationalError, DBAPIError

log = logging.getLogger(__name__)

# SQLSTATE reintentables conocidas en Postgres
# 40P01 = deadlock_detected, 40001 = serialization_failure
RETRIABLE_SQLSTATE_CODES = {"40P01", "40001"}


def with_db_retry(
    fn,
    *args,
    max_attempts: int = 3,
    base_backoff: float = 0.2,
    max_backoff: float = 2.0,
    retry_on=(OperationalError, DBAPIError),
    non_retryable=(),
):
    """
    Ejecuta `fn(*args)` con reintentos y backoff exponencial (con jitter).

    - Reintenta ante OperationalError (p.ej., "database is locked" en SQLite).
    - Reintenta ante DBAPIError sólo si `e.orig.pgcode` está en RETRIABLE_SQLSTATE_CODES.
    - Nunca reintenta si la excepción es instancia de `non_retryable` (p.ej., IntegrityError).
    """
    for attempt in range(1, max_attempts + 1):
        try:
            return fn(*args)
        except retry_on as e:
            # No reintentar sobre excepciones marcadas como no reintentables
            if isinstance(e, non_retryable):
                raise

            is_retriable = False

            # DBAPI (psycopg2) con SQLSTATE disponible
            if isinstance(e, DBAPIError) and getattr(e, "orig", None) is not None:
                pgcode = getattr(e.orig, "pgcode", None)
                if pgcode in RETRIABLE_SQLSTATE_CODES:
                    is_retriable = True

            # OperationalError genérico (incluye lock de SQLite)
            elif isinstance(e, OperationalError):
                is_retriable = True

            # Si no es reintentable o alcanzamos el último intento, re-lanzar
            if not is_retriable or attempt == max_attempts:
                raise

            # Backoff exponencial con jitter
            sleep_time = min(base_backoff * (2 ** (attempt - 1)), max_backoff)
            sleep_time += random.uniform(0, 0.1)
            log.warning(
                "DB op failed (attempt %s/%s). Retrying in %.2fs.",
                attempt,
                max_attempts,
                sleep_time,
            )
            time.sleep(sleep_time)
