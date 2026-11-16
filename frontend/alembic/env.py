import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Añadir la raíz del proyecto al path de Python para que encuentre nuestros modelos
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '..')))

# --- INICIO DE LA CONFIGURACIÓN PERSONALIZADA ---

# 1. Importar la configuración central y los modelos
from config import settings
import models

# 2. Importar la Base declarativa desde el lugar correcto
from database import Base

# --- FIN DE LA CONFIGURACIÓN PERSONALIZADA ---

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# 3. Sobrescribir la URL de la base de datos con la de la configuración central
config.set_main_option('sqlalchemy.url', settings.DATABASE_URL)

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Asignar nuestros modelos a target_metadata
# Gracias a la importación de `models`, Base.metadata ahora contiene nuestras tablas
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()