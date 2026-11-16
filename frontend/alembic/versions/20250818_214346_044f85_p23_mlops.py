"""P2.3: create ml_models and ml_metrics

Revision ID: 20250818_214346_044f85
Revises: 20250818_150744_1f31bf
Create Date: 2025-08-18 21:43:46
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20250818_214346_044f85"
down_revision = "20250818_150744_1f31bf"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        "ml_models",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("version", sa.Text(), nullable=False),
        sa.Column("dataset_hash", sa.CHAR(64), nullable=True),
        sa.Column("params", sa.JSON(), nullable=True),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("name", "version", name="uq_ml_models_name_version"),
    )
    op.create_index("idx_ml_models_name", "ml_models", ["name"], unique=False)
    op.create_index("idx_ml_models_active", "ml_models", ["active"], unique=False)

    # Postgres: índice parcial para garantizar un 'active' por name
    try:
        op.create_index(
            "uq_ml_models_one_active_per_name",
            "ml_models", ["name"],
            unique=True,
            postgresql_where=sa.text("active")
        )
    except Exception:
        # No-op for other backends like SQLite
        pass

    op.create_table(
        "ml_metrics",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("model_id", sa.BigInteger(), sa.ForeignKey("ml_models.id", ondelete="CASCADE"), nullable=False),
        sa.Column("split", sa.Text(), nullable=False),
        sa.Column("metric", sa.Text(), nullable=False),
        sa.Column("value", sa.Float(), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("idx_ml_metrics_model_id", "ml_metrics", ["model_id"], unique=False)
    op.create_index("idx_ml_metrics_metric_split_time", "ml_metrics", ["metric", "split", "timestamp"], unique=False)


def downgrade() -> None:
    op.drop_index("idx_ml_metrics_metric_split_time", table_name="ml_metrics")
    op.drop_index("idx_ml_metrics_model_id", table_name="ml_metrics")
    op.drop_table("ml_metrics")

    try:
        op.drop_index("uq_ml_models_one_active_per_name", table_name="ml_models", postgresql_where=sa.text("active"))
    except Exception:
        pass

    op.drop_index("idx_ml_models_active", table_name="ml_models")
    op.drop_index("idx_ml_models_name", table_name="ml_models")
    op.drop_constraint("uq_ml_models_name_version", "ml_models", type_="unique")
    op.drop_table("ml_models")
