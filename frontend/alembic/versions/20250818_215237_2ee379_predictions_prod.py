"""P2.3 prerequisite: create predictions_prod table

Revision ID: 20250818_215237_2ee379
Revises: 20250818_214346_044f85
Create Date: 2025-08-18 21:52:37
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20250818_215237_2ee379"
down_revision = "20250818_214346_044f85"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        "predictions_prod",
        sa.Column("id", sa.BigInteger(), sa.Identity(always=False), primary_key=True),
        sa.Column("model_id", sa.BigInteger(), sa.ForeignKey("ml_models.id", ondelete="SET NULL"), nullable=True),
        sa.Column("y_true", sa.Float(), nullable=False),
        sa.Column("y_pred", sa.Float(), nullable=False),
        sa.Column("ts", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("correlation_id", sa.CHAR(32), nullable=True),
        sa.Column("segment", sa.Text(), nullable=True),
        sa.Column("horizon", sa.Integer(), nullable=True),
    )
    op.create_index("idx_predictions_prod_ts", "predictions_prod", ["ts"], unique=False)
    op.create_index("idx_predictions_prod_model_ts", "predictions_prod", ["model_id", "ts"], unique=False)
    op.create_index("idx_predictions_prod_corr", "predictions_prod", ["correlation_id"], unique=False)

def downgrade() -> None:
    op.drop_index("idx_predictions_prod_corr", table_name="predictions_prod")
    op.drop_index("idx_predictions_prod_model_ts", table_name="predictions_prod")
    op.drop_index("idx_predictions_prod_ts", table_name="predictions_prod")
    op.drop_table("predictions_prod")
