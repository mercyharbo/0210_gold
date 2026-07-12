'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCheckout } from '@/stores/hooks/use-checkout'

export function CheckoutShippingForm() {
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
    statesList,
  } = useCheckout()

  const matchedState = statesList.find(
    (s) =>
      s.state.toLowerCase() === shippingState.toLowerCase() ||
      shippingState.toLowerCase().includes(s.state.toLowerCase())
  )
  const availableCities = matchedState ? matchedState.cities : []
  const isOsogbo = shippingCity.toLowerCase().trim() === 'osogbo'

  return (
    <div className='flex flex-col gap-8'>
      {/* Contact Info Card */}
      <Card className='rounded-none border-black/10'>
        <CardHeader className='pb-4 border-b border-black/10'>
          <CardTitle className='text-lg font-semibold flex items-center gap-2'>
            1. Contact information
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-6 space-y-4'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='customer-name'>Full Name *</Label>
            <Input
              id='customer-name'
              className='h-10 rounded-none'
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder='e.g. John Doe'
              required
            />
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='customer-email'>Email address *</Label>
              <Input
                id='customer-email'
                type='email'
                className='h-10 rounded-none'
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder='e.g. john@example.com'
                required
              />
            </div>
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='customer-phone'>Phone number *</Label>
              <Input
                id='customer-phone'
                type='tel'
                className='h-10 rounded-none'
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder='e.g. 08012345678'
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address Card */}
      <Card className='rounded-none border-black/10'>
        <CardHeader className='pb-4 border-b border-black/10'>
          <CardTitle className='text-lg font-semibold flex items-center gap-2'>
            2. Shipping address
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-6 space-y-4'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='shipping-address'>Street address *</Label>
            <Input
              id='shipping-address'
              className='h-10 rounded-none'
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder='e.g. 14, Ring Road'
              required
            />
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='shipping-state'>State *</Label>
              <select
                id='shipping-state'
                value={matchedState?.state || shippingState}
                onChange={(e) => {
                  const val = e.target.value
                  setShippingState(val)
                  const s = statesList.find((st) => st.state === val)
                  if (s && s.cities.length > 0) {
                    setShippingCity(s.cities[0])
                  } else {
                    setShippingCity('')
                  }
                }}
                className='flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                required
              >
                <option value=''>Select State</option>
                {statesList.map((s) => (
                  <option key={s.state} value={s.state}>
                    {s.state}
                  </option>
                ))}
              </select>
            </div>

            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='shipping-city'>City / LGA *</Label>
              <select
                id='shipping-city'
                value={shippingCity}
                onChange={(e) => setShippingCity(e.target.value)}
                className='flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                required
                disabled={!shippingState}
              >
                <option value=''>Select City/LGA</option>
                {availableCities.map((c: string) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {isOsogbo && (
                <p className='text-xs font-semibold text-gold mt-1'>
                  Local Osogbo delivery rate (₦2,000) applied!
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
