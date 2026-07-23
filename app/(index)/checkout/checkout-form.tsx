'use client'

import Script from 'next/script'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'


import { CheckoutAddressSelector } from '@/components/checkout/checkout-address-selector'
import { CheckoutPaymentSelector } from '@/components/checkout/checkout-payment-selector'
import { CheckoutPromoBanner } from '@/components/checkout/checkout-promo-banner'
import { CheckoutSaveInfo } from '@/components/checkout/checkout-save-info'
import { CheckoutShippingForm } from '@/components/checkout/checkout-shipping-form'
import { CheckoutSummary } from '@/components/checkout/checkout-summary'
import { NIGERIA_STATES } from '@/lib/data/nigeria-states'
import { useCart } from '@/stores/hooks/use-cart'
import { useCheckout } from '@/stores/hooks/use-checkout'
import type { CustomerAddress } from '@/types/address'
import type { CustomerProfile } from '@/types/profile'

import { createOrderAction } from './actions'

function loadPaystackScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).PaystackPop) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export type CheckoutFormProps = {
  initialProfile: CustomerProfile | null
  initialAddresses: CustomerAddress[]
}

export function CheckoutForm({
  initialProfile,
  initialAddresses,
}: CheckoutFormProps) {
  const router = useRouter()
  const { items: cartItems, subtotal, clearCart, isHydrated } = useCart()
  const [isPending, startTransition] = useTransition()
  const [isOrderCompleted, setIsOrderCompleted] = useState(false)

  // Retrieve state and setters from Zustand store
  const {
    customerName,
    setCustomerName,
    customerEmail,
    setCustomerEmail,
    customerPhone,
    setCustomerPhone,
    shippingAddress,
    setShippingAddress,
    shippingCity,
    setShippingCity,
    shippingState,
    setShippingState,
    createAccount,
    password,
    setSelectedAddressId,
    validationError,
    setValidationError,
    setStatesList,
    paymentMethod,
    resetForm,
  } = useCheckout()

  // Fetch states from local endpoint on mount (falls back to local data if needed)
  useEffect(() => {
    fetch('/api/states')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStatesList(data)
        } else {
          setStatesList(NIGERIA_STATES)
        }
      })
      .catch((err) => {
        console.error(
          'Failed to fetch states from endpoint, using local fallback:',
          err
        )
        setStatesList(NIGERIA_STATES)
      })
  }, [setStatesList])

  // Redirect to cart if empty (only after cart is hydrated on client and not completing order)
  useEffect(() => {
    if (isHydrated && cartItems.length === 0 && !isPending && !isOrderCompleted) {
      router.replace('/cart')
    }
  }, [isHydrated, cartItems.length, router, isPending, isOrderCompleted])

  // Populate from profile/addresses on mount or reset
  useEffect(() => {
    if (initialProfile) {
      const name =
        `${initialProfile.first_name || ''} ${initialProfile.last_name || ''}`.trim()
      setCustomerName(name)
      setCustomerEmail(initialProfile.email || '')
      setCustomerPhone(initialProfile.phone || '')
    }

    if (initialAddresses.length > 0) {
      const defaultAddress =
        initialAddresses.find((a) => a.is_default) || initialAddresses[0]
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id)
        setShippingAddress(defaultAddress.address_line_1 || '')
        setShippingCity(defaultAddress.city || '')
        setShippingState(defaultAddress.state || '')
        if (defaultAddress.phone) {
          setCustomerPhone(defaultAddress.phone)
        }
      }
    } else {
      setSelectedAddressId('new')
    }

    return () => {
      // Reset Zustand store state on unmount
      resetForm()
    }
  }, [
    initialProfile,
    initialAddresses,
    setCustomerName,
    setCustomerEmail,
    setCustomerPhone,
    setSelectedAddressId,
    setShippingAddress,
    setShippingCity,
    setShippingState,
    resetForm,
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (
      !customerName.trim() ||
      !customerEmail.trim() ||
      !customerPhone.trim() ||
      !shippingAddress.trim() ||
      !shippingCity.trim() ||
      !shippingState.trim()
    ) {
      setValidationError('Please fill in all required fields.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      setValidationError('Please enter a valid email address.')
      return
    }

    if (createAccount && password.length < 6) {
      setValidationError('Password must be at least 6 characters long.')
      return
    }

    startTransition(async () => {
      const result = await createOrderAction(
        {
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          shippingCity,
          shippingState,
        },
        cartItems,
        createAccount ? password : undefined,
        paymentMethod
      )

      if (result.success && result.orderId) {
        if (result.authorizationUrl && paymentMethod === 'paystack') {
          const isScriptLoaded = await loadPaystackScript()

          if (isScriptLoaded && (window as any).PaystackPop) {
            try {
              const PaystackPop = (window as any).PaystackPop
              const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ''

              // 1. Paystack Pop V1 inline setup
              if (typeof PaystackPop.setup === 'function') {
                const handler = PaystackPop.setup({
                  key: publicKey,
                  email: customerEmail,
                  amount: Math.round((subtotal + (shippingCity.trim().toLowerCase() === 'osogbo' ? 2000 : 5000)) * 100),
                  ref: result.reference || result.orderId,
                  access_code: result.accessCode,
                  callback: (response: any) => {
                    setIsOrderCompleted(true)
                    clearCart()
                    const ref = response?.reference || result.reference || result.orderId
                    router.push(
                      `/order-success?orderId=${result.orderId}&trxref=${ref}&reference=${ref}`
                    )
                  },
                  onClose: () => {
                    setValidationError(
                      'Payment process was closed. Your order has been recorded and you can try paying again.'
                    )
                  },
                })
                handler.openIframe()
                return
              }

              // 2. Paystack Pop V2 inline setup
              if (typeof PaystackPop === 'function') {
                const paystack = new PaystackPop()
                if (result.accessCode && typeof paystack.resumeTransaction === 'function') {
                  paystack.resumeTransaction(result.accessCode, {
                    onSuccess: (trx: any) => {
                      setIsOrderCompleted(true)
                      clearCart()
                      const ref = trx?.reference || result.reference || result.orderId
                      router.push(
                        `/order-success?orderId=${result.orderId}&trxref=${ref}&reference=${ref}`
                      )
                    },
                    onCancel: () => {
                      setValidationError(
                        'Payment process was closed. Your order has been recorded and you can try paying again.'
                      )
                    },
                  })
                  return
                }
              }
            } catch (inlineErr) {
              console.warn('Paystack inline modal error, falling back to redirect:', inlineErr)
            }
          }

          // Fallback to standard authorization URL redirect if inline script fails
          setIsOrderCompleted(true)
          clearCart()
          window.location.href = result.authorizationUrl
        } else {
          setIsOrderCompleted(true)
          clearCart()
          router.push(`/order-success?orderId=${result.orderId}`)
        }
      } else {
        setValidationError(
          result.error || 'Failed to place order. Please try again.'
        )
      }
    })
  }



  // Prevent flash/redirect layout if not hydrated yet
  if (!isHydrated) {
    return null
  }

  return (
    <div className='bg-white text-black'>
      <Script src='https://js.paystack.co/v1/inline.js' strategy='lazyOnload' />
      {/* Top section */}

      <section className='border-b border-black/10 bg-muted px-5 py-8 sm:px-8 lg:px-12'>
        <div className='mx-auto flex max-w-7xl flex-col gap-3'>
          <Link
            href='/cart'
            className='inline-flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground transition-colors hover:text-black'
          >
            <ArrowLeft className='size-3.5' />
            Back to cart
          </Link>
          <h1 className='font-heading text-4xl font-semibold leading-none sm:text-5xl'>
            Checkout
          </h1>
        </div>
      </section>

      {/* Main Form Section */}
      <section className='px-5 py-12 sm:px-8 lg:px-12'>
        <form
          onSubmit={handleSubmit}
          className='mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_390px]'
        >
          {/* Left Column: Forms */}
          <div className='flex flex-col gap-8'>
            {validationError && (
              <div className='rounded-none bg-destructive/10 p-4 border border-destructive/20 text-sm font-medium text-destructive'>
                {validationError}
              </div>
            )}

            {/* Promo banner for Guest checkout */}
            <CheckoutPromoBanner visible={!initialProfile} />

            {/* Saved Addresses Selector */}
            <CheckoutAddressSelector initialAddresses={initialAddresses} />

            {/* Step 1 & 2 Form Fields */}
            <CheckoutShippingForm />

            {/* Step 3 Payment Method Selector */}
            <CheckoutPaymentSelector />

            {/* Step 4 Save User Info (Create Account) */}
            <CheckoutSaveInfo visible={!initialProfile} />
          </div>

          {/* Right Column: Order Summary */}
          <div className='self-start'>
            <CheckoutSummary
              cartItems={cartItems}
              subtotal={subtotal}
              isPending={isPending}
            />
          </div>
        </form>
      </section>
    </div>
  )
}
