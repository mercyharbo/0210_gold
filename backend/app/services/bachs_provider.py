"""The only network boundary for Bachs. No fallback payments or frontend credentials."""
from urllib.parse import urlsplit
from bachs import AsyncBachs, BachsApiError, BachsError, webhooks, BachsWebhookError
from app.core.config import get_settings
from app.services.commerce_common import reject


def configured():
    settings = get_settings()
    if not settings.bachs_api_key or not settings.bachs_organization_id:
        reject("PAYMENT_NOT_CONFIGURED", "Bachs sandbox payments are not configured.", 503)
    # Phase 4 is sandbox only. Live money requires a separate production activation.
    if not settings.bachs_api_key.startswith("sk_sandbox_"):
        reject("PAYMENT_ENVIRONMENT_DISABLED", "Only Bachs sandbox credentials are enabled in this phase.", 503)
    return settings


def client():
    settings = configured()
    return AsyncBachs(api_key=settings.bachs_api_key, environment="sandbox", timeout=20, max_retries=0)


class ProviderFailure(Exception):
    def __init__(self, unknown):
        self.unknown = unknown


async def create_session(payload, request_key):
    try:
        async with client() as provider:
            result = await provider.checkout_sessions.create(**payload, idempotency_key=request_key)
            data = result.to_dict()
            host = urlsplit(data["checkout_url"])
            if host.scheme != "https" or not (host.hostname == "checkout.bachs.io" or
                (host.hostname or "").endswith(".bachs.io")):
                raise ProviderFailure(True)
            return data
    except BachsError as error:
        raise ProviderFailure(getattr(error, "outcome_unknown", not isinstance(error, BachsApiError))) from None


async def retrieve_session(checkout_id):
    try:
        async with client() as provider:
            return (await provider.checkout_sessions.get(checkout_id)).to_dict()
    except BachsError:
        reject("PAYMENT_PROVIDER_UNAVAILABLE", "Bachs verification is temporarily unavailable.", 503)


def verify_webhook(raw, headers):
    settings = configured()
    if not settings.bachs_webhook_secret:
        reject("WEBHOOK_NOT_CONFIGURED", "Webhook verification is not configured.", 503)
    try:
        return webhooks.construct_event(raw, headers, settings.bachs_webhook_secret, tolerance=300).to_dict()
    except BachsWebhookError:
        reject("INVALID_WEBHOOK", "Invalid webhook signature, timestamp or envelope.", 400)
