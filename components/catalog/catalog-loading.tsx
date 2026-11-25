import { Skeleton } from '@/components/ui/skeleton'
import { catalogPageCopy } from '@/lib/catalog/browse-copy'
import type { BrowsePath } from '@/lib/catalog/browse-query'

import { CatalogProductsLoading } from './products-loading'

export function CatalogLoading({ catalogPath }: { catalogPath: BrowsePath }) {
  const { heading, description } = catalogPageCopy[catalogPath]

  return (
    <section
      role='status'
      aria-label={`Loading ${heading.toLowerCase()}`}
      aria-busy='true'
      className='flex w-full flex-col gap-12 px-6 pb-12 pt-10 md:gap-16'
    >
      <span className='sr-only'>Loading products...</span>

      <div aria-hidden='true' className='flex flex-col gap-4'>
        <h1 className='text-[28px] font-semibold leading-[1.4] md:text-[34px]'>
          {heading}
        </h1>

        <p className='max-w-[520px] text-sm leading-[1.6]'>{description}</p>
      </div>

      <div aria-hidden='true' className='flex min-w-0 flex-col gap-6'>
        <div className='flex h-8 items-center justify-between gap-4'>
          <Skeleton className='h-5 w-40 rounded-none motion-reduce:animate-none' />
          <Skeleton className='h-5 w-28 rounded-none motion-reduce:animate-none' />
        </div>

        <CatalogProductsLoading />
      </div>
    </section>
  )
}
