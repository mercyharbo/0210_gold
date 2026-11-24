import type { ProductListFilters } from '@/stores/admin-products-ui'

export function adminProductsQuery(filters: ProductListFilters, search = filters.search) {
  const query = new URLSearchParams({ page: String(filters.page), page_size: '24', sort: filters.sort })
  for (const [name, value] of [
    ['q', search.trim()], ['category', filters.category], ['status', filters.status],
    ['label', filters.label], ['in_stock', filters.availability],
  ]) if (value) query.set(name, value)
  return query.toString()
}
