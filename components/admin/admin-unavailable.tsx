import { AdminPageHeader } from './admin-page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AdminUnavailable({ title }: { title: string }) {
  return (
    <section className='flex flex-col gap-6'>
      <AdminPageHeader title={title} />
      <Card>
        <CardHeader><CardTitle>Not available yet</CardTitle></CardHeader>
        <CardContent className='text-sm text-gray-600'>
          This section will be available when its backend API is connected.
        </CardContent>
      </Card>
    </section>
  )
}
