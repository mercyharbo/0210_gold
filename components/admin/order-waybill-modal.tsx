'use client'

import { MapPin, Phone, Printer, ShieldCheck, X } from 'lucide-react'

import { formatNaira } from '@/components/index/shop/shop-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type OrderWaybillModalProps = {
  isOpen: boolean
  onClose: () => void
  order: {
    id: string
    order_number: number
    customer_name: string
    customer_email: string
    customer_phone: string
    shipping_address: string
    shipping_city: string
    shipping_state: string
    shipping_country: string
    subtotal_amount: number
    delivery_amount: number
    total_amount: number
    payment_status: string
    status: string
    created_at: string
    order_items: Array<{
      id: string
      product_name: string
      quantity: number
      price: number
      selected_size?: string | null
      selected_color?: string | null
    }>
  }
}

export function OrderWaybillModal({
  isOpen,
  onClose,
  order,
}: OrderWaybillModalProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-2xl bg-white text-black p-0 border-black/10 rounded-none overflow-hidden'>
        <DialogHeader className='p-6 border-b border-black/10 bg-neutral-900 text-white flex flex-row items-center justify-between'>
          <div>
            <span className='text-xs font-mono text-gold uppercase tracking-wider block'>
              Dispatch Manifest
            </span>
            <DialogTitle className='font-heading text-2xl font-bold'>
              Waybill #FML-{order.order_number}
            </DialogTitle>
          </div>
          <Button
            onClick={handlePrint}
            size='sm'
            className='bg-gold text-black hover:bg-white text-xs font-bold uppercase tracking-wider gap-2 rounded-none h-9 px-4 cursor-pointer'
          >
            <Printer className='size-4' />
            Print Waybill
          </Button>
        </DialogHeader>

        {/* Printable Area */}
        <div className='p-6 sm:p-8 space-y-6 text-sm print:p-0 print:text-black'>
          {/* Header Branding */}
          <div className='flex items-center justify-between border-b border-black/10 pb-4'>
            <div>
              <h2 className='font-heading text-2xl font-bold tracking-tight'>
                MERCYHARBO / 0210 GOLD
              </h2>
              <p className='text-xs text-muted-foreground'>
                Luxury Jewellery, Abayas & Bespoke Sourcing
              </p>
            </div>
            <div className='text-right font-mono text-xs'>
              <p className='font-bold text-black'>WAYBILL REF</p>
              <p className='text-base font-bold text-gold'>#FML-{order.order_number}</p>
              <p className='text-neutral-500'>
                {new Date(order.created_at).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Addresses Grid */}
          <div className='grid sm:grid-cols-2 gap-6 border-b border-black/10 pb-6 text-xs'>
            {/* Sender Details */}
            <div className='bg-neutral-50 p-4 border border-black/10 space-y-1.5'>
              <span className='font-bold uppercase tracking-wider text-gold block text-3xs'>
                FROM (SENDER)
              </span>
              <p className='font-bold text-black text-sm'>Mercyharbo Logistics Dispatch</p>
              <p className='text-muted-foreground'>Osogbo / Lagos & UK Waybill Hub</p>
              <p className='text-muted-foreground'>Nigeria & United Kingdom</p>
              <p className='font-mono pt-1 text-black font-semibold'>Phone: +234 800 MERCYHARBO</p>
            </div>

            {/* Receiver Details */}
            <div className='bg-neutral-50 p-4 border border-black/10 space-y-1.5'>
              <span className='font-bold uppercase tracking-wider text-black block text-3xs'>
                TO (RECIPIENT)
              </span>
              <p className='font-bold text-black text-sm'>{order.customer_name}</p>
              <p className='text-muted-foreground flex items-start gap-1'>
                <MapPin className='size-3 text-gold shrink-0 mt-0.5' />
                <span>{order.shipping_address}</span>
              </p>
              <p className='text-muted-foreground'>
                {order.shipping_city}, {order.shipping_state}, {order.shipping_country}
              </p>
              <p className='font-mono pt-1 text-black font-bold flex items-center gap-1'>
                <Phone className='size-3 text-gold' /> {order.customer_phone}
              </p>
            </div>
          </div>

          {/* Package Manifest */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='font-bold uppercase tracking-wider text-xs text-muted-foreground'>
                Parcel Item Manifest
              </span>
              <span className='text-xs font-mono font-semibold'>
                {order.order_items.length} Item(s)
              </span>
            </div>

            <table className='w-full border-collapse text-left text-xs'>
              <thead>
                <tr className='border-y border-black/10 bg-neutral-100 font-semibold uppercase text-muted-foreground'>
                  <th className='py-2 px-3'>Item Description</th>
                  <th className='py-2 px-3 text-center'>Specs</th>
                  <th className='py-2 px-3 text-center'>Qty</th>
                  <th className='py-2 px-3 text-right'>Total</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-black/10'>
                {order.order_items.map((item) => (
                  <tr key={item.id}>
                    <td className='py-2.5 px-3 font-semibold text-black'>
                      {item.product_name}
                    </td>
                    <td className='py-2.5 px-3 text-center text-muted-foreground'>
                      {[item.selected_size, item.selected_color].filter(Boolean).join(' / ') || 'Standard'}
                    </td>
                    <td className='py-2.5 px-3 text-center font-mono font-semibold'>
                      {item.quantity}
                    </td>
                    <td className='py-2.5 px-3 text-right font-mono font-semibold text-black'>
                      {formatNaira(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment & Signatures Footer */}
          <div className='border-t border-black/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs'>
            <div className='flex items-center gap-3'>
              <span className='font-semibold text-muted-foreground'>Payment Tag:</span>
              <span
                className={`px-3 py-1 text-3xs font-bold uppercase tracking-wider border ${
                  order.payment_status === 'paid'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {order.payment_status === 'paid' ? 'PAID IN FULL' : 'PAY ON DELIVERY'}
              </span>
            </div>

            <div className='flex items-center gap-6 font-mono text-xs'>
              <div>
                <span className='text-muted-foreground block text-3xs'>DELIVERY FEE</span>
                <span className='font-bold'>{formatNaira(order.delivery_amount)}</span>
              </div>
              <div>
                <span className='text-muted-foreground block text-3xs'>GRAND TOTAL</span>
                <span className='font-bold text-gold text-sm'>{formatNaira(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
