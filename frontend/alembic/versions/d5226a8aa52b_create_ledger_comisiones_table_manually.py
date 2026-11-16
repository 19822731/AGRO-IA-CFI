"""Create ledger_comisiones table

Revision ID: d5226a8aa52b
Revises: b6020494aa86
Create Date: 2025-08-17 08:48:08.383705

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd5226a8aa52b'
down_revision: Union[str, Sequence[str], None] = 'b6020494aa86'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        "ledger_comisiones",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column(
            "transaccion_id",
            sa.Integer,
            sa.ForeignKey("transacciones.id", ondelete="CASCADE"),
            nullable=False,
            unique=True
        ),
        sa.Column("monto", sa.Numeric(18, 4), nullable=False),
        sa.Column("moneda", sa.String(), nullable=False, server_default="ARS"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()"))
    )
    op.create_check_constraint(
        "ck_ledger_comisiones_monto_nonneg", "ledger_comisiones", "monto >= 0"
    )
    op.create_index("ix_ledger_comisiones_created_at", "ledger_comisiones", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_ledger_comisiones_created_at", table_name="ledger_comisiones")
    op.drop_table("ledger_comisiones")
