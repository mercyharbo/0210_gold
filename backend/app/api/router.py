from fastapi import APIRouter

from app.api.routes.health import router as health_router
from app.api.routes.auth import router as auth_router
from app.api.routes import catalog, admin_products, admin_categories, admin_banners, catalog_settings, media

api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(auth_router)

for module in (catalog, admin_products, admin_categories, admin_banners, catalog_settings, media):
    api_router.include_router(module.router)
