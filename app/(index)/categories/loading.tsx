import { Skeleton } from '@/components/ui/skeleton'

export default function CollectionsLoading() {
  return (
    <section role='status' aria-label='Loading collections' className='flex w-full flex-col gap-10 pb-12 pt-10 md:gap-16'>
      <span className='sr-only'>Loading collections...</span>

      <div aria-hidden='true' className='flex flex-col gap-4 px-6'>
        <Skeleton className='h-9 w-56 rounded-none motion-reduce:animate-none md:h-12' />
        <Skeleton className='h-12 w-full max-w-lg rounded-none motion-reduce:animate-none' />
      </div>

      <div aria-hidden='true' className='grid grid-cols-1 md:grid-cols-2'>
        {[0, 1, 2, 3].map((placeholder) => (
          <div key={placeholder} className='relative aspect-[4/5] min-w-0 bg-gray-100'>
            <div className='absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 md:p-8'>
              <Skeleton className='h-10 w-2/3 rounded-none bg-gray-200 motion-reduce:animate-none' />
              <Skeleton className='h-11 w-28 rounded-none bg-gray-200 motion-reduce:animate-none' />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
