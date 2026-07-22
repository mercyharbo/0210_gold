'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useTransition } from 'react'

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

  // Redirect to cart if empty (only after cart is hydrated on client)
  useEffect(() => {
    if (isHydrated && cartItems.length === 0 && !isPending) {
      router.replace('/cart')
    }
  }, [isHydrated, cartItems.length, router, isPending])

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
        clearCart()
        if (result.authorizationUrl) {
          window.location.href = result.authorizationUrl
        } else {
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
