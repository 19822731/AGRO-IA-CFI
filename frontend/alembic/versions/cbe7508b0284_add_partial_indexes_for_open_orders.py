"""Add partial indexes for open orders

Revision ID: cbe7508b0284
Revises: 4c93b7505717
Create Date: 2025-08-17 07:20:05.124337

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cbe7508b0284'
down_revision: Union[str, Sequence[str], None] = '4c93b7505717'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    ctx = op.get_context()
    with ctx.autocommit_block():
        op.execute("""
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ask_open
            ON ordenes (producto_id, precio_limite ASC, timestamp ASC)
            WHERE estado = 'abierta' AND tipo_orden = 'venta';
        """)
        op.execute("""
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bid_open
            ON ordenes (producto_id, precio_limite DESC, timestamp ASC)
            WHERE estado = 'abierta' AND tipo_orden = 'compra';
        """)


def downgrade() -> None:
    """Downgrade schema."""
    ctx = op.get_context()
    with ctx.autocommit_block():
        op.execute("DROP INDEX CONCURRENTLY IF EXISTS idx_ask_open;")
        op.execute("DROP INDEX CONCURRENTLY IF EXISTS idx_bid_open;")