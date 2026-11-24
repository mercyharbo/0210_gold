import { useCatalogSelection } from '@/stores/catalog-ui'
import { useStorefrontNavigation } from '@/stores/storefront-navigation'
import { useAdminProductsUi } from '@/stores/admin-products-ui'
import { useCatalogBrowseUi } from '@/stores/catalog-browse-ui'

export function isUserScopedKey(key: unknown) {
  return typeof key === 'string' && /^\/api\/(auth|identity|admin|account|orders|checkout)(\/|\?|$)/.test(key)
}

export function resetSessionUi() {
  useCatalogSelection.getState().reset()
  useStorefrontNavigation.getState().reset()
  useAdminProductsUi.getState().reset()
  useCatalogBrowseUi.getState().reset()
}
