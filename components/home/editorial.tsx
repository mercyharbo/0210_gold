import Image from 'next/image'
import Link from 'next/link'

export function HomeEditorial() {
  return (
    <section
      aria-labelledby='editorial-title'
      className='relative h-[120svh] bg-black text-white'
    >
      <Image
        src='/images/featured-collections/jewellery-accessories.png'
        alt='Gold necklaces, earrings, rings and bracelets'
        fill
        sizes='100vw'
        className='object-cover'
      />
      <div className='pointer-events-none absolute inset-0 bg-black/18' />
      <div className='sticky top-0 flex h-svh flex-col items-start justify-end gap-4 px-6 py-16 motion-reduce:relative'>
        <h2
          id='editorial-title'
          className='text-[32px] font-semibold leading-none md:text-[9.737vw]'
        >
          Make It Your Own
        </h2>
        <p className='max-w-full text-base font-medium leading-[1.6] md:max-w-[520px]'>
          A favourite chain. A pair of earrings you reach for every morning.
          Discover gold jewellery to wear your way, every day.
        </p>
        <Link
          href='/shop'
          className='inline-flex min-h-11 w-fit items-center justify-center gap-2.5 bg-white px-4 text-sm font-medium leading-[1.6] text-black transition-colors duration-200 hover:bg-[#e10600] hover:text-white motion-reduce:transition-none'
        >
          Shop Jewellery
        </Link>
      </div>
    </section>
  )
}
