import type { CatalogKind } from '@/types/catalog'

export function affectedCatalogKey(key: unknown, kind: CatalogKind | 'gold-rates') {
  if (typeof key !== 'string') return false
  const resources = kind === 'categories' ? ['categories', 'products']
    : kind === 'gold-rates' ? ['gold-rates', 'products'] : [kind]
  return resources.some((resource) => key.startsWith(`/api/catalog/${resource}`) || key.startsWith(`/api/admin/${resource}`))
}
