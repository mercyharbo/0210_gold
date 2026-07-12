import { ArrowRight, CheckCircle2, Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { formatNaira } from '@/components/index/shop/shop-data'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const { orderId } = await searchParams

  if (!orderId) {
    notFound()
  }

  const adminSupabase = createSupabaseAdminClient()

  // Fetch Order
  const { data: order, error: orderError } = await adminSupabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    console.error('Failed to load order for success screen:', orderError)
    notFound()
  }

  // Fetch Order Items
  const { data: items, error: itemsError } = await adminSupabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)

  if (itemsError) {
    console.error('Failed to load order items for success screen:', itemsError)
  }

  const orderItems = items || []

  return (
    <div className='bg-white text-black min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-5 sm:px-8 lg:px-12'>
      <div className='max-w-2xl w-full border border-black/10 p-6 sm:p-10 flex flex-col gap-8 bg-white shadow-sm'>
        {/* Success Icon & Message */}
        <div className='text-center flex flex-col items-center gap-4'>
          <div className='size-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center'>
            <CheckCircle2 className='size-10' />
          </div>
          <div className='flex flex-col gap-1.5'>
            <h1 className='font-heading text-4xl font-semibold leading-none sm:text-5xl'>
              Order Placed!
            </h1>
            <p className='text-sm text-muted-foreground'>
              Thank you for shopping with us. Your order has been placed
              successfully.
            </p>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className='grid gap-6 border-y border-black/10 py-6 text-sm'>
          <div className='grid sm:grid-cols-2 gap-4'>
            <div className='flex flex-col gap-1'>
              <span className='text-xs font-semibold text-muted-foreground uppercase'>
                Order Number
              </span>
              <span className='font-mono font-semibold text-black'>
                #{order.order_number}
              </span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-xs font-semibold text-muted-foreground uppercase'>
                Date
              </span>
              <span className='font-medium text-black'>
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className='grid sm:grid-cols-2 gap-4 border-t border-black/10 pt-4'>
            <div className='flex flex-col gap-1.5'>
              <span className='text-xs font-semibold text-muted-foreground uppercase'>
                Delivery Details
              </span>
              <div className='flex items-start gap-2 text-muted-foreground'>
                <MapPin className='size-4 text-gold mt-0.5 flex-shrink-0' />
                <div>
                  <p className='font-semibold text-black'>
                    {order.customer_name}
                  </p>
                  <p className='leading-relaxed'>{order.shipping_address}</p>
                  <p className='leading-relaxed'>
                    {order.shipping_city}, {order.shipping_state}
                  </p>
                  <p className='leading-relaxed'>{order.shipping_country}</p>
                </div>
              </div>
            </div>

            <div className='flex flex-col gap-1.5'>
              <span className='text-xs font-semibold text-muted-foreground uppercase'>
                Contact Info
              </span>
              <div className='space-y-1.5 text-muted-foreground'>
                <div className='flex items-center gap-2'>
                  <Phone className='size-3.5 text-gold flex-shrink-0' />
                  <span className='font-medium text-black'>
                    {order.customer_phone}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Mail className='size-3.5 text-gold flex-shrink-0' />
                  <span className='truncate'>{order.customer_email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items List */}
        <div className='flex flex-col gap-4'>
          <h2 className='text-sm font-semibold uppercase text-muted-foreground'>
            Items Ordered
          </h2>
          <div className='divide-y divide-black/10 border border-black/10 p-4'>
            {orderItems.map((item: any) => (
              <div
                key={item.id}
                className='flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 text-sm'
              >
                <div className='min-w-0'>
                  <p className='font-semibold text-black truncate'>
                    {item.product_name}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Qty: {item.quantity}
                    {item.selected_color || item.selected_size
                      ? ` | ${[item.selected_color, item.selected_size].filter(Boolean).join('/')}`
                      : ''}
                  </p>
                </div>
                <span className='font-semibold text-black flex-shrink-0'>
                  {formatNaira(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Calculations */}
        <div className='bg-muted/30 border border-black/10 p-5 space-y-3 text-sm'>
          <div className='flex items-center justify-between gap-4'>
            <span className='text-muted-foreground'>Subtotal</span>
            <span className='font-semibold'>
              {formatNaira(order.subtotal_amount)}
            </span>
          </div>
          <div className='flex items-center justify-between gap-4'>
            <span className='text-muted-foreground'>Delivery</span>
            <span className='font-semibold'>
              {formatNaira(order.delivery_amount)}
            </span>
          </div>
          <div className='flex items-center justify-between gap-4 border-t border-black/10 pt-3'>
            <span className='font-heading text-xl font-semibold'>
              Total Paid
            </span>
            <span className='text-lg font-semibold'>
              {formatNaira(order.total_amount)}
            </span>
          </div>
        </div>

        {/* Call to Actions */}
        <div className='flex flex-col sm:flex-row gap-4'>
          <Link
            href='/shop'
            className='flex-1 inline-flex h-12 items-center justify-center gap-2 bg-black px-6 text-sm font-semibold text-white transition-colors hover:bg-gold hover:text-black text-center'
          >
            Continue Shopping
            <ArrowRight className='size-4' strokeWidth={1.8} />
          </Link>
          <Link
            href='/track-order'
            className='flex-1 inline-flex h-12 items-center justify-center gap-2 border border-black/25 px-6 text-sm font-semibold text-black transition-colors hover:border-black text-center'
          >
            Track Order Status
          </Link>
        </div>
      </div>
    </div>
  )
}
