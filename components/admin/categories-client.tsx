'use client'

import { useState, useTransition } from 'react'
import { ArrowUpRight, Plus, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { bulkDeleteCategoriesAction } from '@/app/(admin)/admin/categories/actions'
import { AdminPlaceholderCard } from '@/components/admin/admin-placeholder-card'
import { BulkActionsBar } from '@/components/admin/bulk-actions-bar'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { useToast } from '@/stores/hooks/use-toast'

type CategoriesClientProps = {
  categories: Array<{
    id: string
    name: string
    slug: string
    category_type: string
    image_src: string | null
    is_active: boolean
    is_featured: boolean
    sort_order: number
  }>
}

export function CategoriesClient({ categories }: CategoriesClientProps) {
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
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  })

  const filteredCategories = categories.filter((c) => {
    const q = searchQuery.toLowerCase().trim()
    return !q || c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
  })

  const isAllSelected =
    filteredCategories.length > 0 &&
    filteredCategories.every((c) => selectedIds.includes(c.id))

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredCategories.map((c) => c.id))
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
      title: 'Delete Selected Categories',
      description: `Are you sure you want to delete ${selectedIds.length} selected category(ies)? This action cannot be undone.`,
      onConfirm: () => executeBulkDelete(),
    })
  }

  const executeBulkDelete = () => {
    startTransition(async () => {
      try {
        await bulkDeleteCategoriesAction(selectedIds)
        toast(`${selectedIds.length} category(ies) deleted successfully.`, 'success')
        setSelectedIds([])
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }))
      } catch (err: any) {
        toast(err.message || 'Failed to delete categories.', 'error')
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
            placeholder='Search categories by name or slug...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full h-10 pl-9 pr-4 text-xs bg-white border border-border rounded-md outline-none focus:border-gold'
          />
        </div>

        <Button asChild size='sm' className='bg-black text-white hover:bg-gold hover:text-black gap-2 cursor-pointer h-10 px-4 rounded-none text-xs font-semibold'>
          <Link href='/admin/categories/new'>
            <Plus className='size-4' />
            Add Category
          </Link>
        </Button>
      </div>

      <BulkActionsBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onDelete={promptBulkDelete}
      />

      <AdminPlaceholderCard
        title='Product Categories'
        description={`Displaying ${filteredCategories.length} category(ies)`}
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
                <th className='px-4 py-3'>Category</th>
                <th className='px-4 py-3'>Type</th>
                <th className='px-4 py-3 text-center'>Sort Order</th>
                <th className='px-4 py-3 text-center'>Status</th>
                <th className='px-4 py-3 text-right'>Action</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className='py-8 text-center text-xs text-muted-foreground'>
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((c) => {
                  const isSelected = selectedIds.includes(c.id)
                  return (
                    <tr
                      key={c.id}
                      className={`transition-colors ${isSelected ? 'bg-muted/60' : 'hover:bg-muted/30'}`}
                    >
                      <td className='p-3 text-center'>
                        <input
                          type='checkbox'
                          checked={isSelected}
                          onChange={() => toggleSelectRow(c.id)}
                          className='size-4 rounded border-border cursor-pointer accent-black'
                        />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-3'>
                          {c.image_src ? (
                            <div className='relative size-9 shrink-0 bg-neutral-100 border border-border rounded overflow-hidden'>
                              <Image
                                src={c.image_src}
                                alt={c.name}
                                fill
                                sizes='36px'
                                className='object-cover'
                              />
                            </div>
                          ) : (
                            <div className='size-9 shrink-0 bg-neutral-100 border border-border rounded flex items-center justify-center font-bold text-xs text-muted-foreground'>
                              {c.name.charAt(0)}
                            </div>
                          )}
                          <div className='flex flex-col min-w-0'>
                            <span className='text-xs font-semibold text-foreground truncate'>
                              {c.name}
                            </span>
                            <span className='text-3xs text-muted-foreground truncate'>
                              {c.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-3 text-xs text-muted-foreground capitalize'>
                        {c.category_type || 'standard'}
                      </td>
                      <td className='px-4 py-3 text-center text-xs font-medium text-foreground'>
                        {c.sort_order}
                      </td>
                      <td className='px-4 py-3 text-center'>
                        <StatusBadge status={c.is_active ? 'active' : 'inactive'} />
                      </td>
                      <td className='px-4 py-3 text-right'>
                        <Button
                          asChild
                          variant='outline'
                          size='xs'
                          className='h-8 gap-1 border-border bg-white hover:bg-muted'
                        >
                          <Link href={`/admin/categories/${c.id}`}>
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
        confirmText='Delete Categories'
        variant='destructive'
        isPending={isPending}
        onConfirm={confirmConfig.onConfirm}
      />
    </div>
  )
}
