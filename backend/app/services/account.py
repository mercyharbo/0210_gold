from sqlalchemy import delete, func, select
from app.models.catalog import Category, CategoryPreference
from app.models.profile import Profile
from app.models.commerce import Order
from app.schemas.auth import ProfileData
from app.schemas.account import CustomerData
from app.services.commerce_common import reject


async def lock_customer(session, customer_id):
    return await session.scalar(select(Profile).where(Profile.id == customer_id)
        .with_for_update().execution_options(populate_existing=True))


async def patch_profile(session, profile, body):
    row = await lock_customer(session, profile.id)
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    await session.commit()
    await session.refresh(row)
    return ProfileData.model_validate(row)


async def preferences(session, customer_id):
    ids = (await session.scalars(select(CategoryPreference.category_id).where(
        CategoryPreference.profile_id == customer_id).order_by(CategoryPreference.category_id))).all()
    return {"category_ids": ids}


async def replace_preferences(session, customer_id, body):
    await lock_customer(session, customer_id)
    ids = [str(identifier) for identifier in body.category_ids]
    found = (await session.scalars(select(Category.id).where(Category.id.in_(ids), Category.is_active.is_(True)))).all()
    if set(found) != set(ids):
        reject("INVALID_CATEGORY", "Choose active, existing categories.", 422, "category_ids")
    await session.execute(delete(CategoryPreference).where(CategoryPreference.profile_id == customer_id))
    session.add_all(CategoryPreference(profile_id=customer_id, category_id=identifier) for identifier in ids)
    await session.commit()
    return await preferences(session, customer_id)


async def page_rows(session, query, page, page_size):
    total = await session.scalar(select(func.count()).select_from(query.order_by(None).subquery()))
    rows = (await session.scalars(query.offset((page - 1) * page_size).limit(page_size))).all()
    return rows, {"total": total, "page": page, "page_size": page_size}


async def customer_summary(session, identifier):
    profile = await session.get(Profile, identifier)
    if not profile:
        reject("CUSTOMER_NOT_FOUND", "Customer was not found.", 404)
    count = await session.scalar(select(func.count()).select_from(Order).where(Order.customer_id == identifier))
    paid_count, total = (await session.execute(select(func.count(), func.coalesce(func.sum(Order.total), 0))
        .where(Order.customer_id == identifier, Order.status == "paid"))).one()
    return CustomerData(profile=ProfileData.model_validate(profile), order_count=count,
        paid_order_count=paid_count, paid_total=format(total, '.2f'))
