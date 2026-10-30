"""Allow the gold_karats option kind without truncation."""
from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column("catalog_product_options", "kind", type_=sa.String(20), existing_type=sa.String(10))


def downgrade():
    op.alter_column("catalog_product_options", "kind", type_=sa.String(10), existing_type=sa.String(20))
