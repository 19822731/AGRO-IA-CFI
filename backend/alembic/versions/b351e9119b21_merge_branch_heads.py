"""merge branch heads

Revision ID: b351e9119b21
Revises: 20250820_p33_api_audit_enrich, 20250820_p33_audit_retention
Create Date: 2025-08-20 07:40:51.213814

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b351e9119b21'
down_revision: Union[str, Sequence[str], None] = ('20250820_p33_api_audit_enrich', '20250820_p33_audit_retention')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
