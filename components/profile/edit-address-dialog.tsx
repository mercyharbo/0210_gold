'use client'

import { Edit3 } from 'lucide-react'
import { useFormStatus } from 'react-dom'

import { updateAddress } from '@/app/(index)/profile/actions'
import { AddressFormFields } from '@/components/profile/address-form-fields'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import type { CustomerAddress } from '@/types/address'

type EditAddressDialogProps = {
  address: CustomerAddress
}

function SaveAddressButton() {
  const { pending } = useFormStatus()

  return (
    <Button type='submit' className='w-full sm:w-fit' disabled={pending}>
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

export function EditAddressDialog({ address }: EditAddressDialogProps) {
  const updateAddressAction = updateAddress.bind(null, address.id)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' size='icon-sm' aria-label='Edit address'>
          <Edit3 className='size-3.5' />
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Edit delivery address</DialogTitle>
          <DialogDescription>
            Update the saved delivery details for this address.
          </DialogDescription>
        </DialogHeader>
        <form action={updateAddressAction} className='space-y-5'>
          <AddressFormFields address={address} />
          <DialogFooter className='mx-0 rounded-none border-t-0 bg-transparent p-0 sm:justify-start'>
            <SaveAddressButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
