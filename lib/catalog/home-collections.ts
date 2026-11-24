import type { CatalogCategory } from '@/types/catalog'

export function selectHomeCollections(categories: CatalogCategory[], start: 0 | 2) {
  return categories.filter((category) => category.is_active && category.is_featured)
    .sort((first, second) => first.featured_sort_order - second.featured_sort_order)
    .slice(start, start + 2)
}
