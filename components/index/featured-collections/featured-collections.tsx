'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRef } from 'react'
import { FeatureCard } from './feature-card'

const collections = [
  {
    title: 'Jewellery & Accessories',
    description:
      'Gold pieces and finishing details grouped together for polished everyday styling.',
    href: '/categories',
    imageAlt: 'Gold jewellery and accessories styled as a premium flat lay',
    imageSrc: '/images/featured-collections/jewellery-accessories.png',
    meta: 'Gold',
  },
  {
    title: 'Abaya',
    description:
      'Elegant modest silhouettes with refined fabrics for dressy and everyday looks.',
    href: '/categories',
    imageAlt: 'Elegant abaya garment styled in a boutique studio',
    imageSrc: '/images/featured-collections/abaya.png',
    meta: 'Fashion',
  },
  {
    title: 'Clothing',
    description:
      'Curated wardrobe pieces selected for clean lines, comfort, and easy styling.',
    href: '/categories',
    imageAlt: 'Curated fashion clothing arranged in a clean boutique scene',
    imageSrc: '/images/featured-collections/clothing.png',
    meta: 'Fashion',
  },
  {
    title: 'Bags',
    description:
      'Structured bags and soft carry pieces to complete daily and occasion outfits.',
    href: '/categories',
    imageAlt: 'Elegant bags styled on a warm studio plinth',
    imageSrc: '/images/featured-collections/bags.png',
    meta: 'Accessories',
  },
  {
    title: 'Shoes',
    description:
      'Polished footwear options that balance comfort, shape, and occasion styling.',
    href: '/categories',
    imageAlt: 'Elegant shoes arranged on minimal studio plinths',
    imageSrc: '/images/featured-collections/shoes.png',
    meta: 'Fashion',
  },
  {
    title: 'Modest Sets',
    description:
      'Coordinated outfit sets designed for easy styling across casual and dressy days.',
    href: '/categories',
    imageAlt: 'Coordinated modest fashion outfit styled in a boutique studio',
    imageSrc: '/images/featured-collections/modest-sets.png',
    meta: 'Fashion',
  },
]

export function FeaturedCollections() {
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
    <section className='bg-white text-black'>
      <div className='mx-auto w-full px-5 py-16 sm:px-8 lg:px-12 lg:py-20'>
        <div className='mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
          <div className='max-w-2xl'>
            <p className='mb-3 text-sm font-medium uppercase text-black/50'>
              Featured collections
            </p>
            <h2 className='font-heading text-4xl font-bold leading-tight sm:text-5xl'>
              Fashion, gold, and the pieces that finish the look
            </h2>
          </div>

          <div className='flex items-center gap-4'>
            <Link
              href='/categories'
              className='inline-flex h-11 items-center border-b border-black text-sm font-medium text-black transition-opacity hover:opacity-65'
            >
              View all collections
            </Link>

            <div className='hidden gap-3 md:flex'>
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
        </div>

        <div
          ref={carouselRef}
          className='flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        >
          {collections.map((collection) => (
            <FeatureCard
              key={collection.title}
              {...collection}
              className='w-[82vw] shrink-0 snap-start sm:w-[24rem] lg:w-[26rem]'
            />
          ))}
        </div>

        <div className='mt-8 flex justify-end gap-3 md:hidden'>
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
    </section>
  )
}
