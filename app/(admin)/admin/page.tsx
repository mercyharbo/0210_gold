import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Page() {
  return (
    <section className='flex flex-col gap-6'>
      <AdminPageHeader title='Dashboard' description='Manage your FM LUXE store.' />
      <div className='grid gap-6 sm:grid-cols-2 xl:grid-cols-4'>
        {['Sales overview', 'Orders', 'Customers', 'Inventory'].map((title) => (
          <Card key={title}>
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent className='text-sm text-gray-600'>
              Not available until this sectionâ€™s API is connected.
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
