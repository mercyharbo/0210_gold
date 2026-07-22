import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { CategoriesClient } from '@/components/admin/categories-client'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export default async function AdminCategoriesPage() {
  const supabase = createSupabaseAdminClient()

  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  const categories = categoriesData || []

  return (
    <div className='flex flex-col gap-6 bg-white text-black'>
      <AdminPageHeader
        title='Categories Management'
        description='Organize store taxonomy, product collections, and homepage featured edits.'
      />

      <CategoriesClient categories={categories} />
    </div>
  )
}
