import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function HeroBanner() {
  return (
    <section className='relative overflow-hidden bg-muted text-black'>
      <div className='relative mx-auto grid min-h-[calc(100svh-5rem)] w-full grid-cols-1 items-center gap-8 px-5 py-10 sm:pl-8 lg:px-0 sm:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:pl-12 lg:py-0'>
        <div className='relative z-10 flex max-w-3xl flex-col gap-6 lg:pb-12'>
          <p className='text-sm font-medium text-black sm:text-base'>
            New arrival
          </p>

          <h1 className='max-w-4xl font-heading text-6xl font-bold leading-[0.88] text-black sm:text-7xl lg:text-8xl xl:text-9xl'>
            Gold that defines you
          </h1>

          <p className='max-w-md text-base leading-7 text-muted-foreground'>
            Timeless gold jewellery crafted for every moment. Elegance. Quality.
            You.
          </p>

          <div className='flex flex-col gap-5 sm:flex-row sm:items-center'>
            <Link
              href='/shop'
              className='inline-flex h-12 items-center justify-center gap-4 bg-black px-7 text-sm font-medium text-white transition-colors hover:bg-black/82'
            >
              Explore collection
              <ArrowRight className='size-4 stroke-[1.8]' />
            </Link>

            <Link
              href='/make-a-request'
              className='inline-flex h-12 items-center justify-center gap-4 border-b border-black px-1 text-sm font-medium text-black transition-opacity hover:opacity-65'
            >
              Make a request
              <ArrowRight className='size-4 stroke-[1.8]' />
            </Link>
          </div>
        </div>

        <div className='relative flex min-h-[360px] items-end justify-center self-end sm:min-h-[520px] lg:min-h-[calc(100svh-5rem)]'>
          <div className='relative aspect-square w-full '>
            <Image
              src='/images/hero-editorial-jewellery.png'
              alt='Model wearing FM LUXE jewellery'
              fill
              priority
              // sizes='(min-width: 1024px) 58vw, 100vw'
              className='object-cover object-center'
            />
          </div>
        </div>

        <div className='pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 items-center gap-4 lg:flex lg:right-10'>
          <span className='text-xs font-medium text-black'>01</span>
          <span className='h-36 w-px bg-black/45' />
          <span className='text-xs font-medium text-black'>04</span>
        </div>
      </div>
    </section>
  )
}
