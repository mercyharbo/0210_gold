import hashlib
import json
from datetime import datetime, timezone
from sqlalchemy import select, text
from app.core.errors import AppError
from app.models.commerce import Order


def now():
    return datetime.now(timezone.utc)


def reject(code, message, status=409, field=None):
    raise AppError(code=code, message=message, status_code=status,
                   field_errors={field: [message]} if field else None)


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


async def advisory(session, key):
    """Transaction lock for durable idempotency, also across multiple server processes."""
    lock_id = int.from_bytes(hashlib.sha256(key.encode()).digest()[:8], "big", signed=True)
    await session.execute(text("SELECT pg_advisory_xact_lock(:key)"), {"key": lock_id})


async def owned_order(session, identifier, customer_id=None, lock=False):
    query = select(Order).where(Order.id == identifier)
    if customer_id is not None:
        query = query.where(Order.customer_id == customer_id)
    if lock:
        query = query.with_for_update().execution_options(populate_existing=True)
    order = await session.scalar(query)
    if not order:
        reject("ORDER_NOT_FOUND", "Order was not found.", 404)
    return order
