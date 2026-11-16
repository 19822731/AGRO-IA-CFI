from app.etl.etl_service import register_dataset
from sqlalchemy import select
from models import DataIngesta

def _write_file(path, content: bytes):
    with open(path, "wb") as f:
        f.write(content)

def test_data_ingesta_idempotency_same_file(db_session, tmp_path):
    # Dos archivos con el MISMO contenido => mismo hash
    f1 = tmp_path / "dataset_A.csv"
    f2 = tmp_path / "dataset_B.csv"
    payload = b"col1,col2\n1,2\n"
    _write_file(f1, payload); _write_file(f2, payload)

    a = register_dataset(db_session, str(f1), fuente="INDEC", version="v1")
    b = register_dataset(db_session, str(f2), fuente="INDEC", version="v1")

    # Debe ser el mismo registro (idempotencia por UNIQUE(fuente, hash_sha256))
    assert a.id == b.id

    # Y debe existir un único registro en la tabla
    count = db_session.execute(select(DataIngesta).where(DataIngesta.fuente=="INDEC")).scalars().all()
    assert len(count) == 1
