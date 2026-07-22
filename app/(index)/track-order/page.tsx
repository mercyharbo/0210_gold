'use client'

import { useState, useTransition } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  HelpCircle,
  Loader2,
  MapPin,
  PackageCheck,
  Search,
  ShoppingBag,
  Truck,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'

import { StatusBadge } from '@/components/ui/status-badge'
import { trackOrderAction, type TrackedOrder } from './actions'

const trackingSteps = [
  {
    key: 'pending',
    stepNumber: '01',
    title: 'Order Received',
    description: 'Your order details are confirmed and prepared for processing.',
    Icon: ClipboardCheck,
  },
  {
    key: 'processing',
    stepNumber: '02',
    title: 'Being Prepared',
    description: 'Items are checked, packed, and matched with your delivery details.',
    Icon: PackageCheck,
  },
  {
    key: 'shipped',
    stepNumber: '03',
    title: 'Out for Delivery',
    description: 'Your order or waybill has been dispatched with delivery updates active.',
    Icon: Truck,
  },
  {
    key: 'delivered',
    stepNumber: '04',
    title: 'Delivered',
    description: 'Order successfully delivered to your specified address in Nigeria.',
    Icon: CheckCircle2,
  },
]

const inputClassName =
  'h-12 w-full border border-black/15 bg-white px-4 text-sm text-black outline-none transition-colors placeholder:text-muted-foreground focus:border-gold'

const getStepIndex = (status: string): number => {
  const normalized = status.toLowerCase()
  if (normalized === 'pending') return 0
  if (normalized === 'processing') return 1
  if (normalized === 'shipped') return 2
  if (normalized === 'delivered') return 3
  return 0
}

export default function TrackOrderPage() {
  const [orderRef, setOrderRef] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [trackedOrder, setTrackedOrder] = useState<TrackedOrder | null>(null)

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    startTransition(async () => {
      const res = await trackOrderAction(orderRef, contactInfo)
      if (res.success && res.order) {
        setTrackedOrder(res.order)
      } else {
        setTrackedOrder(null)
        setErrorMsg(res.error || 'Failed to locate order.')
      }
    })
  }

  const currentStepIdx = trackedOrder ? getStepIndex(trackedOrder.status) : -1
  const isCancelled = trackedOrder?.status.toLowerCase() === 'cancelled'

  return (
    <div className='bg-white text-black min-h-screen font-sans'>
      {/* Hero Banner */}
      <section className='border-b border-black/10 px-5 py-14 sm:px-8 lg:px-12 lg:py-20 bg-neutral-50'>
        <div className='mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end'>
          <div>
            <p className='text-xs font-semibold uppercase text-gold'>
              Live Tracking
            </p>
            <h1 className='max-w-3xl font-heading text-4xl font-bold leading-[0.95] sm:text-5xl lg:text-6xl'>
              Track your order from confirmation to delivery.
            </h1>
          </div>

          <p className='max-w-2xl text-sm leading-relaxed text-muted-foreground lg:justify-self-end'>
            Enter your order number (e.g., 1001 or FML-1001) along with the email or phone number used at checkout to view real-time delivery status and item breakdowns.
          </p>
        </div>
      </section>

      {/* Main Search & Status Section */}
      <section className='px-5 py-12 sm:px-8 lg:px-12'>
        <div className='mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]'>
          {/* Left Column: Tracking Form */}
          <div className='space-y-6'>
            <div className='border border-black/10 p-6 sm:p-8 space-y-5 bg-white'>
              <div className='flex items-center justify-between gap-4 border-b border-black/10 pb-4'>
                <div>
                  <p className='text-xs font-semibold uppercase text-muted-foreground'>
                    Find Order
                  </p>
                  <h2 className='font-heading text-2xl font-bold'>
                    Enter Order Details
                  </h2>
                </div>
                <Search className='size-6 text-gold' strokeWidth={1.7} />
              </div>

              {errorMsg && (
                <div className='bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-xs font-medium rounded-none flex items-start gap-2'>
                  <XCircle className='size-4 text-rose-500 shrink-0 mt-0.5' />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleTrack} className='space-y-5'>
                <div className='space-y-2'>
                  <label
                    htmlFor='order-reference'
                    className='block text-xs font-semibold uppercase text-black/70'
                  >
                    Order or Waybill Number *
                  </label>
                  <input
                    id='order-reference'
                    type='text'
                    required
                    value={orderRef}
                    onChange={(e) => setOrderRef(e.target.value)}
                    placeholder='e.g. 1001 or FML-1001'
                    className={inputClassName}
                  />
                </div>

                <div className='space-y-2'>
                  <label
                    htmlFor='customer-contact'
                    className='block text-xs font-semibold uppercase text-black/70'
                  >
                    Email or Phone Number *
                  </label>
                  <input
                    id='customer-contact'
                    type='text'
                    required
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder='Used when placing the order'
                    className={inputClassName}
                  />
                </div>

                <button
                  type='submit'
                  disabled={isPending}
                  className='inline-flex h-12 w-full items-center justify-center gap-2 bg-black px-6 text-xs font-semibold uppercase text-white transition-colors hover:bg-gold hover:text-black disabled:opacity-50 cursor-pointer'
                >
                  {isPending ? (
                    <>
                      <Loader2 className='size-4 animate-spin' />
                      Searching Order...
                    </>
                  ) : (
                    <>
                      Track Order Progress
                      <ArrowRight className='size-4' strokeWidth={1.8} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Help Card */}
            <div className='border border-black bg-black p-6 text-white space-y-4 sm:p-8'>
              <HelpCircle className='size-6 text-gold' strokeWidth={1.7} />
              <h3 className='font-heading text-2xl font-bold'>
                Need Assistance With An Order?
              </h3>
              <p className='text-xs leading-relaxed text-neutral-400'>
                If you need to update delivery details or ask about UK waybills, reach out directly to our support team.
              </p>
              <div className='flex flex-wrap gap-3 pt-2'>
                <Link
                  href='/contact'
                  className='inline-flex h-10 items-center justify-center bg-white px-5 text-xs font-semibold uppercase text-black transition-colors hover:bg-gold'
                >
                  Contact Support
                </Link>
                <Link
                  href='/faq'
                  className='inline-flex h-10 items-center justify-center border border-white/35 px-5 text-xs font-semibold uppercase text-white transition-colors hover:bg-white hover:text-black'
                >
                  View FAQs
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Tracking Progress or Placeholder */}
          <div className='space-y-6'>
            {trackedOrder ? (
              <div className='space-y-6'>
                {/* Order Summary Header Card */}
                <div className='border border-black/10 p-6 sm:p-8 bg-neutral-900 text-white space-y-4 rounded-lg'>
                  <div className='flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-4'>
                    <div>
                      <span className='text-xs text-neutral-400'>Order Reference</span>
                      <h2 className='font-heading text-3xl font-bold text-gold'>
                        #FML-{trackedOrder.order_number}
                      </h2>
                    </div>
                    <div className='text-right'>
                      <span className='text-xs text-neutral-400 block'>Date Placed</span>
                      <span className='text-sm font-semibold'>
                        {new Date(trackedOrder.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {isCancelled ? (
                    <div className='bg-rose-500/20 border border-rose-500/40 text-rose-200 px-4 py-3 text-xs font-semibold flex items-center gap-2'>
                      <XCircle className='size-4 text-rose-400' />
                      This order was marked as Cancelled. Please contact support for assistance.
                    </div>
                  ) : (
                    <div className='flex flex-wrap items-center justify-between gap-4 text-xs pt-1'>
                      <div className='flex items-center gap-2'>
                        <span className='text-neutral-400 block'>Current Status:</span>
                        <StatusBadge status={trackedOrder.status} />
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-neutral-400 block'>Payment Status:</span>
                        <StatusBadge status={trackedOrder.payment_status} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Steps Timeline */}
                {!isCancelled && (
                  <div className='grid gap-4'>
                    {trackingSteps.map(({ key, stepNumber, title, description, Icon }, index) => {
                      const isCompleted = index <= currentStepIdx
                      const isCurrent = index === currentStepIdx

                      return (
                        <div
                          key={key}
                          className={`grid gap-5 border p-5 transition-all rounded-lg ${
                            isCurrent
                              ? 'border-gold bg-gold/5 ring-1 ring-gold'
                              : isCompleted
                                ? 'border-emerald-200 bg-emerald-50/40'
                                : 'border-black/10 bg-white opacity-60'
                          } sm:grid-cols-[auto_1fr] sm:items-center`}
                        >
                          <div className='flex items-center gap-4'>
                            <span
                              className={`grid size-11 place-items-center rounded ${
                                isCompleted
                                  ? 'bg-black text-gold'
                                  : 'bg-neutral-100 text-neutral-400'
                              }`}
                            >
                              <Icon className='size-5' strokeWidth={1.8} />
                            </span>
                            <span className='text-xs font-bold text-muted-foreground'>
                              {stepNumber}
                            </span>
                          </div>

                          <div className='space-y-1'>
                            <div className='flex items-center justify-between'>
                              <h3 className='font-heading text-lg font-bold'>{title}</h3>
                              {isCompleted && (
                                <span className='text-3xs font-semibold uppercase bg-black text-white px-2 py-0.5 rounded'>
                                  {isCurrent ? 'Current Phase' : 'Done'}
                                </span>
                              )}
                            </div>
                            <p className='text-xs leading-relaxed text-muted-foreground'>
                              {description}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Shipping & Order Items Breakdown Card */}
                <div className='border border-black/10 p-6 sm:p-8 space-y-6 bg-white rounded-lg'>
                  <div className='flex items-center gap-2 border-b border-black/10 pb-4'>
                    <MapPin className='size-5 text-gold' />
                    <h3 className='font-heading text-xl font-bold'>Delivery Destination</h3>
                  </div>

                  <div className='text-xs space-y-1 text-muted-foreground'>
                    <p className='font-bold text-black text-sm'>{trackedOrder.customer_name}</p>
                    <p>{trackedOrder.shipping_address}</p>
                    <p>{trackedOrder.shipping_city}, {trackedOrder.shipping_state}, Nigeria</p>
                    <p className='pt-1 font-medium text-black'>Phone: {trackedOrder.customer_phone}</p>
                  </div>

                  {/* Items List */}
                  <div className='space-y-3 pt-4 border-t border-black/10'>
                    <div className='flex items-center gap-2'>
                      <ShoppingBag className='size-5 text-gold' />
                      <h3 className='font-heading text-xl font-bold'>Order Items</h3>
                    </div>

                    <div className='divide-y divide-black/10 border-t border-b border-black/10'>
                      {trackedOrder.items.map((item) => (
                        <div key={item.id} className='py-3 flex items-center justify-between text-xs gap-4'>
                          <div>
                            <p className='font-bold text-black'>{item.product_name}</p>
                            <p className='text-muted-foreground'>
                              Qty: {item.quantity} {item.selected_color ? `| Color: ${item.selected_color}` : ''} {item.selected_size ? `| Size: ${item.selected_size}` : ''}
                            </p>
                          </div>
                          <p className='font-bold text-black'>
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Financial Summary */}
                    <div className='space-y-1.5 pt-2 text-xs font-sans'>
                      <div className='flex justify-between text-muted-foreground'>
                        <span>Subtotal:</span>
                        <span>₦{trackedOrder.subtotal_amount.toLocaleString()}</span>
                      </div>
                      <div className='flex justify-between text-muted-foreground'>
                        <span>Delivery Fee:</span>
                        <span>₦{trackedOrder.delivery_amount.toLocaleString()}</span>
                      </div>
                      <div className='flex justify-between font-bold text-sm text-black border-t border-black/10 pt-2'>
                        <span>Grand Total:</span>
                        <span className='text-gold'>₦{trackedOrder.total_amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Default Static Process Guide */
              <div className='grid gap-4'>
                <div className='p-6 bg-neutral-50 border border-black/10 space-y-2 rounded-lg'>
                  <p className='text-xs font-semibold uppercase text-gold'>
                    How Tracking Works
                  </p>
                  <h3 className='font-heading text-2xl font-bold'>Real-time Order Milestones</h3>
                  <p className='text-xs leading-relaxed text-muted-foreground'>
                    Once an order is placed, our team updates the status at every stage of fulfillment — from verification and UK packing to waybill dispatch and delivery.
                  </p>
                </div>

                {trackingSteps.map(({ stepNumber, title, description, Icon }) => (
                  <div
                    key={title}
                    className='grid gap-5 border border-black/10 p-6 sm:grid-cols-[auto_1fr] sm:items-start bg-white rounded-lg'
                  >
                    <div className='flex items-center gap-4'>
                      <span className='grid size-11 place-items-center bg-gold/20 text-black rounded'>
                        <Icon className='size-5' strokeWidth={1.7} />
                      </span>
                      <span className='text-xs font-bold text-muted-foreground'>
                        {stepNumber}
                      </span>
                    </div>
                    <div>
                      <h3 className='font-heading text-xl font-semibold'>
                        {title}
                      </h3>
                      <p className='max-w-xl text-xs leading-relaxed text-muted-foreground mt-1'>
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
