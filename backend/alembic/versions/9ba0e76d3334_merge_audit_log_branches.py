"""merge audit log branches

Revision ID: 9ba0e76d3334
Revises: b351e9119b21
Create Date: 2025-08-20 07:49:44.138960

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9ba0e76d3334'
down_revision: Union[str, Sequence[str], None] = 'b351e9119b21'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
