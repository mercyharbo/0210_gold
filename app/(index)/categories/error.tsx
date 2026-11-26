'use client'

import { ApiFeedback } from '@/components/ui/api-feedback'

export default function CollectionsError({ unstable_retry }: { unstable_retry: () => void }) {
  return (
    <section className='flex flex-col gap-6 px-6 py-10'>
      <h1 className='text-2xl font-semibold leading-[1.4] md:text-4xl'>Our collections</h1>

      <ApiFeedback
        error
        message='We could not load the collections. Please try again.'
        onRetry={unstable_retry}
      />
    </section>
  )
}
