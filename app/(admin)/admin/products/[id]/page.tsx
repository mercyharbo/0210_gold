import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { Button } from '@/components/ui/button'
import { requireAdmin } from '@/lib/auth/session'
import { getActiveCategories } from '@/lib/profile/categories'
import { getAdminProductById } from '@/lib/products/admin-products'
import { ProductEditForm } from './product-edit-form'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function AdminProductDetailPage({ params }: PageProps) {
  await requireAdmin()

  const { id } = await params
  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    getActiveCategories(),
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <AdminPageHeader
          title={`Edit Product: ${product.name}`}
          description='Update product details, pricing, stock, attributes, and images.'
        />
        <Button asChild variant='outline' size='sm'>
          <Link href='/admin/products' className='flex items-center gap-2'>
            <ChevronLeft className='size-4' />
            Back to Products
          </Link>
        </Button>
      </div>

      <ProductEditForm categories={categories} product={product} />
    </div>
  )
}
