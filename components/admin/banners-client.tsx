'use client'

import { useState, useTransition } from 'react'
import { ArrowUpRight, Plus, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import {
  bulkDeleteBannersAction,
  bulkUpdateBannersStatusAction,
} from '@/app/(admin)/admin/hero-banners/actions'
import { AdminPlaceholderCard } from '@/components/admin/admin-placeholder-card'
import { BulkActionsBar } from '@/components/admin/bulk-actions-bar'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { StatusBadge } from '@/components/ui/status-badge'
import { useToast } from '@/stores/hooks/use-toast'

type BannersClientProps = {
  banners: Array<{
    id: string
    title: string
    description: string | null
    image_src: string
    route: string | null
    is_active: boolean
    sort_order: number
  }>
}

export function BannersClient({ banners }: BannersClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  // Modal Confirmation State
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

  const filteredBanners = banners.filter((b) => {
    const q = searchQuery.toLowerCase().trim()
    return !q || b.title.toLowerCase().includes(q) || (b.description && b.description.toLowerCase().includes(q))
  })

  const isAllSelected =
    filteredBanners.length > 0 &&
    filteredBanners.every((b) => selectedIds.includes(b.id))

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredBanners.map((b) => b.id))
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
      title: 'Delete Selected Hero Banners',
      description: `Are you sure you want to delete ${selectedIds.length} selected hero banner(s)? This action cannot be undone.`,
      confirmText: 'Delete Banners',
      variant: 'destructive',
      onConfirm: () => executeBulkDelete(),
    })
  }

  const executeBulkDelete = () => {
    startTransition(async () => {
      try {
        await bulkDeleteBannersAction(selectedIds)
        toast(`${selectedIds.length} banner(s) deleted successfully.`, 'success')
        setSelectedIds([])
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }))
      } catch (err: any) {
        toast(err.message || 'Failed to delete banners.', 'error')
      }
    })
  }

  const promptBulkStatus = (isActive: boolean) => {
    const label = isActive ? 'Active' : 'Inactive'
    setConfirmConfig({
      isOpen: true,
      title: `Set Visibility to ${label}`,
      description: `Update ${selectedIds.length} selected hero banner(s) visibility to ${label}?`,
      confirmText: `Set ${label}`,
      variant: 'default',
      onConfirm: () => executeBulkStatus(isActive),
    })
  }

  const executeBulkStatus = (isActive: boolean) => {
    startTransition(async () => {
      try {
        await bulkUpdateBannersStatusAction(selectedIds, isActive)
        toast(
          `Visibility updated to ${isActive ? 'Active' : 'Inactive'} for ${selectedIds.length} banner(s).`,
          'success'
        )
        setSelectedIds([])
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }))
      } catch (err: any) {
        toast(err.message || 'Failed to update banner visibility.', 'error')
      }
    })
  }

  return (
    <div className='flex flex-col gap-6 font-sans'>
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
          <input
            type='text'
            placeholder='Search hero banners...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full h-10 pl-9 pr-4 text-xs bg-white border border-border rounded-md outline-none focus:border-gold'
          />
        </div>

        <Button asChild size='sm' className='bg-black text-white hover:bg-gold hover:text-black gap-2 cursor-pointer h-10 px-4 rounded-none text-xs font-semibold'>
          <Link href='/admin/hero-banners/new'>
            <Plus className='size-4' />
            Add New Banner
          </Link>
        </Button>
      </div>

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
          onClick={() => promptBulkStatus(true)}
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
          onClick={() => promptBulkStatus(false)}
          className='h-8 border-border text-foreground bg-white hover:bg-neutral-100 text-xs font-semibold cursor-pointer'
        >
          {isPending && <Spinner className='size-3 mr-1' />}
          Set Inactive
        </Button>
      </BulkActionsBar>

      <AdminPlaceholderCard
        title='Hero Banners'
        description={`Displaying ${filteredBanners.length} banner(s)`}
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
                <th className='px-4 py-3'>Banner</th>
                <th className='px-4 py-3'>Target Route</th>
                <th className='px-4 py-3 text-center'>Sort Order</th>
                <th className='px-4 py-3 text-center'>Status</th>
                <th className='px-4 py-3 text-right'>Action</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {filteredBanners.length === 0 ? (
                <tr>
                  <td colSpan={6} className='py-8 text-center text-xs text-muted-foreground'>
                    No hero banners found.
                  </td>
                </tr>
              ) : (
                filteredBanners.map((b) => {
                  const isSelected = selectedIds.includes(b.id)
                  return (
                    <tr
                      key={b.id}
                      className={`transition-colors ${isSelected ? 'bg-muted/60' : 'hover:bg-muted/30'}`}
                    >
                      <td className='p-3 text-center'>
                        <input
                          type='checkbox'
                          checked={isSelected}
                          onChange={() => toggleSelectRow(b.id)}
                          className='size-4 rounded border-border cursor-pointer accent-black'
                        />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-3'>
                          <div className='relative w-16 h-10 shrink-0 bg-neutral-100 border border-border rounded overflow-hidden'>
                            <Image
                              src={b.image_src}
                              alt={b.title}
                              fill
                              sizes='64px'
                              className='object-cover'
                            />
                          </div>
                          <div className='flex flex-col min-w-0'>
                            <span className='text-xs font-semibold text-foreground truncate'>
                              {b.title}
                            </span>
                            {b.description && (
                              <span className='text-3xs text-muted-foreground truncate max-w-[200px]'>
                                {b.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-3 text-xs text-muted-foreground font-mono'>
                        {b.route || '/'}
                      </td>
                      <td className='px-4 py-3 text-center text-xs font-medium text-foreground'>
                        {b.sort_order}
                      </td>
                      <td className='px-4 py-3 text-center'>
                        <StatusBadge status={b.is_active ? 'active' : 'inactive'} />
                      </td>
                      <td className='px-4 py-3 text-right'>
                        <Button
                          asChild
                          variant='outline'
                          size='xs'
                          className='h-8 gap-1 border-border bg-white hover:bg-muted'
                        >
                          <Link href={`/admin/hero-banners/${b.id}`}>
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
