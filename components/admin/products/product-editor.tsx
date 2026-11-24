'use client'

import { useAdminCategories, useAdminProduct } from '@/hooks/use-admin-endpoint'
import { ProductForm } from './product-form'

export function ProductEditor({ id = null }: { id?: string | null }) {
  const categories = useAdminCategories()
  const product = useAdminProduct(id)
  if (categories.isLoading || (id && product.isLoading)) return <p role='status' className='text-sm'>Loading...</p>
  const error = categories.error || product.error
  if (error) return <p role='alert' className='text-sm text-red-700'>{error.message}</p>
  if (!categories.data?.data || (id && !product.data?.data)) return <p className='text-sm'>Product information is unavailable. Please refresh.</p>
  return <ProductForm key={id ?? 'new'} product={product.data?.data} categories={categories.data.data} />
}
