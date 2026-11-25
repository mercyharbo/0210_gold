import { Skeleton } from '@/components/ui/skeleton'

export function CatalogProductsLoading() {
  return (
    <div role='status' aria-label='Loading products' aria-busy='true' className='flex min-w-0 flex-col gap-6'>
      <span className='sr-only'>Loading products...</span>

      <div aria-hidden='true' className='flex min-w-0 flex-col gap-6'>
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
    </div>
  )
}
