"""Add stricter check constraints to wallets and orders

Revision ID: b6020494aa86
Revises: 87cc54982796
Create Date: 2025-08-17 08:25:01.990590

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b6020494aa86'
down_revision: Union[str, Sequence[str], None] = '87cc54982796'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _ensure_check(table: str, name: str, condition: str):
    op.execute(f"""
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        WHERE c.conname = '{name}'
          AND t.relname = '{table}'
      ) THEN
        ALTER TABLE {table}
          ADD CONSTRAINT {name} CHECK ({condition}) NOT VALID;
        ALTER TABLE {table}
          VALIDATE CONSTRAINT {name};
      END IF;
    END$$;
    """)

def upgrade() -> None:
    # billeteras: no negativos
    _ensure_check("billeteras_fiat",     "ck_billeteras_fiat_saldo_nonneg",        "saldo >= 0")
    _ensure_check("billeteras_activos",  "ck_billeteras_activo_cantidad_nonneg",   "cantidad >= 0")

    # ordenes: cantidades coherentes y precio no negativo si aplica
    _ensure_check("ordenes", "ck_ordenes_cantidades_nonneg",
                  "cantidad_original >= 0 AND cantidad_ejecutada >= 0")
    _ensure_check("ordenes", "ck_ordenes_ejecutada_le_original",
                  "cantidad_ejecutada <= cantidad_original")
    _ensure_check("ordenes", "ck_ordenes_precio_limite_nonneg",
                  "precio_limite IS NULL OR precio_limite >= 0")

    # consistencia tipo de ejecución / precio
    _ensure_check("ordenes", "ck_ordenes_tipo_ejecucion_consistency",
                  "(tipo_ejecucion = 'limite' AND precio_limite IS NOT NULL) "
                  "OR (tipo_ejecucion = 'mercado' AND precio_limite IS NULL)")

def downgrade() -> None:
    op.execute("ALTER TABLE ordenes DROP CONSTRAINT IF EXISTS ck_ordenes_tipo_ejecucion_consistency;")
    op.execute("ALTER TABLE ordenes DROP CONSTRAINT IF EXISTS ck_ordenes_precio_limite_nonneg;")
    op.execute("ALTER TABLE ordenes DROP CONSTRAINT IF EXISTS ck_ordenes_ejecutada_le_original;")
    op.execute("ALTER TABLE ordenes DROP CONSTRAINT IF EXISTS ck_ordenes_cantidades_nonneg;")
    op.execute("ALTER TABLE billeteras_activos DROP CONSTRAINT IF EXISTS ck_billeteras_activo_cantidad_nonneg;")
    op.execute("ALTER TABLE billeteras_fiat DROP CONSTRAINT IF EXISTS ck_billeteras_fiat_saldo_nonneg;")