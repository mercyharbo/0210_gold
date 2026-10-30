import { Skeleton } from '@/components/ui/skeleton'
export default function Loading() {
  return <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10" role="status" aria-label="Loading collection">
    <Skeleton className="h-10 w-48" /><div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
      {[1, 2, 3, 4].map((id) => <Skeleton key={id} className="aspect-square w-full" />)}
    </div>
  </div>
}
