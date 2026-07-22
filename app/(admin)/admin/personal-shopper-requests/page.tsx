import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { AdminPageHeader } from '@/components/admin/admin-page-header'

import { PersonalShopperRequestsClient } from './client'

export type PersonalShopperRequestRecord = {
  id: string
  user_id: string | null
  full_name: string
  phone: string
  email: string
  category: string
  budget: string | null
  size: string | null
  preferred_stores_or_links: string | null
  delivery_city: string | null
  message: string
  status: string
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export default async function AdminPersonalShopperRequestsPage() {
  const adminSupabase = createSupabaseAdminClient()

  const { data: requests, error } = await adminSupabase
    .from('personal_shopper_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching personal shopper requests:', error)
  }

  const initialRequests: PersonalShopperRequestRecord[] = requests || []

  return (
    <div className='flex flex-col gap-6'>
      <AdminPageHeader
        title='Personal Shopper Requests'
        description='Review bespoke sourcing briefs, manage sourcing status, and record admin updates.'
      />

      <PersonalShopperRequestsClient initialRequests={initialRequests} />
    </div>
  )
}
