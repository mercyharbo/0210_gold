'use client'

import { useAdminCategory } from '@/hooks/use-admin-endpoint'
import { CategoryForm } from './category-form'

export function CategoryEditor({ id }: { id: string }) {
  const { data, error, isLoading } = useAdminCategory(id)
  if (isLoading) return <p role='status' className='text-sm'>Loading...</p>
  if (error) return <p role='alert' className='text-sm text-red-700'>{error.message}</p>
  if (!data?.data) return <p>Category unavailable.</p>
  return <CategoryForm key={id} category={data.data} />
}
