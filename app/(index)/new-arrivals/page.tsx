import type { Metadata } from 'next'

import { CatalogBrowse } from '@/components/catalog/browse'
import { readBrowseContent } from '@/lib/catalog/browse'
import type { BrowseSearchParams } from '@/lib/catalog/browse-query'

export const metadata: Metadata = {
  title: 'New arrivals | FM LUXE',
  description: 'Explore the latest additions to the FM LUXE gold jewellery collection.',
  alternates: { canonical: '/new-arrivals' },
}

export default async function NewArrivalsPage({ searchParams }: {
  searchParams: Promise<BrowseSearchParams>
}) {
  const catalogContent = await readBrowseContent(searchParams)

  return <CatalogBrowse {...catalogContent} catalogPath='/new-arrivals' />
}
