"""Frozen Alembic-generated commerce schema. No seed orders or payments."""
from alembic import op
import sqlalchemy as sa

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('commerce_quotes',
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('customer_id', sa.String(length=255), nullable=False),
    sa.Column('request', sa.JSON(), nullable=False),
    sa.Column('snapshot', sa.JSON(), nullable=False),
    sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['customer_id'], ['app_profiles.id'], ondelete='RESTRICT'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_commerce_quotes_customer_id'), 'commerce_quotes', ['customer_id'], unique=False)
    op.create_index(op.f('ix_commerce_quotes_expires_at'), 'commerce_quotes', ['expires_at'], unique=False)
    op.create_table('commerce_orders',
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('customer_id', sa.String(length=255), nullable=False),
    sa.Column('quote_id', sa.String(length=36), nullable=False),
    sa.Column('request_key', sa.String(length=128), nullable=False),
    sa.Column('request_hash', sa.String(length=64), nullable=False),
    sa.Column('customer_email', sa.String(length=320), nullable=False),
    sa.Column('shipping', sa.JSON(), nullable=False),
    sa.Column('subtotal', sa.Numeric(precision=18, scale=2), nullable=False),
    sa.Column('delivery', sa.Numeric(precision=18, scale=2), nullable=False),
    sa.Column('total', sa.Numeric(precision=18, scale=2), nullable=False),
    sa.Column('currency', sa.String(length=3), nullable=False),
    sa.Column('status', sa.String(length=24), nullable=False),
    sa.Column('review_reason', sa.String(length=100), nullable=True),
    sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.CheckConstraint("status IN ('awaiting_payment','paid','cancelled','expired','payment_review')"),
    sa.CheckConstraint('subtotal >= 0 AND delivery >= 0 AND total > 0'),
    sa.ForeignKeyConstraint(['customer_id'], ['app_profiles.id'], ondelete='RESTRICT'),
    sa.ForeignKeyConstraint(['quote_id'], ['commerce_quotes.id'], ondelete='RESTRICT'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('customer_id', 'request_key'),
    sa.UniqueConstraint('quote_id')
    )
    op.create_index(op.f('ix_commerce_orders_customer_id'), 'commerce_orders', ['customer_id'], unique=False)
    op.create_index(op.f('ix_commerce_orders_expires_at'), 'commerce_orders', ['expires_at'], unique=False)
    op.create_index(op.f('ix_commerce_orders_status'), 'commerce_orders', ['status'], unique=False)
    op.create_table('commerce_order_items',
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('order_id', sa.String(length=36), nullable=False),
    sa.Column('product_id', sa.String(length=36), nullable=True),
    sa.Column('snapshot', sa.JSON(), nullable=False),
    sa.Column('quantity', sa.Integer(), nullable=False),
    sa.Column('unit_price', sa.Numeric(precision=18, scale=2), nullable=False),
    sa.Column('position', sa.Integer(), nullable=False),
    sa.CheckConstraint('quantity > 0 AND unit_price > 0'),
    sa.ForeignKeyConstraint(['order_id'], ['commerce_orders.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['product_id'], ['catalog_products.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_commerce_order_items_order_id'), 'commerce_order_items', ['order_id'], unique=False)
    op.create_table('commerce_reservations',
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('order_id', sa.String(length=36), nullable=False),
    sa.Column('product_id', sa.String(length=36), nullable=True),
    sa.Column('quantity', sa.Integer(), nullable=False),
    sa.Column('status', sa.String(length=12), nullable=False),
    sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
    sa.CheckConstraint("status IN ('held','consumed','released')"),
    sa.CheckConstraint('quantity > 0'),
    sa.ForeignKeyConstraint(['order_id'], ['commerce_orders.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['product_id'], ['catalog_products.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('order_id', 'product_id')
    )
    op.create_index(op.f('ix_commerce_reservations_expires_at'), 'commerce_reservations', ['expires_at'], unique=False)
    op.create_index(op.f('ix_commerce_reservations_order_id'), 'commerce_reservations', ['order_id'], unique=False)
    op.create_index(op.f('ix_commerce_reservations_product_id'), 'commerce_reservations', ['product_id'], unique=False)
    op.create_table('commerce_payment_attempts',
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('order_id', sa.String(length=36), nullable=False),
    sa.Column('request_key', sa.String(length=128), nullable=False),
    sa.Column('status', sa.String(length=20), nullable=False),
    sa.Column('checkout_id', sa.String(length=200), nullable=True),
    sa.Column('checkout_url', sa.String(length=1000), nullable=True),
    sa.Column('provider_request', sa.JSON(), nullable=False),
    sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['order_id'], ['commerce_orders.id'], ondelete='RESTRICT'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('checkout_id'),
    sa.UniqueConstraint('order_id', 'request_key')
    )
    op.create_index(op.f('ix_commerce_payment_attempts_order_id'), 'commerce_payment_attempts', ['order_id'], unique=False)
    op.create_table('commerce_webhook_events',
    sa.Column('id', sa.String(length=200), nullable=False),
    sa.Column('body_hash', sa.String(length=64), nullable=False),
    sa.Column('event_type', sa.String(length=100), nullable=False),
    sa.Column('outcome', sa.String(length=100), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('commerce_payment_audits',
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('order_id', sa.String(length=36), nullable=True),
    sa.Column('attempt_id', sa.String(length=36), nullable=True),
    sa.Column('event_id', sa.String(length=200), nullable=True),
    sa.Column('charge_id', sa.String(length=200), nullable=True),
    sa.Column('kind', sa.String(length=80), nullable=False),
    sa.Column('amount', sa.Numeric(precision=18, scale=2), nullable=True),
    sa.Column('currency', sa.String(length=10), nullable=True),
    sa.Column('actor_id', sa.String(length=255), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['attempt_id'], ['commerce_payment_attempts.id'], ondelete='RESTRICT'),
    sa.ForeignKeyConstraint(['event_id'], ['commerce_webhook_events.id'], ondelete='RESTRICT'),
    sa.ForeignKeyConstraint(['order_id'], ['commerce_orders.id'], ondelete='RESTRICT'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('charge_id')
    )
    op.create_index(op.f('ix_commerce_payment_audits_order_id'), 'commerce_payment_audits', ['order_id'], unique=False)
    # ### end Alembic commands ###

def downgrade():
    op.drop_table("commerce_payment_audits")
    op.drop_table("commerce_webhook_events")
    op.drop_table("commerce_payment_attempts")
    op.drop_table("commerce_reservations")
    op.drop_table("commerce_order_items")
    op.drop_table("commerce_orders")
    op.drop_table("commerce_quotes")

