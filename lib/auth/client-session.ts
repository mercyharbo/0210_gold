import { useCatalogSelection } from '@/stores/catalog-ui'
import { useStorefrontNavigation } from '@/stores/storefront-navigation'

export function isUserScopedKey(key: unknown) {
  return typeof key === 'string' && /^\/api\/(auth|identity|admin|account|orders|checkout)(\/|\?|$)/.test(key)
}

export function resetSessionUi() {
  useCatalogSelection.getState().reset()
  useStorefrontNavigation.getState().reset()
}
