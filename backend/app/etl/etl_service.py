# app/etl/etl_service.py
import hashlib
from datetime import date
from typing import Optional

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

# Se asume que este archivo será parte de un paquete más grande
# y que los modelos y la sesión se pueden importar desde ubicaciones conocidas.
from models import DataIngesta, DataProvenance
from database import SessionLocal

def sha256_file(file_path: str) -> str:
    h = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def register_dataset(session, file_path: str, fuente: str, version: str,
                     rango_desde: Optional[date] = None, rango_hasta: Optional[date] = None) -> DataIngesta:
    file_hash = sha256_file(file_path)
    # Idempotencia: (fuente, hash) único
    existing = session.execute(
        select(DataIngesta).where(DataIngesta.fuente == fuente, DataIngesta.hash_sha256 == file_hash)
    ).scalar_one_or_none()
    if existing:
        print(f"Dataset ya registrado con ID: {existing.id}")
        return existing

    obj = DataIngesta(
        fuente=fuente,
        hash_sha256=file_hash,
        version=version,
        rango_desde=rango_desde,
        rango_hasta=rango_hasta,
    )
    session.add(obj)
    session.commit()
    session.refresh(obj)
    print(f"Nuevo dataset registrado con ID: {obj.id}")
    return obj

def record_provenance(session, tabla_destino: str, data_ingesta_id: int, transform_hash: str) -> DataProvenance:
    if len(transform_hash) != 64:
        raise ValueError("transform_hash debe ser SHA256 (64 hex)")
    obj = DataProvenance(
        tabla_destino=tabla_destino,
        data_ingesta_id=data_ingesta_id,
        transform_hash=transform_hash,
    )
    session.add(obj)
    session.commit()
    session.refresh(obj)
    print(f"Nueva traza de procedencia registrada con ID: {obj.id}")
    return obj
