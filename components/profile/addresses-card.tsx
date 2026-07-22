'use client'

import { Plus } from 'lucide-react'
import { useFormStatus } from 'react-dom'

import { createAddress } from '@/app/(index)/profile/actions'
import { AddressCard } from '@/components/profile/address-card'
import { AddressFormFields } from '@/components/profile/address-form-fields'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import type { CustomerAddress } from '@/types/address'
import type { CustomerProfile } from '@/types/profile'
import { Separator } from '../ui/separator'

type AddressesCardProps = {
  profile: CustomerProfile
  addresses: CustomerAddress[]
}

function AddAddressButton() {
  const { pending } = useFormStatus()

  return (
    <Button type='submit' className='w-full' disabled={pending}>
      {pending ? (
        <>
          <Spinner className='size-4' />
          Adding address
        </>
      ) : (
        'Add address'
      )}
    </Button>
  )
}

export function AddressesCard({ profile, addresses }: AddressesCardProps) {
  return (
    <Card className='rounded-none [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]'>
      <CardHeader>
        <div className='space-y-2'>
          <p className='text-xs font-semibold uppercase text-muted-foreground'>
            Delivery addresses
          </p>
          <CardTitle className='text-3xl font-semibold'>
            Saved addresses
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className='space-y-8'>
        {addresses.length > 0 ? (
          <div className='space-y-5'>
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                profile={profile}
              />
            ))}
          </div>
        ) : (
          <Card className='border-dashed'>
            <CardContent className='text-sm leading-6 text-muted-foreground'>
              No delivery addresses saved yet. Add your first address for
              checkout, waybill updates, and support requests.
            </CardContent>
          </Card>
        )}

        <Separator />

        <form action={createAddress} className='space-y-5'>
          <div className='flex items-center gap-3'>
            <span className='grid size-9 place-items-center bg-black text-white'>
              <Plus className='size-4' />
            </span>
            <div className='space-y-1'>
              <p className='text-xs font-semibold uppercase text-muted-foreground'>
                New address
              </p>
              <h3 className='font-heading text-2xl font-semibold'>
                Add delivery address
              </h3>
            </div>
          </div>

          <AddressFormFields />
          <AddAddressButton />
        </form>
      </CardContent>
    </Card>
  )
}
