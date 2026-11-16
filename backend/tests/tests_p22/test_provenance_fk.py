from app.etl.etl_service import register_dataset, record_provenance
from sqlalchemy import select
from models import DataProvenance, DataIngesta

def test_provenance_fk_cascade(db_session, tmp_path):
    f = tmp_path / "dataset.csv"
    f.write_text("x,y\n1,1\n")

    ing = register_dataset(db_session, str(f), fuente="INDEC", version="v1")

    prov = record_provenance(
        db_session, tabla_destino="tabla_demo", data_ingesta_id=ing.id,
        transform_hash="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
    )

    # Verificar que existe la fila de provenance
    rows = db_session.execute(select(DataProvenance).where(DataProvenance.id==prov.id)).scalars().all()
    assert len(rows) == 1

    # Borrar el padre y confirmar cascada (via ON DELETE CASCADE o relación ORM)
    db_session.delete(ing)
    db_session.commit()

    rows_after = db_session.execute(select(DataProvenance).where(DataProvenance.id==prov.id)).scalars().all()
    assert len(rows_after) == 0
