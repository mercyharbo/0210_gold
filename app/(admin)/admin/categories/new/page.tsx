import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { Button } from '@/components/ui/button'
import { requireAdmin } from '@/lib/auth/session'
import { CategoryForm } from '../category-form'

export default async function AdminNewCategoryPage() {
  await requireAdmin()

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <AdminPageHeader
          title='Add Category'
          description='Create a category for products, preferences, and optional storefront collection cards.'
        />
        <Button asChild variant='outline'>
          <Link href='/admin/categories' className='flex items-center gap-2'>
            <ChevronLeft className='size-4' />
            Back to Categories
          </Link>
        </Button>
      </div>

      <CategoryForm mode='create' />
    </div>
  )
}
