'use client'

import { Star } from 'lucide-react'
import { useFormStatus } from 'react-dom'

import { setDefaultAddress } from '@/app/(index)/profile/actions'
import { DeleteAddressDialog } from '@/components/profile/delete-address-dialog'
import { EditAddressDialog } from '@/components/profile/edit-address-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import type { CustomerAddress } from '@/types/address'
import type { CustomerProfile } from '@/types/profile'
import { Separator } from '../ui/separator'

type AddressCardProps = {
  address: CustomerAddress
  profile: CustomerProfile
}

function fullName(profile: CustomerProfile) {
  return [profile.first_name, profile.last_name].filter(Boolean).join(' ')
}

function formatAddress(address: CustomerAddress) {
  return [
    address.address_line_1,
    address.address_line_2,
    address.city,
    address.state,
    address.country,
    address.postal_code,
  ]
    .filter(Boolean)
    .join(', ')
}

function SetDefaultButton() {
  const { pending } = useFormStatus()

  return (
    <Button type='submit' variant='outline' size='sm' disabled={pending}>
      {pending ? (
        <Spinner className='size-3.5' />
      ) : (
        <Star className='size-3.5' />
      )}
      Set default
    </Button>
  )
}

export function AddressCard({ address, profile }: AddressCardProps) {
  const setDefaultAddressAction = setDefaultAddress.bind(null, address.id)
  const recipient = address.recipient_name || fullName(profile)

  return (
    <Card className='rounded-none'>
      <CardHeader>
        <div className='flex flex-wrap items-center gap-2'>
          <CardTitle className='text-lg font-semibold'>
            {address.label || address.city || 'Saved address'}
          </CardTitle>
          {address.is_default ? (
            <span className='bg-gold px-2.5 py-1 text-xs font-semibold text-white'>
              Default
            </span>
          ) : null}
        </div>

        <CardAction className='flex shrink-0 items-center gap-2'>
          <EditAddressDialog address={address} />
          <DeleteAddressDialog address={address} />
        </CardAction>
      </CardHeader>

      <CardContent className='flex flex-col gap-2'>
        <div className='space-y-1'>
          <p className='text-sm font-semibold'>{recipient}</p>
          <p className='max-w-2xl text-sm leading-6 text-muted-foreground'>
            {formatAddress(address)}
          </p>
          <p className='text-sm text-muted-foreground'>{address.phone}</p>
        </div>
        <Separator />
        {address.delivery_notes && (
          <p className='text-sm leading-6 '>{address.delivery_notes}</p>
        )}
      </CardContent>

      {!address.is_default ? (
        <CardFooter>
          <form action={setDefaultAddressAction}>
            <SetDefaultButton />
          </form>
        </CardFooter>
      ) : null}
    </Card>
  )
}
