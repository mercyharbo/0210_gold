import { ChevronLeft, CreditCard, Receipt, Truck, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import * as React from 'react'

import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { AdminPlaceholderCard } from '@/components/admin/admin-placeholder-card'
import { formatNaira } from '@/components/index/shop/shop-data'
import { StatusBadge } from '@/components/ui/status-badge'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { OrderDetailsActions } from './order-details-actions'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  // Fetch live order details with items and product details joined
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(*))')
    .eq('id', id)
    .single()

  if (!order) {
    notFound()
  }

  return (
    <div className='flex flex-col gap-6 bg-white text-black font-sans'>
      <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <AdminPageHeader
          title={`Order Details: #FML-${order.order_number}`}
          description='Inspect purchased items, shipping progress, and payment status.'
        />
        <div className='flex shrink-0 items-center gap-3'>
          <OrderDetailsActions
            orderId={order.id}
            orderNumber={order.order_number}
            currentStatus={order.status}
            currentPaymentStatus={order.payment_status}
            order={order}
          />
        </div>
      </div>

      <div className='flex flex-col gap-6'>
        <div className='grid gap-6 md:grid-cols-3'>
          <div className='md:col-span-2 flex flex-col gap-6'>
            {/* Order Items Card */}
            <AdminPlaceholderCard
              title='Order Items'
              description='Catalog items purchased in this order. Click an item to view its product detail page.'
              icon={Receipt}
            >
              <div className='divide-y divide-border'>
                {order.order_items.map((item: any) => {
                  const imageSrc =
                    item.product?.image_urls?.[0] ||
                    item.product?.image_src ||
                    '/images/placeholder.jpg'

                  return (
                    <div
                      key={item.id}
                      className='relative group flex justify-between items-center py-4 first:pt-0 border-b border-border last:border-b-0'
                    >
                      <div className='flex items-center gap-4 z-10'>
                        {/* Image Thumbnail */}
                        <div className='relative size-12 shrink-0 bg-neutral-100 border border-black/5 overflow-hidden rounded'>
                          <Image
                            src={imageSrc}
                            alt={item.product_name}
                            fill
                            sizes='48px'
                            className='object-cover'
                          />
                        </div>
                        <div className='flex flex-col gap-0.5 min-w-0'>
                          {item.product_id ? (
                            <Link
                              href={`/admin/products/${item.product_id}`}
                              className='text-sm font-semibold text-foreground hover:underline hover:text-gold truncate block'
                            >
                              {item.product_name}
                            </Link>
                          ) : (
                            <span className='text-sm font-semibold text-foreground truncate block'>
                              {item.product_name}
                            </span>
                          )}
                          <span className='text-xs text-muted-foreground'>
                            Quantity: {item.quantity}
                            {item.selected_size && ` | Size: ${item.selected_size}`}
                            {item.selected_color && ` | Color: ${item.selected_color}`}
                          </span>
                        </div>
                      </div>
                      <span className='text-sm font-bold text-foreground shrink-0 z-10'>
                        {formatNaira(item.price * item.quantity)}
                      </span>
                    </div>
                  )
                })}

                {/* Subtotal & Delivery Breakdowns */}
                <div className='flex flex-col gap-2 pt-4 text-xs font-sans'>
                  <div className='flex justify-between items-center text-muted-foreground'>
                    <span>Subtotal</span>
                    <span className='font-medium text-foreground'>
                      {formatNaira(order.subtotal_amount)}
                    </span>
                  </div>
                  <div className='flex justify-between items-center text-muted-foreground'>
                    <span>Delivery Fee</span>
                    <span className='font-medium text-foreground'>
                      {formatNaira(order.delivery_amount)}
                    </span>
                  </div>
                  <div className='flex justify-between items-center pt-3 border-t border-border'>
                    <span className='font-semibold text-muted-foreground'>
                      Total Amount
                    </span>
                    <span className='text-base font-bold text-foreground text-gold'>
                      {formatNaira(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </AdminPlaceholderCard>

            {/* Delivery / Shipping Status Card */}
            <AdminPlaceholderCard
              title='Fulfillment Tracking'
              description='Current status and shipping address details.'
              icon={Truck}
            >
              <div className='flex flex-col gap-4 py-2 text-xs font-sans'>
                <div className='flex items-center gap-3'>
                  <span className='text-muted-foreground font-medium'>Fulfillment Status:</span>
                  <StatusBadge status={order.status} />
                </div>
                <div className='flex flex-col gap-1 border-t border-border pt-3'>
                  <span className='font-semibold text-muted-foreground uppercase text-[10px]'>
                    Shipping Address
                  </span>
                  <span className='text-foreground font-medium leading-relaxed'>
                    {order.shipping_address}, {order.shipping_city},{' '}
                    {order.shipping_state}, {order.shipping_country}
                  </span>
                </div>
              </div>
            </AdminPlaceholderCard>
          </div>

          <div className='flex flex-col gap-6'>
            {/* Customer Details Card */}
            <AdminPlaceholderCard
              title='Customer Information'
              description='Client contact details.'
              icon={User}
            >
              <div className='flex flex-col gap-3 py-1 text-xs font-sans'>
                <div className='flex flex-col gap-0.5'>
                  <span className='text-[10px] font-semibold text-muted-foreground uppercase'>
                    Name
                  </span>
                  <span className='text-sm font-medium text-foreground'>
                    {order.customer_name}
                  </span>
                </div>
                <div className='flex flex-col gap-0.5 border-t border-border pt-2.5'>
                  <span className='text-[10px] font-semibold text-muted-foreground uppercase'>
                    Email
                  </span>
                  <span className='text-sm text-foreground truncate'>
                    {order.customer_email}
                  </span>
                </div>
                <div className='flex flex-col gap-0.5 border-t border-border pt-2.5'>
                  <span className='text-[10px] font-semibold text-muted-foreground uppercase'>
                    Phone
                  </span>
                  <span className='text-sm text-foreground font-medium'>
                    {order.customer_phone}
                  </span>
                </div>
              </div>
            </AdminPlaceholderCard>

            {/* Payment Details Card */}
            <AdminPlaceholderCard
              title='Payment Details'
              description='Transaction confirmation.'
              icon={CreditCard}
            >
              <div className='flex flex-col gap-3 py-1 text-xs font-sans'>
                <div className='flex justify-between items-center text-muted-foreground'>
                  <span>Payment Status</span>
                  <StatusBadge status={order.payment_status} />
                </div>
                <div className='flex justify-between border-t border-border pt-3 text-muted-foreground items-center'>
                  <span>Fulfillment</span>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            </AdminPlaceholderCard>
          </div>
        </div>
      </div>
    </div>
  )
}
