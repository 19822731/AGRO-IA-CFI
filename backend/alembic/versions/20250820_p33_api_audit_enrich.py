"""add latency_ms and client_ip to api_audit_log

Revision ID: 20250820_p33_api_audit_enrich
Revises: 20250820_p33_audit_retention
Create Date: 2025-08-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250820_p33_api_audit_enrich'
down_revision = '20250820_p33_audit_retention'
branch_labels = None
depends_on = None

def upgrade():
    # This migration is redundant and its changes are included in 20250820_p33_audit_retention.
    pass

def downgrade():
    # This migration is redundant and its changes are included in 20250820_p33_audit_retention.
    pass