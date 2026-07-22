import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { BannersClient } from '@/components/admin/banners-client'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export default async function AdminHeroBannersPage() {
  const supabase = createSupabaseAdminClient()

  const { data: bannersData } = await supabase
    .from('hero_banners')
    .select('*')
    .order('sort_order', { ascending: true })

  const banners = bannersData || []

  return (
    <div className='flex flex-col gap-6 bg-white text-black'>
      <AdminPageHeader
        title='Hero Banners'
        description='Manage high-impact marketing banners displayed on the storefront homepage.'
      />

      <BannersClient banners={banners} />
    </div>
  )
}
