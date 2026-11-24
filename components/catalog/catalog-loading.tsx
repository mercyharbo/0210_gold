import { Skeleton } from '@/components/ui/skeleton'
import { catalogPageCopy } from '@/lib/catalog/browse-copy'
import type { BrowsePath } from '@/lib/catalog/browse-query'

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

        <div className='grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className='flex min-w-0 flex-col gap-2'>
              <div className='relative aspect-[7/10]'>
                <Skeleton className='absolute inset-0 rounded-none motion-reduce:animate-none' />
                <Skeleton className='absolute left-4 top-4 size-4 rounded-full bg-gray-300 motion-reduce:animate-none' />
              </div>

              <div className='flex flex-col gap-1'>
                <div className='flex h-[1.6em] items-center text-sm'>
                  <Skeleton className='h-3.5 w-2/3 rounded-none motion-reduce:animate-none' />
                </div>

                <div className='flex h-[1.6em] items-center text-sm'>
                  <Skeleton className='h-3.5 w-24 rounded-none motion-reduce:animate-none' />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='flex flex-wrap items-center justify-between gap-4 pt-6'>
          <Skeleton className='h-11 w-24 rounded-none motion-reduce:animate-none' />
          <Skeleton className='h-5 w-32 rounded-none motion-reduce:animate-none' />
          <Skeleton className='h-11 w-20 rounded-none motion-reduce:animate-none' />
        </div>
      </div>
    </section>
  )
}
