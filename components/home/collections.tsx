'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useHomeCollections } from '@/hooks/use-home-endpoint'
import type { CatalogCategory } from '@/types/catalog'
import { ReadFeedback } from './read-feedback'

export function HomeCollections({ initial }: { initial?: CatalogCategory[] }) {
  const { data, error, isLoading, mutate } = useHomeCollections(initial)
  const categories = data?.data
  const featured = categories?.filter((category) => category.is_featured)
    .sort((a, b) => a.featured_sort_order - b.featured_sort_order)

  return (
    <section aria-labelledby="collections-title">
      <h2 id="collections-title" className="sr-only">Explore the collections</h2>
      <ReadFeedback loading={isLoading} error={error} hasData={!!categories}
        retry={() => { void mutate() }} />
      <div className="meere-collections">
        {featured?.map((category) => (
          <article key={category.id} className="meere-collection">
            {category.images[0] && <Image src={category.images[0].url} alt={category.images[0].alt}
              fill sizes="(max-width: 767px) 100vw, 50vw" className="object-cover" />}
            <div className="meere-image-shade" />
            <div className="meere-collection-copy">
              <h3 className="meere-section-title">{category.name}</h3>
              <Link href={`/shop?category=${encodeURIComponent(category.slug)}`}
                aria-label={`Shop ${category.name}`} className="meere-white-button">Shop Items</Link>
            </div>
          </article>
        ))}
      </div>
      {categories && !featured?.length && <p className="meere-empty">Our collections are being prepared. New pieces will appear here soon.</p>}
    </section>
  )
}
