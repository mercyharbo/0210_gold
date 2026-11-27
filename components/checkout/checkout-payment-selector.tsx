import { CreditCard } from 'lucide-react'

import { Field, FieldLabel } from '@/components/ui/field'

export function CheckoutPaymentSelector() {
  return (
    <section aria-labelledby='checkout-payment-heading' className='flex flex-col gap-5 border-t border-gray-200 pt-8'>
      <h2 id='checkout-payment-heading' className='text-xl font-medium'>Payment</h2>

      <Field className='flex-row items-center gap-4 border border-gray-200 p-5' data-disabled>
        <input id='checkout-bachs' name='payment-method' type='radio' checked readOnly disabled className='size-4 accent-black' />

        <div className='flex flex-1 flex-col gap-1'>
          <FieldLabel htmlFor='checkout-bachs'>Bachs checkout</FieldLabel>
          <p className='text-xs leading-5 text-gray-600'>Payment options will be provided by Bachs.</p>
        </div>

        <CreditCard className='size-5 shrink-0 text-gray-600' strokeWidth={1.5} />
      </Field>

      <p className='text-sm leading-6 text-gray-600'>
        Payment is currently unavailable. You will not be charged.
      </p>
    </section>
  )
}
