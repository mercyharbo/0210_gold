'use client'

import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAdminCategories } from '@/hooks/use-admin-endpoint'
import { useApiRequest } from '@/hooks/use-api-request'
import { affectedCatalogKey } from '@/lib/catalog/cache'
import { useToast } from '@/stores/hooks/use-toast'
import type { CatalogCategory } from '@/types/catalog'
import { FolderOpen, Plus, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { useSWRConfig } from 'swr'
import { CategoryActions } from './category-actions'

export function CategoriesClient() {
  const { data, error, isLoading } = useAdminCategories()
  const { cache, mutate } = useSWRConfig()
  const { toast } = useToast()
  const request = useApiRequest()
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<CatalogCategory | null>(null)
  const deleteTrigger = useRef<HTMLButtonElement | null>(null)
  const searchInput = useRef<HTMLInputElement>(null)
  const query = search.trim().toLowerCase()
  const rows = (data?.data ?? []).filter(
    (category) =>
      !query ||
      category.name.toLowerCase().includes(query) ||
      category.slug.includes(query),
  )

  async function destroy() {
    if (!deleting || request.loading) return
    try {
      const response = await request.execute(
        'delete',
        `/admin/categories/${deleting.id}`,
      )
      // The deleted row disappears; return focus to search instead of its menu.
      deleteTrigger.current = null
      setDeleting(null)
      toast(response.message || 'Category deleted successfully.', 'success')
    } catch (failure) {
      toast(
        failure instanceof Error
          ? failure.message
          : 'Unable to delete the category.',
        'failure',
      )
      return
    }
    try {
      await mutate((key) => affectedCatalogKey(key, 'categories'))
      if (cache.get('/api/admin/categories')?.error)
        throw new Error('Refresh failed')
    } catch {
      toast(
        'Category deleted, but refreshing failed. Refresh the list.',
        'warning',
      )
    }
  }

  return (
    <section className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <AdminPageHeader
          title='Categories'
          description='Organize your products into collections.'
        />
        <Button asChild className='h-10 bg-black px-4 text-white hover:bg-gold'>
          <Link href='/admin/categories/new'>
            <Plus className='size-4' />
            Add category
          </Link>
        </Button>
      </div>

      {error && (
        <p role='alert' className='text-sm text-red-700'>
          {error.message}
        </p>
      )}

      <div className='flex flex-col gap-5'>
        <div className='relative w-full sm:max-w-xs'>
          <Search
            className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500'
            aria-hidden='true'
          />
          <Input
            ref={searchInput}
            aria-label='Search categories'
            placeholder='Search categories...'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className='h-10 rounded-md bg-white pl-9'
          />
        </div>

        {isLoading ? (
          <p role='status' className='p-5 text-sm'>
            Loading...
          </p>
        ) : data ? (
          <>
            <Table className='min-w-2xl'>
              <TableHeader className='bg-gray-50'>
                <TableRow className='hover:bg-transparent'>
                  <TableHead className='h-11 px-5'>Category</TableHead>
                  <TableHead className='px-4'>Type</TableHead>
                  <TableHead className='px-4'>Sort order</TableHead>
                  <TableHead className='px-4'>Status</TableHead>
                  <TableHead className='px-5 text-right'>
                    <span className='sr-only'>Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!rows.length && (
                  <TableRow>
                    <TableCell colSpan={5} className='py-12 text-center'>
                      <div className='flex flex-col items-center gap-3'>
                        <FolderOpen
                          className='size-7 text-gray-400'
                          aria-hidden='true'
                        />
                        <p className='font-medium'>No categories found.</p>
                        <p className='text-sm text-gray-600'>
                          {query
                            ? 'Try another name or slug.'
                            : 'Add your first category to organize your products.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {rows.map((category) => (
                  <TableRow key={category.id} className='hover:bg-gray-50/70'>
                    <TableCell className='max-w-sm whitespace-normal px-5 py-4'>
                      <div className='flex items-center gap-3'>
                        {category.images[0] ? (
                          <Image
                            src={category.images[0].url}
                            alt={category.images[0].alt}
                            width={48}
                            height={48}
                            className='size-12 shrink-0 rounded-md border border-border object-cover'
                          />
                        ) : (
                          <span className='flex size-12 shrink-0 items-center justify-center rounded-md bg-gray-100'>
                            <FolderOpen
                              className='size-5 text-gray-400'
                              aria-hidden='true'
                            />
                          </span>
                        )}
                        <div className='flex min-w-0 flex-col gap-1'>
                          <Link
                            href={`/admin/categories/${category.id}`}
                            className='break-words font-medium hover:text-gold hover:underline'
                          >
                            {category.name}
                          </Link>
                          <span className='break-all text-xs text-gray-600'>
                            {category.slug}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='px-4 text-gray-600'>
                      {category.category_type}
                    </TableCell>
                    <TableCell className='px-4 tabular-nums text-gray-600'>
                      {category.sort_order}
                    </TableCell>
                    <TableCell className='px-4'>
                      <div className='flex flex-wrap gap-2'>
                        <StatusBadge
                          status={category.is_active ? 'active' : 'inactive'}
                        />
                        {category.is_featured && (
                          <StatusBadge status='featured' />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className='px-5 text-right'>
                      <CategoryActions
                        category={category}
                        disabled={request.loading}
                        onDelete={(target, trigger) => {
                          deleteTrigger.current = trigger
                          setDeleting(target)
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <p className='border-t border-border px-5 py-4 text-xs text-gray-600'>
              {rows.length} {rows.length === 1 ? 'category' : 'categories'}
              {query ? ' matching your search' : ''}
            </p>
          </>
        ) : (
          <p className='p-5 text-sm text-gray-600'>
            Categories could not be loaded. Please refresh to try again.
          </p>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleting}
        onOpenChange={(open) => {
          if (!open && !request.loading) setDeleting(null)
        }}
        title='Delete category?'
        description={`Delete "${deleting?.name ?? ''}"? Categories used by products cannot be deleted.`}
        confirmText='Delete category'
        isPending={request.loading}
        onConfirm={() => void destroy()}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          const target = deleteTrigger.current?.isConnected
            ? deleteTrigger.current
            : searchInput.current
          target?.focus()
        }}
      />
    </section>
  )
}
