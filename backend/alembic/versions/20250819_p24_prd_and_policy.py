"""P2.4: create market_commission_policy and prd_series tables

Revision ID: 20250819_p24_prd_and_policy
Revises: 20250818_215237_2ee379
Create Date: 2025-08-19 10:00:00
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20250819_p24_prd_and_policy"
down_revision = "20250818_215237_2ee379"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "market_commission_policy",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("valid_from", sa.DateTime(timezone=True), nullable=False),
        sa.Column("valid_to", sa.DateTime(timezone=True), nullable=True),
        sa.Column("pbase_azucar", sa.Float(), nullable=False),
        sa.Column("k_factor", sa.Float(), nullable=False),
        sa.Column("justification", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("created_by", sa.Text(), nullable=True),
        sa.Column("correlation_id", sa.CHAR(32), nullable=True),
        sa.UniqueConstraint("name","valid_from", name="uq_mcp_name_from"),
    )
    op.create_index("idx_mcp_name_from","market_commission_policy",["name","valid_from"], unique=False)

    op.create_table(
        "prd_series",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("segment", sa.Text(), nullable=True),
        sa.Column("valid_from", sa.DateTime(timezone=True), nullable=False),
        sa.Column("valid_to", sa.DateTime(timezone=True), nullable=True),
        sa.Column("prd_value", sa.Float(), nullable=False),
        sa.Column("stock_open", sa.Float(), nullable=False),
        sa.Column("domestic_demand", sa.Float(), nullable=False),
        sa.Column("exportable_balance", sa.Float(), nullable=False),
        sa.Column("policy_id", sa.BigInteger(), sa.ForeignKey("market_commission_policy.id", ondelete="RESTRICT"), nullable=True),
        sa.Column("model_id",  sa.BigInteger(), sa.ForeignKey("ml_models.id", ondelete="SET NULL"), nullable=True),
        sa.Column("inputs_hash", sa.CHAR(64), nullable=True),
        sa.Column("mix", sa.JSON(), nullable=True),
        sa.Column("justification", sa.Text(), nullable=True),
        sa.Column("correlation_id", sa.CHAR(32), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("idx_prd_segment_from","prd_series",["segment","valid_from"], unique=False)
    op.create_index("idx_prd_inputs_hash","prd_series",["inputs_hash"], unique=False)
    op.create_index("idx_prd_corr","prd_series",["correlation_id"], unique=False)

    # Opcional (Postgres): evitar solapamientos de vigencia por (name) y por (segment)
    try:
        op.execute("CREATE EXTENSION IF NOT EXISTS btree_gist;")
        op.execute("""
          ALTER TABLE market_commission_policy ADD CONSTRAINT mcp_name_no_overlap EXCLUDE USING gist (
            name WITH =,
            tstzrange(valid_from, COALESCE(valid_to, 'infinity')) WITH &&
          );
        """)
        op.execute("""
          ALTER TABLE prd_series ADD CONSTRAINT prd_segment_no_overlap EXCLUDE USING gist (
            COALESCE(segment, '__all__') WITH =,
            tstzrange(valid_from, COALESCE(valid_to, 'infinity')) WITH &&
          );
        """)
    except Exception as e:
        print(e)
        pass

def downgrade():
    try:
        op.execute("ALTER TABLE prd_series DROP CONSTRAINT IF EXISTS prd_segment_no_overlap;")
        op.execute("ALTER TABLE market_commission_policy DROP CONSTRAINT IF EXISTS mcp_name_no_overlap;")
    except Exception as e:
        print(e)
        pass
    op.drop_index("idx_prd_corr", table_name="prd_series")
    op.drop_index("idx_prd_inputs_hash", table_name="prd_series")
    op.drop_index("idx_prd_segment_from", table_name="prd_series")
    op.drop_table("prd_series")
    op.drop_index("idx_mcp_name_from", table_name="market_commission_policy")
    op.drop_table("market_commission_policy")
