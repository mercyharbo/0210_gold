from uuid import UUID
from fastapi import APIRouter
from app.api.account_docs import Customer, Session, ERRORS, PRIVATE, PageNumber, PageSize
from app.schemas.account import AddressCreate, AddressData, AddressPatch, Page, PreferencesBody, ProfilePatch, WishlistData
from app.schemas.auth import ProfileData
from app.schemas.catalog import Deleted
from app.schemas.envelope import ApiSuccess
from app.schemas.operations import ChangedData
from app.services import account, addresses, wishlist

router = APIRouter(prefix="/account", tags=["customer account"], responses=ERRORS)


@router.get("/profile", response_model=ApiSuccess[ProfileData], operation_id="getAccountProfile",
    summary="Read your application profile", description=PRIVATE + "Email and role are server-owned; no body.")
async def profile(customer: Customer):
    return ApiSuccess(status=200, data=ProfileData.model_validate(customer))


@router.patch("/profile", response_model=ApiSuccess[ProfileData], operation_id="patchAccountProfile",
    summary="Update your contact profile", description=PRIVATE + "Partial JSON update of first_name, last_name and phone. Null clears an optional value; omitted fields are unchanged. Identity email, role and verification are forbidden.")
async def update_profile(body: ProfilePatch, session: Session, customer: Customer):
    return ApiSuccess(status=200, data=await account.patch_profile(session, customer, body))


@router.get("/category-preferences", response_model=ApiSuccess[PreferencesBody], operation_id="getCategoryPreferences",
    summary="Read preferred categories", description=PRIVATE + "Returns category UUIDs, sorted by ID.")
async def preferences(session: Session, customer: Customer):
    return ApiSuccess(status=200, data=await account.preferences(session, customer.id))


@router.put("/category-preferences", response_model=ApiSuccess[PreferencesBody], operation_id="replaceCategoryPreferences",
    summary="Replace preferred categories", description=PRIVATE + "Complete, atomic replacement. Up to 100 unique active category UUIDs; an empty list clears preferences.")
async def update_preferences(body: PreferencesBody, session: Session, customer: Customer):
    return ApiSuccess(status=200, data=await account.replace_preferences(session, customer.id, body))


@router.get("/addresses", response_model=ApiSuccess[list[AddressData]], operation_id="listOwnedAddresses",
    summary="List your saved addresses", description=PRIVATE + "Default first, then oldest creation timestamp and ID. No body.")
async def address_list(session: Session, customer: Customer):
    return ApiSuccess(status=200, data=await addresses.listing(session, customer.id))


@router.post("/addresses", status_code=201, response_model=ApiSuccess[AddressData], operation_id="createOwnedAddress",
    summary="Save a Nigerian delivery address", description=PRIVATE + "JSON address fields use bundled Nigerian state/FCT and local government area values. First address becomes default automatically. is_default=true atomically replaces the current default. Saved addresses do not alter placed orders.")
async def address_create(body: AddressCreate, session: Session, customer: Customer):
    return ApiSuccess(status=201, data=await addresses.create(session, customer.id, body))


@router.patch("/addresses/{identifier}", response_model=ApiSuccess[AddressData], operation_id="patchOwnedAddress",
    summary="Edit your saved address", description=PRIVATE + "Partial JSON update; merged address is validated. Required fields cannot be null. Change defaults through the separate default endpoint; country remains Nigeria.")
async def address_patch(identifier: UUID, body: AddressPatch, session: Session, customer: Customer):
    return ApiSuccess(status=200, data=await addresses.patch(session, customer.id, str(identifier), body))


@router.delete("/addresses/{identifier}", response_model=ApiSuccess[Deleted], operation_id="deleteOwnedAddress",
    summary="Delete your saved address", description=PRIVATE + "No body. If default, selects the oldest remaining address with ID as tie-breaker; otherwise leaves default unchanged. Existing order snapshots are preserved.")
async def address_delete(identifier: UUID, session: Session, customer: Customer):
    return ApiSuccess(status=200, data=await addresses.remove(session, customer.id, str(identifier)))


@router.put("/addresses/{identifier}/default", response_model=ApiSuccess[AddressData], operation_id="setDefaultAddress",
    summary="Choose your default address", description=PRIVATE + "No body. Idempotent and serialized per customer; at most one address is default, including concurrent calls.")
async def address_default(identifier: UUID, session: Session, customer: Customer):
    return ApiSuccess(status=200, data=await addresses.set_default(session, customer.id, str(identifier)))


@router.get("/wishlist", response_model=ApiSuccess[Page[WishlistData]], operation_id="listOwnedWishlist",
    summary="Read your wishlist", description=PRIVATE + "Newest first. Includes calculated display_price (whole NGN) and first image/alt, or null when no image exists. Availability accounts for active catalog/category, stock and price; unavailable saved products remain visible until removed or deleted from catalog.")
async def wishlist_list(session: Session, customer: Customer, page: PageNumber = 1, page_size: PageSize = 24):
    return ApiSuccess(status=200, data=await wishlist.listing(session, customer.id, page, page_size))


@router.put("/wishlist/{product_id}", response_model=ApiSuccess[ChangedData], operation_id="addWishlistProduct",
    summary="Save a product", description=PRIVATE + "No body. Product UUID must be publicly active. Idempotent unique customer/product membership; changed is 1 only when inserted.")
async def wishlist_add(product_id: UUID, session: Session, customer: Customer):
    return ApiSuccess(status=200, data=await wishlist.membership(session, customer.id, str(product_id), True))


@router.delete("/wishlist/{product_id}", response_model=ApiSuccess[ChangedData], operation_id="removeWishlistProduct",
    summary="Remove a saved product", description=PRIVATE + "No body. Idempotent even when absent; changed is the number removed.")
async def wishlist_remove(product_id: UUID, session: Session, customer: Customer):
    return ApiSuccess(status=200, data=await wishlist.membership(session, customer.id, str(product_id), False))
