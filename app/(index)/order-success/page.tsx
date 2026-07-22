import { ArrowRight, CheckCircle2, CreditCard, Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { formatNaira } from '@/components/index/shop/shop-data'
import { verifyPaystackTransaction } from '@/lib/payment/paystack'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; reference?: string; trxref?: string }>
}) {
  const params = await searchParams
  const reference = params.reference || params.trxref
  const targetOrderId = params.orderId || reference

  if (!targetOrderId) {
    notFound()
  }

  const adminSupabase = createSupabaseAdminClient()

  // If returning from Paystack redirect with reference, verify and update order payment_status
  if (reference) {
    const verifyRes = await verifyPaystackTransaction(reference)
    if (verifyRes.success) {
      await adminSupabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'processing',
          updated_at: new Date().toISOString(),
        })
        .or(`id.eq.${reference},id.eq.${targetOrderId}`)
    }
  }

  // Fetch Order
  let { data: order, error: orderError } = await adminSupabase
    .from('orders')
    .select('*')
    .or(`id.eq.${targetOrderId},id.eq.${reference || targetOrderId}`)
    .single()

  if (orderError || !order) {
    console.error('Failed to load order for success screen:', orderError)
    notFound()
  }

  // Fetch Order Items
  const { data: items } = await adminSupabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id)

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
              Order Confirmed!
            </h1>
            <p className='text-sm text-muted-foreground'>
              Thank you for shopping with Mercyharbo. Your order and payment details are confirmed.
            </p>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className='grid gap-6 border-y border-black/10 py-6 text-sm'>
          <div className='grid sm:grid-cols-3 gap-4'>
            <div className='flex flex-col gap-1'>
              <span className='text-xs font-semibold text-muted-foreground uppercase'>
                Order Number
              </span>
              <span className='font-mono font-bold text-black text-base'>
                #FML-{order.order_number}
              </span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-xs font-semibold text-muted-foreground uppercase'>
                Date
              </span>
              <span className='font-medium text-black'>
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-xs font-semibold text-muted-foreground uppercase'>
                Payment Status
              </span>
              <span className='font-bold uppercase tracking-wider text-xs text-emerald-600 flex items-center gap-1 mt-0.5'>
                <CreditCard className='size-3.5' /> {order.payment_status}
              </span>
            </div>
          </div>

          <div className='grid sm:grid-cols-2 gap-4 border-t border-black/10 pt-4'>
            <div className='flex flex-col gap-1.5'>
              <span className='text-xs font-semibold text-muted-foreground uppercase'>
                Delivery Destination
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
            Items Summary
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
                <span className='font-semibold text-black flex-shrink-0 font-mono'>
                  {formatNaira(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Calculations */}
        <div className='bg-neutral-50 border border-black/10 p-5 space-y-3 text-sm'>
          <div className='flex items-center justify-between gap-4 text-xs font-mono text-muted-foreground'>
            <span>Subtotal</span>
            <span>{formatNaira(order.subtotal_amount)}</span>
          </div>
          <div className='flex items-center justify-between gap-4 text-xs font-mono text-muted-foreground'>
            <span>Delivery</span>
            <span>{formatNaira(order.delivery_amount)}</span>
          </div>
          <div className='flex items-center justify-between gap-4 border-t border-black/10 pt-3'>
            <span className='font-heading text-xl font-bold'>
              Total Paid
            </span>
            <span className='text-xl font-bold font-mono text-gold'>
              {formatNaira(order.total_amount)}
            </span>
          </div>
        </div>

        {/* Call to Actions */}
        <div className='flex flex-col sm:flex-row gap-4'>
          <Link
            href='/shop'
            className='flex-1 inline-flex h-12 items-center justify-center gap-2 bg-black px-6 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-gold hover:text-black text-center'
          >
            Continue Shopping
            <ArrowRight className='size-4' strokeWidth={1.8} />
          </Link>
          <Link
            href='/track-order'
            className='flex-1 inline-flex h-12 items-center justify-center gap-2 border border-black/25 px-6 text-xs font-semibold uppercase tracking-wider text-black transition-colors hover:border-black text-center'
          >
            Track Order Status
          </Link>
        </div>
      </div>
    </div>
  )
}
