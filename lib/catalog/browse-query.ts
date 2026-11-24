export type BrowseQuery = { q: string; category: string; sort: string; page: string }
export type BrowsePath = '/shop' | '/new-arrivals'
export type BrowseSearchParams = Record<string, string | string[] | undefined>

export const catalogSortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' },
]

export function parseBrowseQuery(params: BrowseSearchParams): BrowseQuery {
  const value = (key: string) => typeof params[key] === 'string' ? params[key] : ''

  return {
    q: value('q').slice(0, 100),
    category: value('category').slice(0, 180),
    sort: catalogSortOptions.some((option) => option.value === value('sort')) ? value('sort') : 'newest',
    page: /^[1-9]\d*$/.test(value('page')) ? value('page') : '1',
  }
}

export function browseHref(path: BrowsePath, query: BrowseQuery) {
  return `${path}?${new URLSearchParams(query)}`
}

export function clearBrowseFilters(query: BrowseQuery): BrowseQuery {
  return { ...query, q: '', category: '', page: '1' }
}

export function activeBrowseFilters(query: Pick<BrowseQuery, 'q' | 'category'>) {
  return Number(Boolean(query.q)) + Number(Boolean(query.category))
}
