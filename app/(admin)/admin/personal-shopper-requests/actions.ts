'use server'

import { revalidatePath } from 'next/cache'

import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function updateRequestStatusAction(
  requestId: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  if (!requestId || !status) {
    return { success: false, error: 'Request ID and status are required.' }
  }

  const adminSupabase = createSupabaseAdminClient()

  const { error } = await adminSupabase
    .from('personal_shopper_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId)

  if (error) {
    console.error('Failed to update request status:', error)
    return { success: false, error: 'Failed to update request status.' }
  }

  revalidatePath('/admin/personal-shopper-requests')
  revalidatePath('/admin/requests')
  return { success: true }
}

export async function updateAdminNotesAction(
  requestId: string,
  adminNotes: string
): Promise<{ success: boolean; error?: string }> {
  if (!requestId) {
    return { success: false, error: 'Request ID is required.' }
  }

  const adminSupabase = createSupabaseAdminClient()

  const { error } = await adminSupabase
    .from('personal_shopper_requests')
    .update({ admin_notes: adminNotes, updated_at: new Date().toISOString() })
    .eq('id', requestId)

  if (error) {
    console.error('Failed to update admin notes:', error)
    return { success: false, error: 'Failed to update admin notes.' }
  }

  revalidatePath('/admin/personal-shopper-requests')
  revalidatePath('/admin/requests')
  return { success: true }
}
