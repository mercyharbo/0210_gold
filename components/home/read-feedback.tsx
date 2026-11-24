'use client'

import { Button } from '@/components/ui/button'

export function ReadFeedback({ loading, error, hasData, retry }: {
  loading: boolean
  error: unknown
  hasData: boolean
  retry: () => void
}) {
  if (error) return (
    <div role="status" className="flex flex-wrap items-center gap-3 py-4 text-sm text-gray-600">
      <p>{error instanceof Error ? error.message : hasData ? 'Updates are temporarily unavailable.' : 'This collection is temporarily unavailable.'}</p>
      <Button variant="outline" size="sm" onClick={retry}>Try again</Button>
    </div>
  )
  if (!loading || hasData) return null
  return <p role='status' className='text-sm text-gray-600'>Loading...</p>
}
