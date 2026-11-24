import type { Metadata } from 'next'

import { CatalogBrowse } from '@/components/catalog/browse'
import { readBrowseContent } from '@/lib/catalog/browse'
import type { BrowseSearchParams } from '@/lib/catalog/browse-query'

export const metadata: Metadata = {
  title: 'Shop gold jewellery | FM LUXE',
  description: 'Explore the FM LUXE gold jewellery collection.',
  alternates: { canonical: '/shop' },
}

export default async function ShopPage({ searchParams }: {
  searchParams: Promise<BrowseSearchParams>
}) {
  const catalogContent = await readBrowseContent(searchParams)

  return <CatalogBrowse {...catalogContent} catalogPath='/shop' />
}
