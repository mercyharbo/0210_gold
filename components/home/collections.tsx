'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useHomeCollections } from '@/hooks/use-home-endpoint'
import type { CatalogCategory } from '@/types/catalog'
import { ReadFeedback } from './read-feedback'
import { selectHomeCollections } from '@/lib/catalog/home-collections'

export function HomeCollections({ initial, start }: { initial?: CatalogCategory[]; start: 0 | 2 }) {
  const { data, error, isLoading, mutate } = useHomeCollections(initial)
  const categories = data?.data
  const featured = categories ? selectHomeCollections(categories, start) : undefined
  const sectionId = start === 0 ? 'featured-collections-first' : 'featured-collections-second'
  if (categories && !featured?.length && !error) return null

  return (
    <section id={sectionId} aria-labelledby={`${sectionId}-title`}>
      <h2 id={`${sectionId}-title`} className="sr-only">Explore the collections</h2>
      <ReadFeedback loading={isLoading} error={error} hasData={!!categories}
        retry={() => { void mutate() }} />
      <div className="meere-collections" data-count={featured?.length}>
        {featured?.map((category) => (
          <article key={category.id} className="meere-collection">
            {category.images[0] && <Image src={category.images[0].url} alt={category.images[0].alt}
              fill sizes={featured?.length === 1 ? '100vw' : '(max-width: 767px) 100vw, 50vw'} className="object-cover" />}
            <div className="meere-image-shade" />
            <div className="meere-collection-copy">
              <h3 className="meere-section-title">{category.name}</h3>
              <Link href={`/shop?category=${encodeURIComponent(category.slug)}`}
                aria-label={`Shop ${category.name}`} className="meere-white-button">Shop Items</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
