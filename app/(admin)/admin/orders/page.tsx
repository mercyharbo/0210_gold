import { CheckCircle, Clock, Truck } from 'lucide-react'
import * as React from 'react'

import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { AdminPlaceholderCard } from '@/components/admin/admin-placeholder-card'
import { OrdersTable } from '@/components/admin/orders-table'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function AdminOrdersPage() {
  const supabase = await createSupabaseServerClient()

  const { data: ordersData } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  const orders = ordersData || []

  // Dynamic card metrics
  const processingCount = orders.filter((o) => o.status === 'processing').length
  const transitCount = orders.filter((o) => o.status === 'shipped').length
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length

  return (
    <div className='flex flex-col gap-6 bg-white text-black'>
      <AdminPageHeader
        title='Orders'
        description='Manage client transactions, check statuses, and track fulfillment.'
      />
      <div className='flex flex-col gap-6'>
        <div className='grid gap-6 sm:grid-cols-3'>
          <AdminPlaceholderCard
            title='Processing'
            value={String(processingCount)}
            icon={Clock}
          />
          <AdminPlaceholderCard
            title='In Transit'
            value={String(transitCount)}
            icon={Truck}
          />
          <AdminPlaceholderCard
            title='Delivered'
            value={String(deliveredCount)}
            icon={CheckCircle}
          />
        </div>

        <AdminPlaceholderCard
          title='Recent Orders'
          description='Listing of all current store sales and requests'
        >
          {orders.length === 0 ? (
            <p className='text-sm text-muted-foreground py-8 text-center'>
              No orders found in the database.
            </p>
          ) : (
            <OrdersTable orders={orders} />
          )}
        </AdminPlaceholderCard>
      </div>
    </div>
  )
}
