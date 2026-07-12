'use client'

import { useState, useTransition } from 'react'

import { updateOrderStatusAction } from '@/app/(admin)/admin/orders/actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/stores/hooks/use-toast'

type OrderStatusDialogProps = {
  isOpen: boolean
  onClose: () => void
  orderId: string
  orderNumber: number
  currentStatus: string
  currentPaymentStatus: string
}

export function OrderStatusDialog({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  currentStatus,
  currentPaymentStatus,
}: OrderStatusDialogProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const [status, setStatus] = useState(currentStatus)
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus)
  const [error, setError] = useState<string | null>(null)

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      try {
        await updateOrderStatusAction(orderId, status, paymentStatus)
        toast(`Order #${orderNumber} updated successfully.`, 'success')
        onClose()
      } catch (err: any) {
        setError(err.message || 'Failed to update order status.')
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='rounded-none max-w-md bg-white border-black/10 text-black'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold'>Update Order Status</DialogTitle>
          <DialogDescription className='text-sm text-muted-foreground'>
            Adjust fulfillment state and payment confirmation for order #{orderNumber}.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className='text-xs font-semibold text-destructive px-1'>{error}</p>
        )}

        <div className='space-y-4 py-4'>
          {/* Order Status Select */}
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='dialog-order-status' className='text-xs font-bold uppercase'>
              Fulfillment Status
            </Label>
            <select
              id='dialog-order-status'
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className='flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            >
              <option value='pending'>Pending</option>
              <option value='processing'>Processing</option>
              <option value='shipped'>Shipped</option>
              <option value='delivered'>Delivered</option>
              <option value='cancelled'>Cancelled</option>
            </select>
          </div>

          {/* Payment Status Select */}
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='dialog-payment-status' className='text-xs font-bold uppercase'>
              Payment Status
            </Label>
            <select
              id='dialog-payment-status'
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className='flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            >
              <option value='pending'>Pending</option>
              <option value='paid'>Paid</option>
              <option value='failed'>Failed</option>
            </select>
          </div>
        </div>

        <DialogFooter className='gap-3 sm:gap-0 border-t border-black/5 pt-4'>
          <Button
            type='button'
            variant='outline'
            onClick={onClose}
            disabled={isPending}
            className='rounded-none h-10 border-black/25 cursor-pointer'
          >
            Cancel
          </Button>
          <Button
            type='button'
            onClick={handleSave}
            disabled={isPending}
            className='rounded-none h-10 bg-black text-white hover:bg-gold hover:text-black gap-2 cursor-pointer'
          >
            {isPending && <Spinner className='size-3.5 text-current' />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
