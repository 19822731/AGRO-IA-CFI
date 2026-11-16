"""merge heads

Revision ID: 20250818_150744_1f31bf
Revises: 47e2418b5b99, 20250818_c56673a3
Create Date: 2025-08-18 15:07:44
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20250818_150744_1f31bf"
down_revision = ("47e2418b5b99", "20250818_c56673a3")
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Merge revision; no schema changes.
    pass

def downgrade() -> None:
    # This is a pure merge; usually no downgrade steps.
    pass
