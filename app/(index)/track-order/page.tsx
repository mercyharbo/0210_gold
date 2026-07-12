import {
  ArrowRight,
  ClipboardCheck,
  HelpCircle,
  PackageCheck,
  Search,
  Truck,
} from 'lucide-react'
import Link from 'next/link'

const trackingSteps = [
  {
    title: 'Order received',
    description: 'Your order details are confirmed and prepared for processing.',
    Icon: ClipboardCheck,
  },
  {
    title: 'Being prepared',
    description: 'Items are checked, packed, and matched with your delivery details.',
    Icon: PackageCheck,
  },
  {
    title: 'Out for delivery',
    description: 'Your order or waybill has been dispatched with delivery updates active.',
    Icon: Truck,
  },
]

const inputClassName =
  'h-12 w-full border border-black/15 bg-white px-4 text-sm text-black outline-none transition-colors placeholder:text-muted-foreground focus:border-black'

export default function TrackOrderPage() {
  return (
    <div className='bg-white text-black'>
      <section className='border-b border-black/10 px-5 py-16 sm:px-8 lg:px-12 lg:py-20'>
        <div className='mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-end'>
          <div>
            <p className='text-xs font-semibold uppercase text-gold'>
              Order tracking
            </p>
            <h1 className='max-w-3xl font-heading text-5xl font-semibold leading-[0.95] sm:text-6xl lg:text-7xl'>
              Track your order from confirmation to delivery.
            </h1>
          </div>

          <p className='max-w-2xl text-base leading-7 text-muted-foreground lg:justify-self-end'>
            Use your order number, email, phone number, or waybill reference to
            check the progress of fashion orders, jewellery purchases, and UK to
            Nigeria deliveries.
          </p>
        </div>
      </section>

      <section className='px-5 py-14 sm:px-8 lg:px-12'>
        <div className='mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]'>
          <div className='border border-black/10 p-6 sm:p-8 space-y-5'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='text-xs font-semibold uppercase text-muted-foreground'>
                  Find order
                </p>
                <h2 className='font-heading text-3xl font-semibold'>
                  Enter your details
                </h2>
              </div>
              <Search className='size-6 text-gold' strokeWidth={1.7} />
            </div>

            <form className='space-y-5'>
              <div className='space-y-2'>
                <label
                  htmlFor='order-reference'
                  className='block text-sm font-medium'
                >
                  Order or waybill number
                </label>
                <input
                  id='order-reference'
                  type='text'
                  placeholder='Example: FML-5482'
                  className={inputClassName}
                />
              </div>

              <div className='space-y-2'>
                <label
                  htmlFor='customer-contact'
                  className='block text-sm font-medium'
                >
                  Email or phone number
                </label>
                <input
                  id='customer-contact'
                  type='text'
                  placeholder='Used when placing the order'
                  className={inputClassName}
                />
              </div>

              <button
                type='submit'
                className='inline-flex h-12 w-full items-center justify-center gap-2 bg-black px-6 text-sm font-semibold text-white transition-colors hover:bg-gold'
              >
                Track order
                <ArrowRight className='size-4' strokeWidth={1.8} />
              </button>
            </form>
          </div>

          <div className='grid gap-4'>
            {trackingSteps.map(({ title, description, Icon }, index) => (
              <div
                key={title}
                className='grid gap-5 border border-black/10 p-6 sm:grid-cols-[auto_1fr] sm:items-start'
              >
                <div className='flex items-center gap-4'>
                  <span className='grid size-11 place-items-center bg-gold/35 text-black'>
                    <Icon className='size-5' strokeWidth={1.7} />
                  </span>
                  <span className='text-sm font-semibold text-muted-foreground'>
                    0{index + 1}
                  </span>
                </div>
                <div>
                  <h3 className='font-heading text-2xl font-semibold'>
                    {title}
                  </h3>
                  <p className='max-w-xl text-sm leading-6 text-muted-foreground'>
                    {description}
                  </p>
                </div>
              </div>
            ))}

            <div className='border border-black bg-black p-6 text-white space-y-5 sm:p-8'>
              <HelpCircle
                className='size-6 text-gold'
                strokeWidth={1.7}
              />
              <h3 className='font-heading text-3xl font-semibold'>
                Need help with an order?
              </h3>
              <p className='max-w-2xl text-sm leading-6 text-muted-foreground'>
                Send your order details and delivery name so support can check
                the latest status and confirm the next update.
              </p>
              <div className='flex flex-wrap gap-3'>
                <Link
                  href='/contact'
                  className='inline-flex h-11 items-center justify-center bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-gold/35'
                >
                  Contact support
                </Link>
                <Link
                  href='/faq'
                  className='inline-flex h-11 items-center justify-center border border-white/35 px-5 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white hover:text-black'
                >
                  View FAQs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
