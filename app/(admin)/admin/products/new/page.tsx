import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { Button } from '@/components/ui/button'
import { getActiveCategories } from '@/lib/profile/categories'
import { ProductCreateForm } from './product-create-form'

export default async function AdminNewProductPage() {
  const categories = await getActiveCategories()

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <AdminPageHeader
          title='Add Product'
          description='Create a new item in your catalog.'
        />
        <Button asChild variant='outline' size='sm'>
          <Link href='/admin/products' className='flex items-center gap-2'>
            <ChevronLeft className='size-4' />
            Back to Products
          </Link>
        </Button>
      </div>

      <ProductCreateForm categories={categories} />
    </div>
  )
}
