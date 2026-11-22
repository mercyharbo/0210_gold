'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function ReadFeedback({ loading, error, hasData, retry }: {
  loading: boolean
  error: unknown
  hasData: boolean
  retry: () => void
}) {
  if (error) return (
    <div role="status" className="flex flex-wrap items-center gap-3 py-4 text-sm text-gray-600">
      <p>{hasData ? 'Updates are temporarily unavailable.' : 'This collection is temporarily unavailable.'}</p>
      <Button variant="outline" size="sm" onClick={retry}>Try again</Button>
    </div>
  )
  if (!loading || hasData) return null
  return (
    <div role="status" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <span className="sr-only">Loading collection</span>
      {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="aspect-[4/5] rounded-none motion-reduce:animate-none" />)}
    </div>
  )
}
