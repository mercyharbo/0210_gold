'use server'

import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/lib/auth/session'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function updateReviewStatusAction(reviewId: string, status: string) {
  await requireAdmin()
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from('reviews')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', reviewId)

  if (error) {
    console.warn('Review status update warning:', error.message)
  }

  revalidatePath('/admin/reviews')
  revalidatePath('/shop')
}

export async function bulkUpdateReviewsStatusAction(reviewIds: string[], status: string) {
  await requireAdmin()
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from('reviews')
    .update({ status, updated_at: new Date().toISOString() })
    .in('id', reviewIds)

  if (error) {
    console.warn('Bulk review status update warning:', error.message)
  }

  revalidatePath('/admin/reviews')
  revalidatePath('/shop')
}

export async function bulkDeleteReviewsAction(reviewIds: string[]) {
  await requireAdmin()
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from('reviews')
    .delete()
    .in('id', reviewIds)

  if (error) {
    console.warn('Bulk review delete warning:', error.message)
  }

  revalidatePath('/admin/reviews')
  revalidatePath('/shop')
}
