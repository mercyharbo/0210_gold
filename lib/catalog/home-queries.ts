// Shared server/client query strings keep SSR fallback data aligned with SWR keys.
export const homeProductQueries = {
  arrivals: 'products?sort=newest&page=1&page_size=8',
  necklaces: 'products?category=gold-necklaces&label=featured&sort=newest&page=1&page_size=4',
  featured: 'products?label=featured&sort=newest&page=1&page_size=4',
} as const
