'use client'

import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { OrderStatusDialog } from '@/components/admin/order-status-dialog'
import { Button } from '@/components/ui/button'

type OrderDetailsActionsProps = {
  orderId: string
  orderNumber: number
  currentStatus: string
  currentPaymentStatus: string
}

export function OrderDetailsActions({
  orderId,
  orderNumber,
  currentStatus,
  currentPaymentStatus,
}: OrderDetailsActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className='flex items-center gap-3'>
      <Button asChild variant='outline' size='sm'>
        <Link href='/admin/orders' className='flex items-center gap-2'>
          <ChevronLeft className='size-4' />
          Back
        </Link>
      </Button>
      <Button
        size='sm'
        onClick={() => setIsOpen(true)}
        className='bg-gold text-white hover:bg-gold/80 cursor-pointer rounded-none h-9 px-4'
      >
        Update Status
      </Button>

      <OrderStatusDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        orderId={orderId}
        orderNumber={orderNumber}
        currentStatus={currentStatus}
        currentPaymentStatus={currentPaymentStatus}
      />
    </div>
  )
}
