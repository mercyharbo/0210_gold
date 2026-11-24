'use client'

import { useHomeCollections } from '@/hooks/use-home-endpoint'
import { selectHomeCollections } from '@/lib/catalog/home-collections'
import type { CatalogCategory } from '@/types/catalog'
import Image from 'next/image'
import Link from 'next/link'

export function HomeCollections({
  initial,
  start,
}: {
  initial?: CatalogCategory[]
  start: 0 | 2
}) {
  const { data, error, isLoading, mutate } = useHomeCollections(initial)
  const categories = data?.data

  const featured = categories
    ? selectHomeCollections(categories, start)
    : undefined
  const sectionId =
    start === 0 ? 'featured-collections-first' : 'featured-collections-second'
  if (categories && !featured?.length && !error) return null

  return (
    <section id={sectionId} aria-labelledby={`${sectionId}-title`}>
      <h2 id={`${sectionId}-title`} className='sr-only'>
        Explore the collections
      </h2>

      <div
        className='grid grid-cols-1 md:grid-cols-2 md:data-[count=1]:grid-cols-1'
        data-count={featured?.length}
      >
        {featured?.map((category) => (
          <article
            key={category.id}
            className='relative min-h-svh bg-[#eee] text-white'
          >
            {category.images[0] && (
              <Image
                src={category.images[0].url}
                alt={category.images[0].alt}
                fill
                sizes={
                  featured?.length === 1
                    ? '100vw'
                    : '(max-width: 767px) 100vw, 50vw'
                }
                className='object-cover'
              />
            )}
            <div className='pointer-events-none absolute inset-0 bg-black/18' />
            <div className='sticky top-[calc(100svh-132px)] flex flex-col items-start gap-4 p-6 motion-reduce:relative'>
              <h3 className='text-[28px] font-semibold leading-[1.4] md:text-[34px]'>
                {category.name}
              </h3>
              <Link
                href={`/shop?category=${encodeURIComponent(category.slug)}`}
                aria-label={`Shop ${category.name}`}
                className='inline-flex min-h-11 w-fit items-center justify-center gap-2.5 bg-white px-4 text-sm font-medium leading-relaxed text-black transition-colors duration-200 hover:bg-[#e10600] hover:text-white motion-reduce:transition-none'
              >
                Shop Items
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
