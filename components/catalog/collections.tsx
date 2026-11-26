import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import type { CatalogCategory } from '@/types/catalog'

export function CatalogCollections({ categories }: { categories: CatalogCategory[] }) {
  return (
    <section aria-labelledby='collections-heading' className='flex w-full flex-col gap-10 pb-12 pt-10 md:gap-16'>
      <div className='flex flex-col gap-4 px-6'>
        <h1 id='collections-heading' className='text-2xl font-semibold leading-[1.4] md:text-4xl'>
          Our collections
        </h1>

        <p className='max-w-lg text-sm leading-relaxed'>
          Discover our gold jewellery, collection by collection. Find pieces for everyday wear and special occasions.
        </p>
      </div>

      {categories.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2'>
          {categories.map((category) => {
            const image = category.images[0]

            return (
              <article
                key={category.id}
                className='relative isolate flex aspect-[4/5] min-w-0 items-end overflow-hidden bg-gray-100'
              >
                {image && (
                  <>
                    <Image
                      src={image.url}
                      alt={image.alt || category.name}
                      fill
                      sizes='(max-width: 767px) 100vw, 50vw'
                      className='object-cover'
                    />

                    <div aria-hidden='true' className='pointer-events-none absolute inset-0 bg-black/55' />
                  </>
                )}

                <div className={`relative flex w-full flex-col items-start gap-4 p-6 md:p-8 ${image ? 'text-white' : 'text-black'}`}>
                  <h2 className='max-w-full break-words text-[28px] font-semibold leading-snug md:text-[34px]'>
                    {category.name}
                  </h2>

                  {category.description && (
                    <p className='max-w-md whitespace-pre-line text-sm leading-relaxed'>
                      {category.description}
                    </p>
                  )}

                  <Button
                    asChild
                    className='h-11 rounded-none bg-white px-4 text-sm font-medium text-black
                      hover:bg-[#e10600] hover:text-white motion-reduce:transition-none'
                  >
                    <Link
                      href={`/shop?category=${encodeURIComponent(category.slug)}`}
                      aria-label={`Shop ${category.name}`}
                    >
                      Shop items
                    </Link>
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className='flex flex-col items-start gap-4 px-6 py-12'>
          <h2 className='text-xl font-medium'>No collections to explore yet</h2>
          <p className='text-sm text-gray-600'>Our collections will appear here when they are available.</p>

          <Button asChild className='h-11 rounded-none bg-black px-5 text-white hover:bg-[#e10600]'>
            <Link href='/shop'>Explore the shop</Link>
          </Button>
        </div>
      )}
    </section>
  )
}
