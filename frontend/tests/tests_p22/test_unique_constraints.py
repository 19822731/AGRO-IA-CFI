import os
import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Asegurarse de que el path permita importar desde la raíz del proyecto
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models import DataIngesta

# --- SQLite (usa el fixture db_session de conftest.py) ---
def test_unique_data_ingesta_sqlite_enforced(db_session):
    # Inserta dos filas con mismo (fuente, hash_sha256) y verifica IntegrityError
    first = DataIngesta(
        fuente="INDEC",
        hash_sha256="a"*64,
        version="v1"
    )
    db_session.add(first)
    db_session.commit()

    dup = DataIngesta(
        fuente="INDEC",
        hash_sha256="a"*64,  # mismo hash -> viola UNIQUE(fuente, hash_sha256)
        version="v2"
    )
    db_session.add(dup)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


# --- Postgres opcional (requiere que hayas corrido Alembic) ---
from sqlalchemy.exc import OperationalError

@pytest.mark.postgres
def test_unique_data_ingesta_postgres_enforced():
    dburl = os.getenv("DATABASE_URL")
    if not dburl:
        pytest.skip("DATABASE_URL no definido; omitiendo prueba Postgres")

    engine = create_engine(dburl, pool_pre_ping=True, future=True)
    try:
        with engine.connect() as _conn:
            pass
    except OperationalError:
        pytest.skip("Postgres no accesible desde este entorno; omitiendo prueba")

    Session = sessionmaker(bind=engine, future=True)

    with Session() as s:
        # Limpieza previa por si quedó alguna fila de ejecuciones anteriores
        s.query(DataIngesta).filter(
            DataIngesta.fuente=="INDEC",
            DataIngesta.hash_sha256=="b"*64
        ).delete(synchronize_session=False)
        s.commit()

        first = DataIngesta(
            fuente="INDEC",
            hash_sha256="b"*64,
            version="v1"
        )
        s.add(first)
        s.commit()

        dup = DataIngesta(
            fuente="INDEC",
            hash_sha256="b"*64,
            version="v2"
        )
        s.add(dup)
        with pytest.raises(IntegrityError):
            s.commit()
        s.rollback()

        # Limpieza final
        s.query(DataIngesta).filter(
            DataIngesta.fuente=="INDEC",
            DataIngesta.hash_sha256=="b"*64
        ).delete(synchronize_session=False)
        s.commit()
