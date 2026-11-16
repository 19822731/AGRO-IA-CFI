import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

# Asegurarse de que el path permita importar desde la raíz del proyecto
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Importar modelos del proyecto
from models import Base

# Obtener la MetaData desde la Base declarativa del proyecto
metadata = Base.metadata

@pytest.fixture(scope="session")
def engine():
    # SQLite en memoria con FK activadas (para probar ON DELETE CASCADE)
    db_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    
    @event.listens_for(db_engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
        
    metadata.create_all(db_engine)
    try:
        yield db_engine
    finally:
        metadata.drop_all(db_engine)

@pytest.fixture
def db_session(engine):
    Session = sessionmaker(bind=engine, future=True)
    with Session() as session:
        yield session
        session.rollback()
