'use client'

import { Star, Trash2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'

import {
  deleteAddress,
  setDefaultAddress,
  updateAddress,
} from '@/app/(index)/profile/actions'
import { AddressFormFields } from '@/components/profile/address-form-fields'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { CustomerAddress } from '@/types/address'
import type { CustomerProfile } from '@/types/profile'

type AddressCardProps = {
  address: CustomerAddress
  profile: CustomerProfile
}

function fullName(profile: CustomerProfile) {
  return [profile.first_name, profile.last_name].filter(Boolean).join(' ')
}

function SaveAddressButton() {
  const { pending } = useFormStatus()

  return (
    <Button type='submit' variant='outline' disabled={pending}>
      {pending ? (
        <>
          <Spinner className='size-4' />
          Saving address
        </>
      ) : (
        'Save address'
      )}
    </Button>
  )
}

function SetDefaultButton() {
  const { pending } = useFormStatus()

  return (
    <Button type='submit' variant='outline' size='sm' disabled={pending}>
      {pending ? <Spinner className='size-3.5' /> : <Star className='size-3.5' />}
      Set default
    </Button>
  )
}

function DeleteAddressButton() {
  const { pending } = useFormStatus()

  return (
    <Button type='submit' variant='destructive' size='sm' disabled={pending}>
      {pending ? (
        <Spinner className='size-3.5' />
      ) : (
        <Trash2 className='size-3.5' />
      )}
      Delete
    </Button>
  )
}

export function AddressCard({ address, profile }: AddressCardProps) {
  const updateAddressAction = updateAddress.bind(null, address.id)
  const deleteAddressAction = deleteAddress.bind(null, address.id)
  const setDefaultAddressAction = setDefaultAddress.bind(null, address.id)

  return (
    <article className='border border-black/10 p-5'>
      <div className='mb-5 flex flex-wrap items-start justify-between gap-4'>
        <div>
          <div className='flex flex-wrap items-center gap-2'>
            <h3 className='font-heading text-2xl font-semibold'>
              {address.label || address.city || 'Saved address'}
            </h3>
            {address.is_default ? (
              <span className='bg-[#f3d77a] px-2.5 py-1 text-xs font-semibold uppercase text-black'>
                Default
              </span>
            ) : null}
          </div>
          <p className='mt-1 text-sm text-black/58'>
            {address.recipient_name || fullName(profile)}
          </p>
        </div>

        <div className='flex flex-wrap gap-2'>
          {!address.is_default ? (
            <form action={setDefaultAddressAction}>
              <SetDefaultButton />
            </form>
          ) : null}
          <form action={deleteAddressAction}>
            <DeleteAddressButton />
          </form>
        </div>
      </div>

      <form action={updateAddressAction} className='space-y-5'>
        <AddressFormFields address={address} />
        <SaveAddressButton />
      </form>
    </article>
  )
}
