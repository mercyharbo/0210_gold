import type { Metadata } from 'next'
import { CatalogBrowse, type BrowseQuery } from '@/components/catalog/browse'
import { readCatalog } from '@/lib/catalog/server'
import type { CatalogCategory, CatalogPage } from '@/types/catalog'

export const metadata: Metadata = {
  title: 'Shop jewellery & fashion | FM LUXE',
  description: 'Explore fine gold jewellery and carefully selected fashion at FM LUXE.',
  alternates: { canonical: '/shop' },
}
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const value = (key: string) => (typeof params[key] === 'string' ? (params[key] as string) : '')
  const sort = ['newest', 'price_asc', 'price_desc', 'name'].includes(value('sort'))
    ? value('sort')
    : 'newest'
  const query: BrowseQuery = {
    q: value('q').slice(0, 100),
    category: value('category').slice(0, 180),
    sort,
    page: /^[1-9]\d*$/.test(value('page')) ? value('page') : '1',
  }
  const [initial, categories] = await Promise.all([
    readCatalog<CatalogPage>(`products?${new URLSearchParams(query)}`),
    readCatalog<CatalogCategory[]>('categories'),
  ])
  return (
    <CatalogBrowse
      key={new URLSearchParams(query).toString()}
      initial={initial}
      categories={categories}
      query={query}
    />
  )
}
