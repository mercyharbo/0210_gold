'use client'

import { useState, useTransition } from 'react'
import { ArrowUpRight, Plus, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import {
  bulkDeleteProductsAction,
  bulkUpdateProductsStatusAction,
} from '@/app/(admin)/admin/products/actions'
import { AdminPlaceholderCard } from '@/components/admin/admin-placeholder-card'
import { BulkActionsBar } from '@/components/admin/bulk-actions-bar'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { formatNaira } from '@/components/index/shop/shop-data'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { StatusBadge } from '@/components/ui/status-badge'
import { useToast } from '@/stores/hooks/use-toast'

type ProductsClientProps = {
  products: Array<{
    id: string
    name: string
    slug: string
    price: number | null
    stock: number | null
    status: string
    category_name?: string
    image_src: string
    created_at: string
  }>
}

export function ProductsClient({ products }: ProductsClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  // Modal Dialog Confirmation State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => void
    variant?: 'destructive' | 'default'
    confirmText?: string
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  })

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim()
    return (
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      (p.category_name && p.category_name.toLowerCase().includes(q))
    )
  })

  const isAllSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedIds.includes(p.id))

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id))
    }
  }

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const promptBulkDelete = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Selected Products',
      description: `Are you sure you want to permanently delete ${selectedIds.length} selected product(s)? This action cannot be undone.`,
      confirmText: 'Delete Products',
      variant: 'destructive',
      onConfirm: () => executeBulkDelete(),
    })
  }

  const executeBulkDelete = () => {
    startTransition(async () => {
      try {
        await bulkDeleteProductsAction(selectedIds)
        toast(`${selectedIds.length} product(s) deleted successfully.`, 'success')
        setSelectedIds([])
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }))
      } catch (err: any) {
        toast(err.message || 'Failed to delete products.', 'error')
      }
    })
  }

  const promptBulkStatus = (status: string) => {
    setConfirmConfig({
      isOpen: true,
      title: `Update Product Status to ${status.toUpperCase()}`,
      description: `Change visibility status to "${status}" for ${selectedIds.length} selected product(s)?`,
      confirmText: `Set ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      variant: 'default',
      onConfirm: () => executeBulkStatus(status),
    })
  }

  const executeBulkStatus = (status: string) => {
    startTransition(async () => {
      try {
        await bulkUpdateProductsStatusAction(selectedIds, status)
        toast(`Status updated to ${status} for ${selectedIds.length} product(s).`, 'success')
        setSelectedIds([])
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }))
      } catch (err: any) {
        toast(err.message || 'Failed to update product status.', 'error')
      }
    })
  }

  return (
    <div className='flex flex-col gap-6 font-sans'>
      {/* Top Header Controls */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
          <input
            type='text'
            placeholder='Search products by name or category...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full h-10 pl-9 pr-4 text-xs bg-white border border-border rounded-md outline-none focus:border-gold'
          />
        </div>

        <Button asChild size='sm' className='bg-black text-white hover:bg-gold hover:text-black gap-2 cursor-pointer h-10 px-4 rounded-none text-xs font-semibold'>
          <Link href='/admin/products/new'>
            <Plus className='size-4' />
            Add New Product
          </Link>
        </Button>
      </div>

      {/* Floating Bulk Actions Toolbar */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onDelete={promptBulkDelete}
      >
        <Button
          type='button'
          size='xs'
          variant='outline'
          disabled={isPending}
          onClick={() => promptBulkStatus('active')}
          className='h-8 border-border text-foreground bg-white hover:bg-neutral-100 text-xs font-semibold cursor-pointer'
        >
          {isPending && <Spinner className='size-3 mr-1' />}
          Set Active
        </Button>

        <Button
          type='button'
          size='xs'
          variant='outline'
          disabled={isPending}
          onClick={() => promptBulkStatus('draft')}
          className='h-8 border-border text-foreground bg-white hover:bg-neutral-100 text-xs font-semibold cursor-pointer'
        >
          {isPending && <Spinner className='size-3 mr-1' />}
          Set Draft
        </Button>
      </BulkActionsBar>

      {/* Products Table Card */}
      <AdminPlaceholderCard
        title='Product Catalog'
        description={`Displaying ${filteredProducts.length} product(s)`}
      >
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
                <th className='px-4 py-3'>Product</th>
                <th className='px-4 py-3'>Category</th>
                <th className='px-4 py-3'>Price</th>
                <th className='px-4 py-3 text-center'>Stock</th>
                <th className='px-4 py-3 text-center'>Status</th>
                <th className='px-4 py-3 text-right'>Action</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className='py-8 text-center text-xs text-muted-foreground'>
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isSelected = selectedIds.includes(p.id)
                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${isSelected ? 'bg-muted/60' : 'hover:bg-muted/30'}`}
                    >
                      <td className='p-3 text-center'>
                        <input
                          type='checkbox'
                          checked={isSelected}
                          onChange={() => toggleSelectRow(p.id)}
                          className='size-4 rounded border-border cursor-pointer accent-black'
                        />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-3'>
                          <div className='relative size-10 shrink-0 bg-neutral-100 border border-border rounded overflow-hidden'>
                            <Image
                              src={p.image_src || '/images/placeholder.jpg'}
                              alt={p.name}
                              fill
                              sizes='40px'
                              className='object-cover'
                            />
                          </div>
                          <div className='flex flex-col min-w-0'>
                            <Link
                              href={`/admin/products/${p.id}`}
                              className='text-xs font-semibold text-foreground hover:underline hover:text-gold truncate'
                            >
                              {p.name}
                            </Link>
                            <span className='text-3xs text-muted-foreground truncate'>
                              {p.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-3 text-xs text-muted-foreground'>
                        {p.category_name || 'Uncategorized'}
                      </td>
                      <td className='px-4 py-3 text-xs font-bold text-foreground'>
                        {p.price !== null ? formatNaira(p.price) : 'On Demand'}
                      </td>
                      <td className='px-4 py-3 text-center text-xs font-medium text-foreground'>
                        {p.stock ?? 0}
                      </td>
                      <td className='px-4 py-3 text-center'>
                        <StatusBadge status={p.status} />
                      </td>
                      <td className='px-4 py-3 text-right'>
                        <Button
                          asChild
                          variant='outline'
                          size='xs'
                          className='h-8 gap-1 border-border bg-white hover:bg-muted'
                        >
                          <Link href={`/admin/products/${p.id}`}>
                            Edit
                            <ArrowUpRight className='size-3 text-muted-foreground' />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
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
