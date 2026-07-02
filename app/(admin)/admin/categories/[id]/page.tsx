import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { Button } from '@/components/ui/button'
import { requireAdmin } from '@/lib/auth/session'
import { getAdminCategoryById } from '@/lib/categories/admin-categories'
import { CategoryForm } from '../category-form'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function AdminCategoryDetailPage({ params }: PageProps) {
  await requireAdmin()

  const { id } = await params
  const category = await getAdminCategoryById(id)

  if (!category) {
    notFound()
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <AdminPageHeader
          title={`Edit Category: ${category.name}`}
          description='Update catalog behavior and featured collection card details.'
        />
        <Button asChild variant='outline'>
          <Link href='/admin/categories' className='flex items-center gap-2'>
            <ChevronLeft className='size-4' />
            Back to Categories
          </Link>
        </Button>
      </div>

      <CategoryForm mode='edit' category={category} />
    </div>
  )
}
