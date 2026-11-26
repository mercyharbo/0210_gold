import type { Metadata } from 'next'

import { CatalogCollections } from '@/components/catalog/collections'
import { readCatalog } from '@/lib/catalog/server'
import type { CatalogCategory } from '@/types/catalog'

export const metadata: Metadata = {
  title: 'Collections | FM LUXE',
  description: 'Explore the FM LUXE gold jewellery collections and find your next piece.',
  alternates: { canonical: '/categories' },
}

export default async function CollectionsPage() {
  const categories = await readCatalog<CatalogCategory[]>('categories')

  return <CatalogCollections categories={categories} />
}
