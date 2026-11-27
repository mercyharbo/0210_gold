'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'

import { OrderSummary } from '@/components/cart/order-summary'
import { CheckoutPaymentSelector } from '@/components/checkout/checkout-payment-selector'
import { CheckoutShippingForm } from '@/components/checkout/checkout-shipping-form'
import { checkoutDetailsSchema, type CheckoutDetails } from '@/lib/validations/checkout-details'
import { useCart } from '@/stores/hooks/use-cart'

export function CheckoutForm() {
  const { items, isHydrated } = useCart()
  const form = useForm<CheckoutDetails>({
    resolver: zodResolver(checkoutDetailsSchema),
    mode: 'onBlur',
    defaultValues: {
      recipient_name: '',
      email: '',
      phone: '',
      address_line_1: '',
      state: '',
      local_area: '',
      locality: '',
    },
  })

  if (!isHydrated) {
    return <p role='status' className='px-6 py-10'>Loading...</p>
  }

  return (
    <section className='mx-auto flex w-full max-w-screen-2xl flex-col gap-10 px-6 py-10 md:gap-14 lg:px-12'>
      <div className='flex flex-col items-start gap-5'>
        <Link href='/cart' className='inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#e10600]'>
          <ArrowLeft className='size-4' />
          Back to bag
        </Link>

        <h1 className='text-2xl font-semibold leading-snug md:text-4xl'>Checkout</h1>
      </div>

      {!items.length && (
        <p className='text-sm text-gray-600'>
          Your bag is empty.{' '}
          <Link href='/shop' className='text-black underline underline-offset-4 hover:text-[#e10600]'>
            Explore the shop
          </Link>
          {' '}to choose your pieces.
        </p>
      )}

      <FormProvider {...form}>
        {/* UI only: prevent browser submission until the checkout APIs are connected. */}
        <form
          onSubmit={(event) => event.preventDefault()}
          noValidate
          className='grid min-w-0 gap-10 lg:grid-cols-3 lg:items-start lg:gap-12'
        >
          <div className='flex min-w-0 flex-col gap-10 lg:col-span-2'>
            <p className='text-sm text-gray-600'>
              Already have an account?{' '}
              <Link href='/login' className='text-black underline underline-offset-4 hover:text-[#e10600]'>
                Sign in
              </Link>
            </p>

            <CheckoutShippingForm />
            <CheckoutPaymentSelector />
          </div>

          <OrderSummary context='checkout' />
        </form>
      </FormProvider>
    </section>
  )
}
