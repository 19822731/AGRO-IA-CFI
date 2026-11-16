"""P2.2: create data_ingesta and data_provenance

Revision ID: 20250818_c56673a3
Revises: da0de61deb6e
Create Date: 2025-08-18 14:45:50
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20250818_c56673a3"
down_revision = "da0de61deb6e"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        "data_ingesta",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("fuente", sa.Text(), nullable=False),
        sa.Column("hash_sha256", sa.CHAR(64), nullable=False),
        sa.Column("version", sa.Text(), nullable=False),
        sa.Column("rango_desde", sa.Date(), nullable=True),
        sa.Column("rango_hasta", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("fuente", "hash_sha256", name="uq_data_ingesta_fuente_hash"),
    )
    op.create_index("idx_data_ingesta_created_at", "data_ingesta", ["created_at"], unique=False)
    op.create_index("idx_data_ingesta_fuente", "data_ingesta", ["fuente"], unique=False)

    op.create_table(
        "data_provenance",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("tabla_destino", sa.Text(), nullable=False),
        sa.Column("data_ingesta_id", sa.BigInteger(), sa.ForeignKey("data_ingesta.id", ondelete="CASCADE"), nullable=False),
        sa.Column("transform_hash", sa.CHAR(64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("idx_data_provenance_tabla", "data_provenance", ["tabla_destino"], unique=False)
    op.create_index("idx_data_provenance_created_at", "data_provenance", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_index("idx_data_provenance_created_at", table_name="data_provenance")
    op.drop_index("idx_data_provenance_tabla", table_name="data_provenance")
    op.drop_table("data_provenance")

    op.drop_index("idx_data_ingesta_fuente", table_name="data_ingesta")
    op.drop_index("idx_data_ingesta_created_at", table_name="data_ingesta")
    op.drop_constraint("uq_data_ingesta_fuente_hash", "data_ingesta", type_="unique")
    op.drop_table("data_ingesta")
