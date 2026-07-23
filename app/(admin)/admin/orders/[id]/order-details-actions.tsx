'use client'

import { ChevronLeft, Printer } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { OrderStatusDialog } from '@/components/admin/order-status-dialog'
import {
  printOrderWaybill,
  type OrderReceiptData,
} from '@/components/admin/order-waybill-modal'
import { Button } from '@/components/ui/button'

type OrderDetailsActionsProps = {
  orderId: string
  orderNumber: number
  currentStatus: string
  currentPaymentStatus: string
  order: OrderReceiptData | null
}

export function OrderDetailsActions({
  orderId,
  orderNumber,
  currentStatus,
  currentPaymentStatus,
  order,
}: OrderDetailsActionsProps) {
  const [isStatusOpen, setIsStatusOpen] = useState(false)

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
          onClick={() => printOrderWaybill(order)}
          className='h-9 cursor-pointer gap-2 rounded-none border-black/30 px-4 text-xs font-semibold text-black hover:bg-gray-100'
        >
          <Printer className='size-3.5' />
          Print Waybill
        </Button>
      )}

      <Button
        size='sm'
        onClick={() => setIsStatusOpen(true)}
        className='h-9 cursor-pointer rounded-none bg-black px-4 text-xs font-semibold text-white hover:bg-gold hover:text-black'
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

    </div>
  )
}
