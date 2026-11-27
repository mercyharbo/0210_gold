'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { formatNaira } from '@/components/index/shop/shop-data'
import { Button } from '@/components/ui/button'
import { useCart } from '@/stores/hooks/use-cart'

export function OrderSummary({ context }: { context: 'cart' | 'checkout' }) {
  const { items, subtotal, totalItems } = useCart()

  return (
    <aside aria-label='Order summary' className='flex min-w-0 flex-col gap-6 bg-gray-50 p-5 sm:p-6 lg:sticky lg:top-28'>
      <h2 className='text-xl font-medium'>Order summary</h2>

      {context === 'checkout' && items.length > 0 && (
        <ul aria-label='Order items' className='flex max-h-96 flex-col gap-5 overflow-y-auto'>
          {items.map((item) => (
            <li
              key={`${item.product.id}-${item.selectedKarat ?? ''}-${item.selectedSize ?? ''}-${item.selectedColor ?? ''}`}
              className='flex min-w-0 gap-3'
            >
              <div className='relative h-24 w-20 shrink-0 bg-gray-200'>
                {item.product.imageSrc && (
                  <Image
                    src={item.product.imageSrc}
                    alt={item.product.imageAlt || item.product.name}
                    fill
                    sizes='80px'
                    className='object-cover'
                  />
                )}
              </div>

              <div className='flex min-w-0 flex-1 flex-col gap-2'>
                <Link href={`/products/${item.product.slug}`} className='break-words text-sm font-medium hover:text-[#e10600]'>
                  {item.product.name}
                </Link>
                <p className='text-xs text-gray-600'>
                  {[item.selectedKarat, item.selectedColor, item.selectedSize].filter(Boolean).join(' / ')}
                </p>
                <p className='text-xs text-gray-600'>Quantity: {item.quantity}</p>
                <p className='text-sm'>{formatNaira((item.unitPrice ?? item.product.price ?? 0) * item.quantity)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <dl className='flex flex-col gap-4 text-sm'>
        <div className='flex justify-between gap-4'>
          <dt>Subtotal ({totalItems} {totalItems === 1 ? 'piece' : 'pieces'})</dt>
          <dd>{formatNaira(subtotal)}</dd>
        </div>
        <div className='flex justify-between gap-4'>
          <dt className='text-gray-600'>Delivery</dt>
          <dd className='text-right text-gray-600'>Calculated at checkout</dd>
        </div>
        <div className='flex justify-between gap-4 border-t border-gray-200 pt-5 text-base font-medium'>
          <dt>Estimated subtotal</dt>
          <dd aria-live='polite'>{formatNaira(subtotal)}</dd>
        </div>
      </dl>

      <p className='text-xs leading-5 text-gray-600'>
        Delivery and the final total will be confirmed before payment.
      </p>

      {context === 'cart' ? (
        <Button asChild className='h-12 rounded-none bg-black px-5 text-white hover:bg-[#e10600]'>
          <Link href='/checkout'>
            Continue to checkout
            <ArrowRight data-icon='inline-end' />
          </Link>
        </Button>
      ) : (
        <div className='flex flex-col gap-3'>
          <Button
            type='button'
            disabled
            aria-describedby='checkout-unavailable'
            className='h-12 w-full rounded-none bg-black text-white disabled:opacity-60'
          >
            Continue to payment
            <ArrowRight data-icon='inline-end' />
          </Button>
          <p id='checkout-unavailable' className='text-xs leading-5 text-gray-600'>
            Online checkout is currently unavailable. Your details will not be submitted.
          </p>
        </div>
      )}

      <Link href='/contact' className='text-sm underline underline-offset-4 hover:text-[#e10600]'>
        Need help? Contact us
      </Link>
    </aside>
  )
}
