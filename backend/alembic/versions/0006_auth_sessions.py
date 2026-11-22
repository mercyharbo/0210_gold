"""Backend-owned cookie sessions and single-use Google transactions."""
from alembic import op
import sqlalchemy as sa

revision = "0006_auth_sessions"
down_revision = "0005_product_sales"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table("auth_sessions",
        sa.Column("token_hash", sa.String(64), primary_key=True),
        sa.Column("subject", sa.String(255), nullable=False),
        sa.Column("provider_credentials", sa.Text(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))
    op.create_index("ix_auth_sessions_subject", "auth_sessions", ["subject"])
    op.create_index("ix_auth_sessions_expires_at", "auth_sessions", ["expires_at"])
    op.create_table("auth_oauth_transactions",
        sa.Column("token_hash", sa.String(64), primary_key=True),
        sa.Column("state_hash", sa.String(64), nullable=False),
        sa.Column("provider_credentials", sa.Text(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False))
    op.create_index("ix_auth_oauth_transactions_expires_at", "auth_oauth_transactions", ["expires_at"])


def downgrade():
    op.drop_table("auth_oauth_transactions")
    op.drop_table("auth_sessions")
