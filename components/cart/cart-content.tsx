'use client'

import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useCart } from '@/stores/hooks/use-cart'

import { CartProductRow } from './cart-product-row'
import { OrderSummary } from './order-summary'

export function CartContent() {
  const { items, totalItems, isHydrated } = useCart()

  if (!isHydrated) {
    return <p role='status' className='px-6 py-10'>Loading...</p>
  }

  return (
    <section className='mx-auto flex w-full max-w-screen-2xl flex-col gap-10 px-6 py-10 md:gap-14 lg:px-12'>
      <div className='flex flex-wrap items-end justify-between gap-5'>
        <div className='flex flex-col gap-3'>
          <h1 className='text-2xl font-semibold leading-snug md:text-4xl'>Your bag</h1>
          <p className='text-sm text-gray-600'>
            {totalItems} {totalItems === 1 ? 'piece' : 'pieces'} in your bag
          </p>
        </div>

        <Link href='/shop' className='text-sm font-medium underline underline-offset-4 hover:text-[#e10600]'>
          Continue shopping
        </Link>
      </div>

      {items.length ? (
        <div className='grid min-w-0 gap-10 lg:grid-cols-3 lg:items-start lg:gap-12'>
          <div className='min-w-0 lg:col-span-2'>
            <div aria-hidden='true' className='hidden grid-cols-4 gap-4 border-b border-gray-200 pb-4 text-sm text-gray-600 md:grid'>
              <span className='col-span-2'>Product</span>
              <span className='text-center'>Quantity</span>
              <span className='text-right'>Total</span>
            </div>

            <ul aria-label='Products in your bag' className='divide-y divide-gray-200'>
              {items.map((item) => (
                <CartProductRow
                  key={`${item.product.id}-${item.selectedKarat ?? ''}-${item.selectedSize ?? ''}-${item.selectedColor ?? ''}`}
                  item={item}
                />
              ))}
            </ul>
          </div>

          <OrderSummary context='cart' />
        </div>
      ) : (
        <div className='flex flex-col items-center gap-6 py-16 text-center'>
          <ShoppingBag className='size-10 text-gray-500' strokeWidth={1} />

          <div className='flex flex-col gap-3'>
            <h2 className='text-xl font-medium'>Your bag is empty</h2>
            <p className='max-w-sm text-sm leading-6 text-gray-600'>
              Explore our gold jewellery collections and find a piece to make your own.
            </p>
          </div>

          <Button asChild className='h-12 rounded-none bg-black px-6 text-white hover:bg-[#e10600]'>
            <Link href='/shop'>
              Explore the shop
              <ArrowRight data-icon='inline-end' />
            </Link>
          </Button>
        </div>
      )}
    </section>
  )
}
