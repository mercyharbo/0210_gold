'use client'

import { Eye, MoreHorizontal, Settings } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { formatNaira } from '@/components/index/shop/shop-data'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { OrderStatusDialog } from './order-status-dialog'

export type OrderRecord = {
  id: string
  order_number: number
  customer_name: string
  customer_email: string
  created_at: string
  total_amount: number
  payment_status: string
  status: string
}

type OrdersTableProps = {
  orders: OrderRecord[]
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null)

  return (
    <div className='overflow-x-auto bg-white text-black'>
      <table className='w-full text-left border-collapse text-sm'>
        <thead>
          <tr className='border-b border-border text-muted-foreground font-semibold'>
            <th className='py-3 px-4'>Order ID</th>
            <th className='py-3 px-4'>Customer</th>
            <th className='py-3 px-4'>Date</th>
            <th className='py-3 px-4'>Total Amount</th>
            <th className='py-3 px-4 text-center'>Payment</th>
            <th className='py-3 px-4 text-center'>Fulfillment</th>
            <th className='py-3 px-4 text-right'>Actions</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-border'>
          {orders.map((order) => {
            const dateStr = new Date(order.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })

            // Format status to capitalization but not all caps
            const paymentDisplay =
              order.payment_status.charAt(0).toUpperCase() +
              order.payment_status.slice(1)
            const statusDisplay =
              order.status.charAt(0).toUpperCase() + order.status.slice(1)

            return (
              <tr key={order.id} className='hover:bg-muted/40 transition-colors'>
                <td className='py-3.5 px-4 font-mono font-semibold text-foreground'>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className='hover:underline hover:text-gold'
                  >
                    #{order.order_number}
                  </Link>
                </td>
                <td className='py-3.5 px-4 text-foreground font-medium'>
                  <div className='flex flex-col'>
                    <span>{order.customer_name}</span>
                    <span className='text-xs text-muted-foreground font-normal'>
                      {order.customer_email}
                    </span>
                  </div>
                </td>
                <td className='py-3.5 px-4 text-muted-foreground'>{dateStr}</td>
                <td className='py-3.5 px-4 text-foreground font-medium'>
                  {formatNaira(order.total_amount)}
                </td>
                <td className='py-3.5 px-4 text-center'>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      order.payment_status === 'paid'
                        ? 'bg-green-500/10 text-green-600'
                        : order.payment_status === 'failed'
                          ? 'bg-red-500/10 text-red-600'
                          : 'bg-amber-500/10 text-amber-600'
                    }`}
                  >
                    {paymentDisplay}
                  </span>
                </td>
                <td className='py-3.5 px-4 text-center'>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      order.status === 'delivered'
                        ? 'bg-green-500/10 text-green-600'
                        : order.status === 'shipped'
                          ? 'bg-blue-500/10 text-blue-600'
                          : order.status === 'processing'
                            ? 'bg-purple-500/10 text-purple-600'
                            : order.status === 'cancelled'
                              ? 'bg-red-500/10 text-red-600'
                              : 'bg-amber-500/10 text-amber-600'
                    }`}
                  >
                    {statusDisplay}
                  </span>
                </td>
                <td className='py-3.5 px-4 text-right'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon-sm'
                        className='cursor-pointer'
                      >
                        <MoreHorizontal className='size-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='rounded-none bg-white text-black'>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className='flex items-center gap-2 cursor-pointer'
                        >
                          <Eye className='size-3.5' />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className='bg-black/5' />
                      <DropdownMenuItem
                        onClick={() => setSelectedOrder(order)}
                        className='flex items-center gap-2 cursor-pointer text-gold'
                      >
                        <Settings className='size-3.5' />
                        Update Status
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {selectedOrder && (
        <OrderStatusDialog
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          orderId={selectedOrder.id}
          orderNumber={selectedOrder.order_number}
          currentStatus={selectedOrder.status}
          currentPaymentStatus={selectedOrder.payment_status}
        />
      )}
    </div>
  )
}
