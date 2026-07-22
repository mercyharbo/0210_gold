'use client'

import { ChevronLeft, Printer } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { OrderStatusDialog } from '@/components/admin/order-status-dialog'
import { OrderWaybillModal } from '@/components/admin/order-waybill-modal'
import { Button } from '@/components/ui/button'

type OrderDetailsActionsProps = {
  orderId: string
  orderNumber: number
  currentStatus: string
  currentPaymentStatus: string
  order: any
}

export function OrderDetailsActions({
  orderId,
  orderNumber,
  currentStatus,
  currentPaymentStatus,
  order,
}: OrderDetailsActionsProps) {
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isWaybillOpen, setIsWaybillOpen] = useState(false)

  return (
    <div className='flex items-center gap-3'>
      <Button asChild variant='outline' size='sm' className='h-9 rounded-none border-black/20'>
        <Link href='/admin/orders' className='flex items-center gap-2'>
          <ChevronLeft className='size-4' />
          Back
        </Link>
      </Button>

      {order && (
        <Button
          size='sm'
          variant='outline'
          onClick={() => setIsWaybillOpen(true)}
          className='border-black/30 text-black hover:bg-neutral-100 cursor-pointer rounded-none h-9 px-4 gap-2 text-xs font-semibold uppercase tracking-wider'
        >
          <Printer className='size-3.5' />
          Print Waybill
        </Button>
      )}

      <Button
        size='sm'
        onClick={() => setIsStatusOpen(true)}
        className='bg-black text-white hover:bg-gold hover:text-black cursor-pointer rounded-none h-9 px-4 text-xs font-semibold uppercase tracking-wider'
      >
        Update Status
      </Button>

      <OrderStatusDialog
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        orderId={orderId}
        orderNumber={orderNumber}
        currentStatus={currentStatus}
        currentPaymentStatus={currentPaymentStatus}
      />

      {order && (
        <OrderWaybillModal
          isOpen={isWaybillOpen}
          onClose={() => setIsWaybillOpen(false)}
          order={order}
        />
      )}
    </div>
  )
}
