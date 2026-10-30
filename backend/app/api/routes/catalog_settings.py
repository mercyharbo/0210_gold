from fastapi import APIRouter, Depends
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.catalog_docs import ERRORS
from app.db.session import get_db_session
from app.models.catalog import GoldRate, StoreSettings
from app.schemas.catalog_settings import RateBody, RateData, SettingsBody
from app.schemas.envelope import ApiSuccess
from app.services.catalog import fail
from app.services.identity import require_admin

router = APIRouter(tags=["catalog settings"], responses=ERRORS)


@router.get("/catalog/settings", response_model=ApiSuccess[SettingsBody], operation_id="getStorefrontSettings",
            summary="Read safe store configuration", description="Public. Contains store contact information and NGN shipping/currency display configuration only. No secrets or payment/security controls.")
async def settings(session: AsyncSession = Depends(get_db_session)):
    row = await session.get(StoreSettings, 1)
    return ApiSuccess(status=200, data=SettingsBody.model_validate(row.values if row else {}))


@router.put("/admin/settings", response_model=ApiSuccess[SettingsBody], operation_id="replaceStoreSettings",
            dependencies=[Depends(require_admin)], summary="Replace store configuration",
            description="Requires administrator. Full JSON replacement. Amounts are NGN; FX rates are NGN per unit of foreign currency. Does not configure payments, notifications, sessions or MFA.")
async def update_settings(body: SettingsBody, session: AsyncSession = Depends(get_db_session)):
    row = await session.get(StoreSettings, 1)
    if not row:
        row = StoreSettings(id=1)
        session.add(row)
    row.values = body.model_dump(mode="json")
    await session.commit()
    return ApiSuccess(status=200, data=body)


@router.get("/catalog/gold-rates", response_model=ApiSuccess[list[RateData]], operation_id="getGoldRates",
            summary="Read manually configured per-gram rates", description="Public. Empty until configured; missing karats are unavailable, never replaced with fictional default prices. UTC update timestamps.")
async def gold_rates(session: AsyncSession = Depends(get_db_session)):
    rows = (await session.scalars(select(GoldRate).order_by(GoldRate.karat))).all()
    return ApiSuccess(status=200, data=[RateData(karat=row.karat, rate=row.rate, updated_at=row.updated_at) for row in rows])


@router.put("/admin/gold-rates", response_model=ApiSuccess[list[RateData]], operation_id="replaceGoldRates",
            dependencies=[Depends(require_admin)], summary="Set manual gold rates",
            description="Requires administrator. Replace all configured rates, NGN per gram, positive decimals. Omitted karats become unavailable. No external pricing service is called.")
async def update_rates(body: RateBody, session: AsyncSession = Depends(get_db_session)):
    if any(rate <= 0 for rate in body.rates.values()):
        fail("INVALID_RATE", "Gold rates must be above zero.", field="rates")
    await session.execute(delete(GoldRate))
    session.add_all(GoldRate(karat=karat, rate=rate) for karat, rate in body.rates.items())
    await session.commit()
    return await gold_rates(session)
