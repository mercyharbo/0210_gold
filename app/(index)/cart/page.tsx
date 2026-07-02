import {
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { formatNaira } from '@/components/index/shop/shop-data'

const cartItems = [
  {
    id: 'flowing-occasion-abaya',
    name: 'Flowing Occasion Abaya',
    category: 'Abaya',
    color: 'Black',
    size: 'M',
    quantity: 1,
    price: 120000,
    imageAlt: 'Elegant abaya garment styled in a boutique studio',
    imageSrc: '/images/featured-collections/abaya.png',
  },
  {
    id: 'gold-styling-set',
    name: 'Gold Styling Set',
    category: 'Jewellery & Accessories',
    color: 'Gold',
    size: 'One size',
    quantity: 1,
    price: 185000,
    imageAlt: 'Gold jewellery and accessories styled as a premium flat lay',
    imageSrc: '/images/featured-collections/jewellery-accessories.png',
  },
  {
    id: 'structured-day-bag',
    name: 'Structured Day Bag',
    category: 'Bags',
    color: 'Brown',
    size: 'One size',
    quantity: 1,
    price: 78000,
    imageAlt: 'Elegant bags styled on a warm studio plinth',
    imageSrc: '/images/featured-collections/bags.png',
  },
]

const subtotal = cartItems.reduce(
  (total, item) => total + item.price * item.quantity,
  0,
)
const delivery = 5000
const total = subtotal + delivery

export default function CartPage() {
  return (
    <div className='bg-white text-black'>
      <section className='border-b border-black/10 px-5 py-14 sm:px-8 lg:px-12 lg:py-16'>
        <div className='mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='text-xs font-semibold uppercase text-gold'>
              Shopping cart
            </p>
            <h1 className='font-heading text-5xl font-semibold leading-none sm:text-6xl'>
              Your cart
            </h1>
          </div>
          <Link
            href='/shop'
            className='inline-flex h-11 w-fit items-center gap-2 border border-black px-5 text-sm font-semibold transition-colors hover:bg-black hover:text-white'
          >
            Continue shopping
            <ArrowRight className='size-4' strokeWidth={1.8} />
          </Link>
        </div>
      </section>

      <section className='px-5 py-12 sm:px-8 lg:px-12'>
        <div className='mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_390px]'>
          <div>
            <div className='hidden border-b border-black/10 pb-3 text-xs font-semibold uppercase text-muted-foreground md:grid md:grid-cols-[1fr_120px_120px]'>
              <span>Product</span>
              <span className='text-center'>Quantity</span>
              <span className='text-right'>Total</span>
            </div>

            <div className='divide-y divide-black/10'>
              {cartItems.map((item) => (
                <article
                  key={item.id}
                  className='grid gap-5 py-6 md:grid-cols-[1fr_120px_120px] md:items-center'
                >
                  <div className='grid grid-cols-[108px_1fr] gap-5 sm:grid-cols-[132px_1fr]'>
                    <Link
                      href={`/products/${item.id}`}
                      className='relative aspect-square overflow-hidden bg-muted'
                    >
                      <Image
                        src={item.imageSrc}
                        alt={item.imageAlt}
                        fill
                        sizes='132px'
                        className='object-cover'
                      />
                    </Link>

                    <div className='flex min-w-0 flex-col justify-between gap-5'>
                      <div>
                        <p className='text-xs font-semibold uppercase text-gold'>
                          {item.category}
                        </p>
                        <Link
                          href={`/products/${item.id}`}
                          className='block font-heading text-2xl font-semibold transition-opacity hover:opacity-65'
                        >
                          {item.name}
                        </Link>
                        <p className='text-sm text-muted-foreground'>
                          {item.color} / {item.size}
                        </p>
                        <p className='text-sm font-semibold md:hidden'>
                          {formatNaira(item.price)}
                        </p>
                      </div>

                      <button
                        type='button'
                        className='inline-flex w-fit items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-black'
                      >
                        <Trash2 className='size-4' strokeWidth={1.7} />
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className='flex w-fit items-center border border-black/15 md:justify-self-center'>
                    <button
                      type='button'
                      aria-label={`Decrease ${item.name} quantity`}
                      className='grid size-10 place-items-center transition-colors hover:bg-black hover:text-white'
                    >
                      <Minus className='size-4' strokeWidth={1.7} />
                    </button>
                    <span className='grid h-10 min-w-10 place-items-center border-x border-black/15 text-sm font-semibold'>
                      {item.quantity}
                    </span>
                    <button
                      type='button'
                      aria-label={`Increase ${item.name} quantity`}
                      className='grid size-10 place-items-center transition-colors hover:bg-black hover:text-white'
                    >
                      <Plus className='size-4' strokeWidth={1.7} />
                    </button>
                  </div>

                  <p className='hidden text-right text-sm font-semibold md:block'>
                    {formatNaira(item.price * item.quantity)}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <aside className='h-fit border border-black/10 p-6 sm:p-8'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='text-xs font-semibold uppercase text-muted-foreground'>
                  Summary
                </p>
                <h2 className='font-heading text-3xl font-semibold'>
                  Order total
                </h2>
              </div>
              <ShoppingBag className='size-6 text-gold' strokeWidth={1.7} />
            </div>

            <div className='space-y-4 border-b border-black/10 pb-6 text-sm'>
              <div className='flex items-center justify-between gap-4'>
                <span className='text-muted-foreground'>Subtotal</span>
                <span className='font-semibold'>{formatNaira(subtotal)}</span>
              </div>
              <div className='flex items-center justify-between gap-4'>
                <span className='text-muted-foreground'>Delivery</span>
                <span className='font-semibold'>{formatNaira(delivery)}</span>
              </div>
            </div>

            <div className='flex items-center justify-between gap-4 py-6'>
              <span className='font-heading text-2xl font-semibold'>Total</span>
              <span className='text-lg font-semibold'>{formatNaira(total)}</span>
            </div>

            <Link
              href='/checkout'
              className='inline-flex h-12 w-full items-center justify-center gap-2 bg-black px-6 text-sm font-semibold text-white transition-colors hover:bg-gold'
            >
              Proceed to checkout
              <ArrowRight className='size-4' strokeWidth={1.8} />
            </Link>

            <div className='grid gap-3 border-t border-black/10 pt-6'>
              <div className='flex gap-3'>
                <ShieldCheck
                  className='size-5 text-gold'
                  strokeWidth={1.7}
                />
                <p className='text-sm leading-6 text-muted-foreground'>
                  Checkout is prepared for secure payment, delivery details,
                  and order confirmation.
                </p>
              </div>
              <Link
                href='/track-order'
                className='text-sm font-semibold underline underline-offset-4'
              >
                Track an existing order
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
