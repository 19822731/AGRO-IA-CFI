"""add unique constraint to prd_series inputs_hash

Revision ID: 20250819_p24b_short_hash
Revises: 20250819_p24_prd_and_policy
Create Date: 2025-08-19 11:00:00
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20250819_p24b_short_hash'
down_revision = '20250819_p24_prd_and_policy'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_unique_constraint('uq_prd_inputs_hash', 'prd_series', ['inputs_hash'])


def downgrade() -> None:
    op.drop_constraint('uq_prd_inputs_hash', 'prd_series', type_='unique')
