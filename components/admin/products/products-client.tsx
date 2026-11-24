'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useSWRConfig } from 'swr'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { Button } from '@/components/ui/button'
import { useAdminProducts } from '@/hooks/use-admin-endpoint'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useApiRequest } from '@/hooks/use-api-request'
import { useAdminProductsUi } from '@/stores/admin-products-ui'
import { useToast } from '@/stores/hooks/use-toast'
import { adminProductsQuery } from '@/lib/products/admin-query'
import { affectedCatalogKey } from '@/lib/catalog/cache'
import type { CatalogProduct } from '@/types/catalog'
import { ProductFilters } from './product-filters'
import { ProductsTable } from './products-table'

export function ProductsClient() {
  const filters = useAdminProductsUi(useShallow(({ search, category, status, label, availability, sort, page }) => ({ search, category, status, label, availability, sort, page })))
  const setPage = useAdminProductsUi((state) => state.setPage)
  const search = useDebouncedValue(filters.search)
  const query = adminProductsQuery(filters, search)
  const { data, error, isLoading, isValidating } = useAdminProducts(query)
  const { cache, mutate } = useSWRConfig()
  const { execute, loading } = useApiRequest()
  const { toast } = useToast()
  const [deleting, setDeleting] = useState<CatalogProduct | null>(null)
  const deleteTrigger = useRef<HTMLButtonElement | null>(null)
  const searchInput = useRef<HTMLInputElement>(null)
  const products = data?.data

  async function handleDeleteProducts() {
    if (!deleting || loading) return
    try {
      const response = await execute('delete', `/admin/products/${encodeURIComponent(deleting.id)}`)
      deleteTrigger.current = null
      setDeleting(null)
      if (products?.items.length === 1 && filters.page > 1) setPage(filters.page - 1)
      toast(response.message || 'Product deleted successfully.', 'success')
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : 'Unable to delete the product.', 'failure')
      return
    }
    try {
      await mutate((key) => affectedCatalogKey(key, 'products'))
      if (cache.get(`/api/admin/products?${query}`)?.error) throw new Error('Refresh failed')
    } catch {
      toast('Product deleted, but refreshing failed. Refresh the list.', 'warning')
    }
  }

  if (isLoading && !products) return <p role='status' className='text-sm'>Loading...</p>

  return (
    <section className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <AdminPageHeader title='Products' description='Manage your catalog, pricing and product availability.' />
        <Button asChild className='h-10 bg-black px-4 text-white hover:bg-gold'><Link href='/admin/products/new'><Plus className='size-4' />Add product</Link></Button>
      </div>
      {error && <p role='alert' className='text-sm text-red-700'>{error.message}</p>}
      <div className='flex flex-col gap-5'>
        <ProductFilters searchRef={searchInput} />
        {isValidating && products && <p role='status' className='text-sm text-gray-600'>Updating products...</p>}
        {products ? (
          <>
            <ProductsTable products={products.items} disabled={loading || isLoading} onDelete={(product, trigger) => { deleteTrigger.current = trigger; setDeleting(product) }} />
            <div className='flex flex-wrap items-center justify-between gap-4 border-t border-border px-5 py-4 text-xs text-gray-600'>
              <span>{products.total} {products.total === 1 ? 'product' : 'products'}</span>
              <div className='flex items-center gap-3'>
                <Button variant='outline' size='sm' disabled={filters.page === 1 || isValidating} onClick={() => setPage(filters.page - 1)}>Previous</Button>
                <span>Page {filters.page} of {Math.max(1, Math.ceil(products.total / 24))}</span>
                <Button variant='outline' size='sm' disabled={filters.page * 24 >= products.total || isValidating} onClick={() => setPage(filters.page + 1)}>Next</Button>
              </div>
            </div>
          </>
        ) : !error && <p className='text-sm text-gray-600'>Products could not be loaded. Please refresh.</p>}
      </div>
      <ConfirmDialog isOpen={!!deleting} onOpenChange={(open) => { if (!open && !loading) setDeleting(null) }}
        title='Delete product?' description={`Delete "${deleting?.name ?? ''}"? Historical orders keep their product snapshots.`}
        confirmText='Delete product' isPending={loading} onConfirm={() => void handleDeleteProducts()}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          const target = deleteTrigger.current?.isConnected ? deleteTrigger.current : searchInput.current
          target?.focus()
        }} />
    </section>
  )
}
