"""Add roles to user model

Revision ID: 20250819_p3_rbac_init
Revises: 20250819_p24b_prd_inputs_hash_unique
Create Date: 2025-08-19 12:00:00
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20250819_p3_rbac_init'
down_revision = '20250819_p24b_short_hash'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('usuarios', sa.Column('roles', sa.String(), nullable=False, server_default='viewer'))


def downgrade() -> None:
    op.drop_column('usuarios', 'roles')
