'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCheckout } from '@/stores/hooks/use-checkout'
import type { CustomerAddress } from '@/types/address'

type CheckoutAddressSelectorProps = {
  initialAddresses: CustomerAddress[]
}

export function CheckoutAddressSelector({
  initialAddresses,
}: CheckoutAddressSelectorProps) {
  const {
    selectedAddressId,
    setSelectedAddressId,
    setShippingAddress,
    setShippingCity,
    setShippingState,
    setCustomerPhone,
  } = useCheckout()

  const handleAddressChange = (addressId: string) => {
    setSelectedAddressId(addressId)
    if (addressId === 'new') {
      setShippingAddress('')
      setShippingCity('')
      setShippingState('')
    } else {
      const selected = initialAddresses.find((a) => a.id === addressId)
      if (selected) {
        setShippingAddress(selected.address_line_1 || '')
        setShippingCity(selected.city || '')
        setShippingState(selected.state || '')
        if (selected.phone) {
          setCustomerPhone(selected.phone)
        }
      }
    }
  }

  if (initialAddresses.length === 0) return null

  return (
    <Card className='rounded-none border-black/10'>
      <CardHeader className='pb-4 border-b border-black/10'>
        <CardTitle className='text-lg font-semibold'>
          Select a shipping address
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-6 space-y-4'>
        <div className='flex flex-col gap-3'>
          {initialAddresses.map((address) => (
            <label
              key={address.id}
              className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
                selectedAddressId === address.id
                  ? 'border-black bg-muted/30'
                  : 'border-black/10 hover:border-black/30'
              }`}
            >
              <input
                type='radio'
                name='checkout-address'
                value={address.id}
                checked={selectedAddressId === address.id}
                onChange={() => handleAddressChange(address.id)}
                className='mt-1 accent-black cursor-pointer'
              />
              <div className='flex-1 text-sm space-y-1'>
                <p className='font-semibold'>
                  {address.recipient_name}{' '}
                  {address.label && (
                    <span className='ml-2 text-[10px] font-bold uppercase tracking-wider bg-black/10 px-2 py-0.5'>
                      {address.label}
                    </span>
                  )}
                </p>
                <p className='text-muted-foreground'>
                  {address.address_line_1}
                  {address.address_line_2 && `, ${address.address_line_2}`}
                </p>
                <p className='text-muted-foreground'>
                  {address.city}, {address.state}
                </p>
                {address.phone && (
                  <p className='text-xs font-medium text-black pt-1'>
                    Phone: {address.phone}
                  </p>
                )}
              </div>
            </label>
          ))}

          <label
            className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${
              selectedAddressId === 'new'
                ? 'border-black bg-muted/30'
                : 'border-black/10 hover:border-black/30'
            }`}
          >
            <input
              type='radio'
              name='checkout-address'
              value='new'
              checked={selectedAddressId === 'new'}
              onChange={() => handleAddressChange('new')}
              className='accent-black cursor-pointer'
            />
            <span className='text-sm font-semibold'>Ship to a new address</span>
          </label>
        </div>
      </CardContent>
    </Card>
  )
}
