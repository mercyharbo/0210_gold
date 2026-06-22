'use client'

import { Trash2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'

import { deleteAddress } from '@/app/(index)/profile/actions'
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

type DeleteAddressDialogProps = {
  address: CustomerAddress
}

function DeleteAddressButton() {
  const { pending } = useFormStatus()

  return (
    <Button type='submit' variant='destructive' disabled={pending}>
      {pending ? (
        <Spinner className='size-4' />
      ) : (
        <Trash2 className='size-4' />
      )}
      Delete address
    </Button>
  )
}

export function DeleteAddressDialog({ address }: DeleteAddressDialogProps) {
  const deleteAddressAction = deleteAddress.bind(null, address.id)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='destructive' size='icon-sm' aria-label='Delete address'>
          <Trash2 className='size-3.5' />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete delivery address</DialogTitle>
          <DialogDescription>
            This removes {address.label || 'this address'} from your saved
            delivery addresses.
          </DialogDescription>
        </DialogHeader>
        <form action={deleteAddressAction}>
          <DialogFooter>
            <DeleteAddressButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
