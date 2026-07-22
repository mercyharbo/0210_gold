'use client'

import { useState, useTransition } from 'react'
import {
  ArrowUpRight,
  CheckCircle,
  Clock,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Truck,
} from 'lucide-react'
import Link from 'next/link'

import { bulkUpdateOrdersAction } from '@/app/(admin)/admin/orders/actions'
import { AdminPlaceholderCard } from '@/components/admin/admin-placeholder-card'
import { BulkActionsBar } from '@/components/admin/bulk-actions-bar'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { formatNaira } from '@/components/index/shop/shop-data'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { StatusBadge } from '@/components/ui/status-badge'
import { useToast } from '@/stores/hooks/use-toast'

type OrdersClientProps = {
  orders: Array<{
    id: string
    order_number: number
    customer_name: string
    customer_email: string
    customer_phone: string
    shipping_city: string
    shipping_state: string
    total_amount: number
    payment_status: string
    status: string
    created_at: string
  }>
}

export function OrdersClient({ orders }: OrdersClientProps) {
  const [fulfillmentStatus, setFulfillmentStatus] = useState<string>('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest')
  const [searchQuery, setSearchQuery] = useState<string>('')
  
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const { toast } = useToast()

  // Modal Confirmation State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => void
    confirmText?: string
    variant?: 'destructive' | 'default'
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  })

  // Metrics
  const processingCount = orders.filter((o) => o.status === 'processing').length
  const transitCount = orders.filter((o) => o.status === 'shipped').length
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length

  // Filtered & Sorted orders
  const filteredOrders = orders
    .filter((o) => {
      const matchesFulfillment =
        fulfillmentStatus === 'all' || o.status.toLowerCase() === fulfillmentStatus.toLowerCase()
      const matchesPayment =
        paymentStatusFilter === 'all' || o.payment_status.toLowerCase() === paymentStatusFilter.toLowerCase()

      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        String(o.order_number).includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_email.toLowerCase().includes(q) ||
        o.shipping_city.toLowerCase().includes(q)

      return matchesFulfillment && matchesPayment && matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sortBy === 'amount_high') return b.total_amount - a.total_amount
      if (sortBy === 'amount_low') return a.total_amount - b.total_amount
      return 0
    })

  const isAllSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((o) => selectedIds.includes(o.id))

  const activeFilterCount =
    (fulfillmentStatus !== 'all' ? 1 : 0) +
    (paymentStatusFilter !== 'all' ? 1 : 0) +
    (sortBy !== 'newest' ? 1 : 0)

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredOrders.map((o) => o.id))
    }
  }

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const resetFilters = () => {
    setFulfillmentStatus('all')
    setPaymentStatusFilter('all')
    setSortBy('newest')
  }

  const promptBulkFulfillment = (status: string) => {
    setConfirmConfig({
      isOpen: true,
      title: `Update Fulfillment to ${status.toUpperCase()}`,
      description: `Change fulfillment status to "${status}" for ${selectedIds.length} selected order(s)?`,
      confirmText: `Set ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      variant: 'default',
      onConfirm: () => executeBulkFulfillment(status),
    })
  }

  const executeBulkFulfillment = (status: string) => {
    startTransition(async () => {
      try {
        await bulkUpdateOrdersAction(selectedIds, { status })
        toast(`Fulfillment status updated to ${status} for ${selectedIds.length} order(s).`, 'success')
        setSelectedIds([])
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }))
      } catch (err: any) {
        toast(err.message || 'Failed to update orders.', 'error')
      }
    })
  }

  const promptBulkPayment = (paymentStatus: string) => {
    setConfirmConfig({
      isOpen: true,
      title: `Mark Payment as ${paymentStatus.toUpperCase()}`,
      description: `Confirm payment status update to "${paymentStatus}" for ${selectedIds.length} selected order(s)?`,
      confirmText: `Mark ${paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}`,
      variant: 'default',
      onConfirm: () => executeBulkPayment(paymentStatus),
    })
  }

  const executeBulkPayment = (paymentStatus: string) => {
    startTransition(async () => {
      try {
        await bulkUpdateOrdersAction(selectedIds, { paymentStatus })
        toast(`Payment status updated to ${paymentStatus} for ${selectedIds.length} order(s).`, 'success')
        setSelectedIds([])
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }))
      } catch (err: any) {
        toast(err.message || 'Failed to update order payment status.', 'error')
      }
    })
  }

  return (
    <div className='flex flex-col gap-6 font-sans'>
      {/* Metric Header Cards */}
      <div className='grid gap-6 sm:grid-cols-3'>
        <AdminPlaceholderCard
          title='Processing'
          value={String(processingCount)}
          icon={Clock}
        />
        <AdminPlaceholderCard
          title='In Transit (Shipped)'
          value={String(transitCount)}
          icon={Truck}
        />
        <AdminPlaceholderCard
          title='Delivered'
          value={String(deliveredCount)}
          icon={CheckCircle}
        />
      </div>

      {/* Filter & Search Controls Bar */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-1'>
        <div className='flex items-center gap-3 flex-1 max-w-md'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
            <input
              type='text'
              placeholder='Search order #, customer name, city...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full h-10 pl-9 pr-4 text-xs bg-white border border-border rounded-md outline-none focus:border-gold'
            />
          </div>

          {/* Sheet Filter Drawer Trigger Button */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='h-10 px-3.5 gap-2 border-border bg-white hover:bg-neutral-100 text-xs font-semibold shrink-0 cursor-pointer relative'
              >
                <SlidersHorizontal className='size-4 text-gold' />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className='size-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center ml-0.5'>
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>

            {/* Filter Sheet Content */}
            <SheetContent side='right' showCloseButton className='p-0 bg-white text-black max-w-md w-full font-sans flex flex-col justify-between'>
              <SheetHeader className='p-6 border-b border-border space-y-1 text-left'>
                <div className='flex items-center gap-2 text-gold'>
                  <Filter className='size-5' />
                  <SheetTitle className='text-lg font-bold text-foreground font-sans'>
                    Filter Orders
                  </SheetTitle>
                </div>
                <SheetDescription className='text-xs text-muted-foreground font-sans'>
                  Narrow down order records by fulfillment state, payment confirmation, and sorting order.
                </SheetDescription>
              </SheetHeader>

              <div className='p-6 space-y-6 flex-1 overflow-y-auto text-xs'>
                {/* Fulfillment Status Section */}
                <div className='space-y-3'>
                  <label className='font-bold uppercase text-muted-foreground text-[11px] block'>
                    Fulfillment Status
                  </label>
                  <div className='flex flex-wrap gap-2'>
                    {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                      <button
                        key={st}
                        type='button'
                        onClick={() => setFulfillmentStatus(st)}
                        className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors cursor-pointer capitalize ${
                          fulfillmentStatus === st
                            ? 'bg-black text-white border-black'
                            : 'bg-neutral-50 text-neutral-700 border-border hover:bg-neutral-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Status Section */}
                <div className='space-y-3 pt-4 border-t border-border'>
                  <label className='font-bold uppercase text-muted-foreground text-[11px] block'>
                    Payment Status
                  </label>
                  <div className='flex flex-wrap gap-2'>
                    {['all', 'paid', 'pending', 'failed'].map((pst) => (
                      <button
                        key={pst}
                        type='button'
                        onClick={() => setPaymentStatusFilter(pst)}
                        className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors cursor-pointer capitalize ${
                          paymentStatusFilter === pst
                            ? 'bg-black text-white border-black'
                            : 'bg-neutral-50 text-neutral-700 border-border hover:bg-neutral-100'
                        }`}
                      >
                        {pst}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Order Section */}
                <div className='space-y-3 pt-4 border-t border-border'>
                  <label className='font-bold uppercase text-muted-foreground text-[11px] block'>
                    Sort Orders By
                  </label>
                  <div className='grid grid-cols-2 gap-2'>
                    {[
                      { key: 'newest', label: 'Newest First' },
                      { key: 'oldest', label: 'Oldest First' },
                      { key: 'amount_high', label: 'Highest Amount' },
                      { key: 'amount_low', label: 'Lowest Amount' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type='button'
                        onClick={() => setSortBy(opt.key as any)}
                        className={`p-2.5 rounded-md border text-xs font-medium text-center transition-colors cursor-pointer ${
                          sortBy === opt.key
                            ? 'bg-black text-white border-black'
                            : 'bg-neutral-50 text-neutral-700 border-border hover:bg-neutral-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sheet Footer Actions */}
              <SheetFooter className='p-6 border-t border-border flex flex-row items-center justify-between gap-3 bg-neutral-50'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={resetFilters}
                  className='h-10 px-4 text-xs font-semibold gap-1.5 border-border bg-white cursor-pointer'
                >
                  <RotateCcw className='size-3.5 text-muted-foreground' />
                  Reset Filters
                </Button>

                <SheetClose asChild>
                  <Button
                    type='button'
                    size='sm'
                    className='h-10 px-6 bg-black text-white hover:bg-gold hover:text-black text-xs font-semibold cursor-pointer'
                  >
                    Apply Filters
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
      >
        <Button
          type='button'
          size='xs'
          variant='outline'
          disabled={isPending}
          onClick={() => promptBulkFulfillment('processing')}
          className='h-8 border-border text-foreground bg-white hover:bg-neutral-100 text-xs font-semibold cursor-pointer'
        >
          {isPending && <Spinner className='size-3 mr-1' />}
          Set Processing
        </Button>

        <Button
          type='button'
          size='xs'
          variant='outline'
          disabled={isPending}
          onClick={() => promptBulkFulfillment('shipped')}
          className='h-8 border-border text-foreground bg-white hover:bg-neutral-100 text-xs font-semibold cursor-pointer'
        >
          {isPending && <Spinner className='size-3 mr-1' />}
          Set Shipped
        </Button>

        <Button
          type='button'
          size='xs'
          variant='outline'
          disabled={isPending}
          onClick={() => promptBulkFulfillment('delivered')}
          className='h-8 border-border text-foreground bg-white hover:bg-neutral-100 text-xs font-semibold cursor-pointer'
        >
          {isPending && <Spinner className='size-3 mr-1' />}
          Set Delivered
        </Button>

        <Button
          type='button'
          size='xs'
          variant='outline'
          disabled={isPending}
          onClick={() => promptBulkPayment('paid')}
          className='h-8 border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold cursor-pointer'
        >
          {isPending && <Spinner className='size-3 mr-1' />}
          Mark Paid
        </Button>
      </BulkActionsBar>

      {/* Main Orders Table */}
      <AdminPlaceholderCard
        title='Customer Orders'
        description={`Displaying ${filteredOrders.length} order(s)`}
      >
        {filteredOrders.length === 0 ? (
          <p className='text-xs text-muted-foreground py-8 text-center'>
            No orders found matching your search or filters.
          </p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse text-left text-sm'>
              <thead>
                <tr className='border-b border-border font-semibold text-muted-foreground text-xs uppercase'>
                  <th className='p-3 w-10 text-center'>
                    <input
                      type='checkbox'
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className='size-4 rounded border-border cursor-pointer accent-black'
                    />
                  </th>
                  <th className='px-4 py-3'>Order Ref</th>
                  <th className='px-4 py-3'>Customer</th>
                  <th className='px-4 py-3'>City / State</th>
                  <th className='px-4 py-3'>Total</th>
                  <th className='px-4 py-3'>Payment</th>
                  <th className='px-4 py-3 text-center'>Fulfillment</th>
                  <th className='px-4 py-3 text-right'>Action</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border'>
                {filteredOrders.map((ord) => {
                  const isSelected = selectedIds.includes(ord.id)
                  return (
                    <tr
                      key={ord.id}
                      className={`transition-colors ${isSelected ? 'bg-muted/60' : 'hover:bg-muted/30'}`}
                    >
                      <td className='p-3 text-center'>
                        <input
                          type='checkbox'
                          checked={isSelected}
                          onChange={() => toggleSelectRow(ord.id)}
                          className='size-4 rounded border-border cursor-pointer accent-black'
                        />
                      </td>
                      <td className='px-4 py-4 font-bold text-foreground text-xs'>
                        #FML-{ord.order_number}
                      </td>
                      <td className='px-4 py-4'>
                        <div className='font-semibold text-foreground text-sm'>{ord.customer_name}</div>
                        <div className='text-xs text-muted-foreground truncate max-w-[180px]'>
                          {ord.customer_email}
                        </div>
                      </td>
                      <td className='px-4 py-4 text-xs text-muted-foreground'>
                        {ord.shipping_city}, {ord.shipping_state}
                      </td>
                      <td className='px-4 py-4 font-bold text-foreground text-xs'>
                        {formatNaira(ord.total_amount)}
                      </td>
                      <td className='px-4 py-4 text-xs'>
                        <StatusBadge status={ord.payment_status} />
                      </td>
                      <td className='px-4 py-4 text-center'>
                        <StatusBadge status={ord.status} />
                      </td>
                      <td className='px-4 py-4 text-right'>
                        <Button
                          asChild
                          variant='outline'
                          size='xs'
                          className='h-8 gap-1 border-border bg-white hover:bg-muted'
                        >
                          <Link href={`/admin/orders/${ord.id}`}>
                            Details
                            <ArrowUpRight className='size-3 text-muted-foreground' />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminPlaceholderCard>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onOpenChange={(open) => setConfirmConfig((prev) => ({ ...prev, isOpen: open }))}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
        isPending={isPending}
        onConfirm={confirmConfig.onConfirm}
      />
    </div>
  )
}
