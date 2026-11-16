"""Fix partial indexes for open and partial orders

Revision ID: b486b686713f
Revises: cbe7508b0284
Create Date: 2025-08-17 08:06:51.361184

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b486b686713f'
down_revision: Union[str, Sequence[str], None] = 'cbe7508b0284'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    ctx = op.get_context()
    with ctx.autocommit_block():
        op.execute("DROP INDEX CONCURRENTLY IF EXISTS idx_ask_open;")
        op.execute("DROP INDEX CONCURRENTLY IF EXISTS idx_bid_open;")
        op.execute("""
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ask_open_partial
            ON ordenes (producto_id, precio_limite ASC, timestamp ASC)
            WHERE estado IN ('abierta', 'parcialmente_ejecutada') AND tipo_orden = 'venta';
        """)
        op.execute("""
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bid_open_partial
            ON ordenes (producto_id, precio_limite DESC, timestamp ASC)
            WHERE estado IN ('abierta', 'parcialmente_ejecutada') AND tipo_orden = 'compra';
        """)


def downgrade() -> None:
    """Downgrade schema."""
    ctx = op.get_context()
    with ctx.autocommit_block():
        op.execute("DROP INDEX CONCURRENTLY IF EXISTS idx_ask_open_partial;")
        op.execute("DROP INDEX CONCURRENTLY IF EXISTS idx_bid_open_partial;")
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
