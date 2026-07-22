'use client'

import { Building2, CheckCircle2, CreditCard, ShieldCheck } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCheckout, type PaymentMethod } from '@/stores/hooks/use-checkout'

export function CheckoutPaymentSelector() {
  const { paymentMethod, setPaymentMethod } = useCheckout()

  return (
    <Card className='rounded-none border-black/10 bg-white'>
      <CardHeader className='pb-4 border-b border-black/10'>
        <CardTitle className='text-lg font-semibold flex items-center justify-between'>
          <span>Payment method</span>
          <span className='text-xs font-normal text-muted-foreground flex items-center gap-1'>
            <ShieldCheck className='size-4 text-emerald-600' /> Encrypted & Secure
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-6 space-y-4'>
        {/* Option 1: Paystack Online Payment */}
        <label
          onClick={() => setPaymentMethod('paystack')}
          className={`flex items-start gap-4 p-4 border cursor-pointer transition-all ${
            paymentMethod === 'paystack'
              ? 'border-gold bg-gold/5 ring-1 ring-gold'
              : 'border-black/10 bg-white hover:border-black/30'
          }`}
        >
          <div className='mt-0.5'>
            <input
              type='radio'
              name='paymentMethod'
              value='paystack'
              checked={paymentMethod === 'paystack'}
              onChange={() => setPaymentMethod('paystack')}
              className='sr-only'
            />
            <div
              className={`size-5 rounded-full border flex items-center justify-center ${
                paymentMethod === 'paystack'
                  ? 'border-gold bg-black text-gold'
                  : 'border-black/30'
              }`}
            >
              {paymentMethod === 'paystack' && <CheckCircle2 className='size-3.5 fill-gold text-black' />}
            </div>
          </div>

          <div className='flex-1 space-y-1'>
            <div className='flex items-center justify-between'>
              <span className='font-semibold text-sm text-black flex items-center gap-2'>
                <CreditCard className='size-4 text-gold' /> Paystack Online Payment
              </span>
              <span className='text-3xs uppercase tracking-wider font-bold bg-black text-gold px-2 py-0.5'>
                Recommended
              </span>
            </div>
            <p className='text-xs text-muted-foreground leading-relaxed'>
              Pay instantly using Debit Cards (Mastercard, Visa, Verve), Instant Bank Transfer, USSD, or Apple Pay.
            </p>
          </div>
        </label>

        {/* Option 2: Direct Bank Transfer */}
        <label
          onClick={() => setPaymentMethod('bank_transfer')}
          className={`flex items-start gap-4 p-4 border cursor-pointer transition-all ${
            paymentMethod === 'bank_transfer'
              ? 'border-gold bg-gold/5 ring-1 ring-gold'
              : 'border-black/10 bg-white hover:border-black/30'
          }`}
        >
          <div className='mt-0.5'>
            <input
              type='radio'
              name='paymentMethod'
              value='bank_transfer'
              checked={paymentMethod === 'bank_transfer'}
              onChange={() => setPaymentMethod('bank_transfer')}
              className='sr-only'
            />
            <div
              className={`size-5 rounded-full border flex items-center justify-center ${
                paymentMethod === 'bank_transfer'
                  ? 'border-gold bg-black text-gold'
                  : 'border-black/30'
              }`}
            >
              {paymentMethod === 'bank_transfer' && <CheckCircle2 className='size-3.5 fill-gold text-black' />}
            </div>
          </div>

          <div className='flex-1 space-y-1'>
            <span className='font-semibold text-sm text-black flex items-center gap-2'>
              <Building2 className='size-4 text-gold' /> Direct Bank Transfer / Pay on Delivery
            </span>
            <p className='text-xs text-muted-foreground leading-relaxed'>
              Place your order now and complete payment via manual bank transfer or cash upon delivery confirmation.
            </p>
          </div>
        </label>
      </CardContent>
    </Card>
  )
}
