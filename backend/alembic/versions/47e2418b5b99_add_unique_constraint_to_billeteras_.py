"""Add unique constraint to billeteras_activos

Revision ID: 47e2418b5b99
Revises: d5226a8aa52b
Create Date: 2025-08-17 09:08:24.253727

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '47e2418b5b99'
down_revision: Union[str, Sequence[str], None] = 'd5226a8aa52b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_unique_constraint(
        "uq_billetera_activo", "billeteras_activos", ["usuario_id", "producto_id"]
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint("uq_billetera_activo", "billeteras_activos", type_="unique")