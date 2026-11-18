from pydantic import ValidationError
from sqlalchemy import select, update
from app.models.account import Address
from app.schemas.account import AddressBody, AddressData
from app.services.account import lock_customer
from app.services.commerce_common import reject


def data(row):
    return AddressData.model_validate(row, from_attributes=True)


async def owned(session, customer_id, identifier):
    row = await session.scalar(select(Address).where(Address.id == identifier, Address.customer_id == customer_id))
    if not row:
        reject("ADDRESS_NOT_FOUND", "Address was not found.", 404)
    return row


async def choose_default(session, customer_id, row):
    await session.execute(update(Address).where(Address.customer_id == customer_id, Address.is_default.is_(True))
        .values(is_default=False))
    row.is_default = True


async def listing(session, customer_id):
    rows = (await session.scalars(select(Address).where(Address.customer_id == customer_id)
        .order_by(Address.is_default.desc(), Address.created_at, Address.id))).all()
    return [data(row) for row in rows]


async def create(session, customer_id, body):
    await lock_customer(session, customer_id)
    first = await session.scalar(select(Address.id).where(Address.customer_id == customer_id).limit(1))
    row = Address(customer_id=customer_id, **body.model_dump(exclude={"is_default"}))
    session.add(row)
    if body.is_default or not first:
        # Clear the old default before inserting the new one (partial unique index).
        await session.execute(update(Address).where(Address.customer_id == customer_id)
            .values(is_default=False).execution_options(autoflush=False))
        row.is_default = True
    await session.commit()
    await session.refresh(row)
    return data(row)


async def patch(session, customer_id, identifier, body):
    await lock_customer(session, customer_id)
    row = await owned(session, customer_id, identifier)
    values = {field: getattr(row, field) for field in AddressBody.model_fields}
    values.update(body.model_dump(exclude_unset=True))
    try:
        validated = AddressBody.model_validate(values)
    except ValidationError as error:
        fields = {'.'.join(map(str, item['loc'])) or 'address': [item['msg']] for item in error.errors()}
        from app.core.errors import AppError
        raise AppError(code="INVALID_ADDRESS", message="Check the address fields.", status_code=422, field_errors=fields) from None
    for key, value in validated.model_dump().items():
        setattr(row, key, value)
    await session.commit()
    return data(row)


async def set_default(session, customer_id, identifier):
    await lock_customer(session, customer_id)
    row = await owned(session, customer_id, identifier)
    await choose_default(session, customer_id, row)
    await session.commit()
    return data(row)


async def remove(session, customer_id, identifier):
    await lock_customer(session, customer_id)
    row = await owned(session, customer_id, identifier)
    was_default = row.is_default
    await session.delete(row)
    await session.flush()
    if was_default:
        replacement = await session.scalar(select(Address).where(Address.customer_id == customer_id)
            .order_by(Address.created_at, Address.id).limit(1))
        if replacement:
            replacement.is_default = True
    await session.commit()
    return {"deleted": True}
