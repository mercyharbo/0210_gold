import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function ShopHero() {
  return (
    <section className='bg-muted text-black'>
      <div className='mx-auto grid w-full gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:px-12 lg:py-24'>
        <div className='max-w-3xl'>
          <p className='text-sm font-medium uppercase text-muted-foreground'>
            Shop
          </p>
          <h1 className='font-heading text-5xl font-bold leading-[0.95] sm:text-6xl lg:text-7xl'>
            Shop fashion, gold, and accessories
          </h1>
        </div>

        <div className='flex flex-col gap-6 lg:ml-auto'>
          <p className='max-w-2xl text-base leading-7 text-muted-foreground'>
            Browse the current edit across clothing, abaya, bags, shoes,
            jewellery, accessories, and modest sets.
          </p>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
            <Link
              href='/categories'
              className='inline-flex h-12 items-center justify-center gap-4 bg-black px-7 text-sm font-medium text-white transition-colors hover:bg-black/82'
            >
              View categories
              <ArrowRight className='size-4 stroke-[1.8]' />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
