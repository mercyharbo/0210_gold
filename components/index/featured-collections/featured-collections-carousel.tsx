'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'

import { FeatureCard } from './feature-card'

type FeaturedCollectionCard = {
  title: string
  description: string
  href: string
  imageAlt: string
  imageSrc: string
  meta: string
}

type FeaturedCollectionsCarouselProps = {
  collections: FeaturedCollectionCard[]
}

export function FeaturedCollectionsCarousel({
  collections,
}: FeaturedCollectionsCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)

  const scrollCarousel = (direction: 'previous' | 'next') => {
    const carousel = carouselRef.current

    if (!carousel) return

    const distance = Math.min(carousel.clientWidth * 0.86, 520)

    carousel.scrollBy({
      left: direction === 'next' ? distance : -distance,
      behavior: 'smooth',
    })
  }

  return (
    <div className='flex flex-col gap-5'>
      <div className='hidden justify-end gap-3 md:flex'>
        <button
          type='button'
          aria-label='Previous collections'
          onClick={() => scrollCarousel('previous')}
          className='grid size-11 place-items-center border border-black/20 text-black transition-colors hover:border-black hover:bg-black hover:text-white'
        >
          <ChevronLeft className='size-5 stroke-[1.8]' />
        </button>
        <button
          type='button'
          aria-label='Next collections'
          onClick={() => scrollCarousel('next')}
          className='grid size-11 place-items-center border border-black/20 text-black transition-colors hover:border-black hover:bg-black hover:text-white'
        >
          <ChevronRight className='size-5 stroke-[1.8]' />
        </button>
      </div>

      <div
        ref={carouselRef}
        className='flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
      >
        {collections.map((collection) => (
          <FeatureCard
            key={collection.href}
            {...collection}
            className='w-72 shrink-0 snap-start sm:w-96'
          />
        ))}
      </div>

      <div className='flex justify-end gap-3 md:hidden'>
        <button
          type='button'
          aria-label='Previous collections'
          onClick={() => scrollCarousel('previous')}
          className='grid size-11 place-items-center border border-black/20 text-black transition-colors hover:border-black hover:bg-black hover:text-white'
        >
          <ChevronLeft className='size-5 stroke-[1.8]' />
        </button>
        <button
          type='button'
          aria-label='Next collections'
          onClick={() => scrollCarousel('next')}
          className='grid size-11 place-items-center border border-black/20 text-black transition-colors hover:border-black hover:bg-black hover:text-white'
        >
          <ChevronRight className='size-5 stroke-[1.8]' />
        </button>
      </div>
    </div>
  )
}
