'use client'

import { MapPin, Plus } from 'lucide-react'
import { useFormStatus } from 'react-dom'

import { createAddress } from '@/app/(index)/profile/actions'
import { AddressCard } from '@/components/profile/address-card'
import { AddressFormFields } from '@/components/profile/address-form-fields'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { CustomerAddress } from '@/types/address'
import type { CustomerProfile } from '@/types/profile'

type AddressesCardProps = {
  profile: CustomerProfile
  addresses: CustomerAddress[]
}

function AddAddressButton() {
  const { pending } = useFormStatus()

  return (
    <Button type='submit' disabled={pending}>
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
    <section className='border border-black/10 p-6 sm:p-8'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='text-xs font-semibold uppercase text-black/45'>
            Delivery addresses
          </p>
          <h2 className='mt-2 font-heading text-3xl font-semibold'>
            Saved addresses
          </h2>
        </div>
        <MapPin className='size-5 text-[#b88a2b]' strokeWidth={1.7} />
      </div>

      {addresses.length > 0 ? (
        <div className='mt-6 space-y-5'>
          {addresses.map((address) => (
            <AddressCard key={address.id} address={address} profile={profile} />
          ))}
        </div>
      ) : (
        <div className='mt-6 border border-dashed border-black/20 p-6 text-sm leading-6 text-black/58'>
          No delivery addresses saved yet. Add your first address for checkout,
          waybill updates, and support requests.
        </div>
      )}

      <form
        action={createAddress}
        className='mt-8 space-y-5 border-t border-black/10 pt-8'
      >
        <div className='flex items-center gap-3'>
          <span className='grid size-9 place-items-center bg-black text-white'>
            <Plus className='size-4' />
          </span>
          <div>
            <p className='text-xs font-semibold uppercase text-black/45'>
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
    </section>
  )
}
