"""Create api_audit_log table

Revision ID: 20250819_p32_api_audit
Revises: 20250819_p3_rbac_init
Create Date: 2025-08-19 14:00:00
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20250819_p32_api_audit'
down_revision = '20250819_p3_rbac_init'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "api_audit_log",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("correlation_id", sa.CHAR(32), nullable=True),
        sa.Column("endpoint", sa.Text(), nullable=False),
        sa.Column("method", sa.String(10), nullable=False),
        sa.Column("status_code", sa.Integer(), nullable=True),
        sa.Column("user_sub", sa.Text(), nullable=True),
        sa.Column("user_roles", sa.Text(), nullable=True),
    )
    op.create_index("idx_audit_log_timestamp", "api_audit_log", ["timestamp"], unique=False)
    op.create_index("idx_audit_log_corr_id", "api_audit_log", ["correlation_id"], unique=False)
    op.create_index("idx_audit_log_endpoint", "api_audit_log", ["endpoint"], unique=False)
    op.create_index("idx_audit_log_user_sub", "api_audit_log", ["user_sub"], unique=False)


def downgrade() -> None:
    op.drop_index("idx_audit_log_user_sub", table_name="api_audit_log")
    op.drop_index("idx_audit_log_endpoint", table_name="api_audit_log")
    op.drop_index("idx_audit_log_corr_id", table_name="api_audit_log")
    op.drop_index("idx_audit_log_timestamp", table_name="api_audit_log")
    op.drop_table("api_audit_log")
