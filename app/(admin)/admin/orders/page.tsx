import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { OrdersClient } from '@/components/admin/orders-client'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function AdminOrdersPage() {
  const supabase = await createSupabaseServerClient()

  const { data: ordersData } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  const orders = ordersData || []

  return (
    <div className='flex flex-col gap-6 bg-white text-black'>
      <AdminPageHeader
        title='Orders Management'
        description='Manage client transactions, update fulfillment statuses, and issue waybill manifests.'
      />

      <OrdersClient orders={orders} />
    </div>
  )
}
