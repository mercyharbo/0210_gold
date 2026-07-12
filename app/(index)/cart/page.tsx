'use client'

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
import { Spinner } from '@/components/ui/spinner'
import { useCart } from '@/stores/hooks/use-cart'
import { useToast } from '@/stores/hooks/use-toast'

export default function CartPage() {
  const { items: cartItems, subtotal, updateQuantity, removeItem, isHydrated } = useCart()
  const { toast } = useToast()

  if (!isHydrated) {
    return (
      <div className='flex min-h-[400px] items-center justify-center bg-white text-black'>
        <Spinner className='size-8' />
      </div>
    )
  }

  const delivery = cartItems.length > 0 ? 5000 : 0
  const total = subtotal + delivery

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

      {cartItems.length === 0 ? (
        <section className='px-5 py-20 sm:px-8 lg:px-12'>
          <div className='mx-auto max-w-md text-center flex flex-col items-center gap-6 py-10'>
            <div className='size-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground'>
              <ShoppingBag className='size-8 stroke-[1.5]' />
            </div>
            <div className='flex flex-col gap-2'>
              <h2 className='font-heading text-3xl font-semibold'>
                Your cart is empty
              </h2>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                Browse our curated collections of fashion items and premium
                accessories to find your perfect pieces.
              </p>
            </div>
            <Link
              href='/shop'
              className='inline-flex h-12 items-center justify-center gap-2 bg-black px-8 text-sm font-semibold text-white transition-opacity hover:opacity-85'
            >
              Shop our collections
              <ArrowRight className='size-4' strokeWidth={1.8} />
            </Link>
          </div>
        </section>
      ) : (
        <section className='px-5 py-12 sm:px-8 lg:px-12'>
          <div className='mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_390px]'>
            <div>
              <div className='hidden border-b border-black/10 pb-3 text-xs font-semibold uppercase text-muted-foreground md:grid md:grid-cols-[1fr_120px_120px]'>
                <span>Product</span>
                <span className='text-center'>Quantity</span>
                <span className='text-right'>Total</span>
              </div>

              <div className='divide-y divide-black/10'>
                {cartItems.map((item) => {
                  const product = item.product
                  const itemKey = `${product.id}-${item.selectedSize || ''}-${item.selectedColor || ''}`
                  return (
                    <article
                      key={itemKey}
                      className='grid gap-5 py-6 md:grid-cols-[1fr_120px_120px] md:items-center'
                    >
                      <div className='grid grid-cols-[108px_1fr] gap-5 sm:grid-cols-[132px_1fr]'>
                        <Link
                          href={`/products/${product.slug}`}
                          className='relative aspect-square overflow-hidden bg-muted'
                        >
                          <Image
                            src={product.imageSrc}
                            alt={product.imageAlt}
                            fill
                            sizes='132px'
                            className='object-cover'
                          />
                        </Link>

                        <div className='flex min-w-0 flex-col justify-between gap-5'>
                          <div>
                            <p className='text-xs font-semibold uppercase text-gold'>
                              {product.category}
                            </p>
                            <Link
                              href={`/products/${product.slug}`}
                              className='block font-heading text-2xl font-semibold transition-opacity hover:opacity-65'
                            >
                              {product.name}
                            </Link>
                            {item.selectedColor || item.selectedSize ? (
                              <p className='text-sm text-muted-foreground mt-1'>
                                {[item.selectedColor, item.selectedSize]
                                  .filter(Boolean)
                                  .join(' / ')}
                              </p>
                            ) : null}
                            <p className='text-sm font-semibold md:hidden mt-2'>
                              {formatNaira(product.price ?? 0)}
                            </p>
                          </div>

                          <button
                            type='button'
                            onClick={() => {
                              removeItem(
                                product.id,
                                item.selectedSize,
                                item.selectedColor
                              )
                              toast(`"${product.name}" removed from your cart.`, 'success')
                            }}
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
                          aria-label={`Decrease ${product.name} quantity`}
                          onClick={() =>
                            updateQuantity(
                              product.id,
                              item.quantity - 1,
                              item.selectedSize,
                              item.selectedColor
                            )
                          }
                          disabled={item.quantity <= 1}
                          className='grid size-10 place-items-center transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-35'
                        >
                          <Minus className='size-4' strokeWidth={1.7} />
                        </button>
                        <span className='grid h-10 min-w-10 place-items-center border-x border-black/15 text-sm font-semibold'>
                          {item.quantity}
                        </span>
                        <button
                          type='button'
                          aria-label={`Increase ${product.name} quantity`}
                          onClick={() =>
                            updateQuantity(
                              product.id,
                              item.quantity + 1,
                              item.selectedSize,
                              item.selectedColor
                            )
                          }
                          className='grid size-10 place-items-center transition-colors hover:bg-black hover:text-white'
                        >
                          <Plus className='size-4' strokeWidth={1.7} />
                        </button>
                      </div>

                      <p className='hidden text-right text-sm font-semibold md:block'>
                        {formatNaira((product.price ?? 0) * item.quantity)}
                      </p>
                    </article>
                  )
                })}
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

              <div className='space-y-4 border-b border-black/10 pb-6 text-sm mt-6'>
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
                <span className='font-heading text-2xl font-semibold'>
                  Total
                </span>
                <span className='text-lg font-semibold'>
                  {formatNaira(total)}
                </span>
              </div>

              <Link
                href='/checkout'
                className='inline-flex h-12 w-full items-center justify-center gap-2 bg-black px-6 text-sm font-semibold text-white transition-colors hover:bg-gold hover:text-black'
              >
                Proceed to checkout
                <ArrowRight className='size-4' strokeWidth={1.8} />
              </Link>

              <div className='grid gap-3 border-t border-black/10 pt-6 mt-6'>
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
      )}
    </div>
  )
}
