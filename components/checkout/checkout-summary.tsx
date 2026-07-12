'use client'

import Image from 'next/image'

import { formatNaira } from '@/components/index/shop/shop-data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useCheckout } from '@/stores/hooks/use-checkout'
import type { CartItem } from '@/stores/hooks/use-cart'

type CheckoutSummaryProps = {
  cartItems: CartItem[]
  subtotal: number
  isPending: boolean
}

export function CheckoutSummary({
  cartItems,
  subtotal,
  isPending,
}: CheckoutSummaryProps) {
  const { shippingCity } = useCheckout()

  // Dynamic delivery fee calculation
  const isOsogbo = shippingCity.toLowerCase().trim() === 'osogbo'
  const deliveryFee = shippingCity ? (isOsogbo ? 2000 : 5000) : 0
  const totalAmount = subtotal + deliveryFee

  return (
    <div className='space-y-6'>
      <Card className='rounded-none border-black/10 bg-muted/20'>
        <CardHeader className='pb-4 border-b border-black/10'>
          <CardTitle className='text-lg font-semibold'>Order summary</CardTitle>
        </CardHeader>
        <CardContent className='pt-6 space-y-6'>
          {/* Item Rows */}
          <div className='divide-y divide-black/10 max-h-80 overflow-y-auto pr-1'>
            {cartItems.map((item) => (
              <div
                key={`${item.product.id}-${item.selectedSize ?? ''}-${
                  item.selectedColor ?? ''
                }`}
                className='flex items-start gap-4 py-3 first:pt-0 last:pb-0'
              >
                <div className='relative size-16 shrink-0 bg-muted border border-black/5'>
                  <Image
                    src={item.product.imageSrc}
                    alt={item.product.name}
                    fill
                    sizes='64px'
                    className='object-cover'
                  />
                </div>
                <div className='min-w-0 flex-1 space-y-1 text-sm'>
                  <h4 className='font-semibold truncate text-black'>
                    {item.product.name}
                  </h4>
                  <div className='flex flex-wrap gap-x-2 text-xs text-muted-foreground'>
                    {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                    {item.selectedColor && (
                      <span>Color: {item.selectedColor}</span>
                    )}
                    <span>Qty: {item.quantity}</span>
                  </div>
                  <p className='font-semibold text-black'>
                    {formatNaira((item.product.price ?? 0) * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className='border-t border-black/10 pt-4 space-y-3 text-sm'>
            <div className='flex justify-between items-start'>
              <span className='text-muted-foreground'>Subtotal</span>
              <span className='font-semibold text-black'>
                {formatNaira(subtotal)}
              </span>
            </div>
            <div className='flex justify-between items-start'>
              <span className='text-muted-foreground'>Delivery fee</span>
              <span className='font-semibold text-black'>
                {shippingCity ? (
                  formatNaira(deliveryFee)
                ) : (
                  <span className='text-xs text-muted-foreground font-normal italic'>
                    Calculated from address state/city
                  </span>
                )}
              </span>
            </div>
            <div className='flex justify-between items-start border-t border-black/10 pt-3 text-base'>
              <span className='font-bold text-black'>Total</span>
              <span className='font-bold text-black'>
                {formatNaira(totalAmount)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type='submit'
            disabled={isPending}
            className='w-full h-12 rounded-none bg-black text-white hover:bg-gold hover:text-black text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70'
          >
            {isPending && <Spinner className='size-4 text-current' />}
            {isPending ? 'Processing Order...' : 'Place Order'}
          </Button>

          <p className='text-center text-xs text-muted-foreground'>
            Secure checkout processed via our payment gateway.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
