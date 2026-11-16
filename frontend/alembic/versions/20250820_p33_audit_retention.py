"""P3.3: add latency & client_ip to api_audit_log and indexes"""
from alembic import op
import sqlalchemy as sa

revision = "20250820_p33_audit_retention"
down_revision = "20250819_p32_api_audit"
branch_labels = None
depends_on = None

def upgrade():
    op.add_column("api_audit_log", sa.Column("latency_ms", sa.Integer(), nullable=True))
    op.add_column("api_audit_log", sa.Column("client_ip", sa.Text(), nullable=True))

    op.create_index("idx_audit_ts_status", "api_audit_log", ["timestamp", "status_code"], unique=False)

    # Índice parcial para errores (solo Postgres)
    try:
        op.execute("CREATE INDEX IF NOT EXISTS idx_audit_errors ON api_audit_log (timestamp DESC) WHERE status_code >= 400;")
    except Exception:
        pass  # en SQLite no aplica

def downgrade():
    try:
        op.execute("DROP INDEX IF EXISTS idx_audit_errors;")
    except Exception:
        pass
    op.drop_index("idx_audit_ts_status", table_name="api_audit_log")
    op.drop_column("api_audit_log", "client_ip")
    op.drop_column("api_audit_log", "latency_ms")
