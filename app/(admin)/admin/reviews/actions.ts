'use server'

import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/lib/auth/session'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

async function revalidateReviewPaths(supabase: any, reviewIds: string[]) {
  try {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('product_id')
      .in('id', reviewIds)

    if (reviews && reviews.length > 0) {
      const productIds = Array.from(
        new Set(reviews.map((r: any) => r.product_id).filter(Boolean))
      )
      if (productIds.length > 0) {
        const { data: products } = await supabase
          .from('products')
          .select('slug')
          .in('id', productIds)

        products?.forEach((p: any) => {
          if (p.slug) {
            revalidatePath(`/products/${p.slug}`)
          }
        })
      }
    }
  } catch (err) {
    console.warn('Review revalidation warning:', err)
  }

  revalidatePath('/admin/reviews')
  revalidatePath('/shop')
  revalidatePath('/', 'layout')
}

export async function updateReviewStatusAction(reviewId: string, status: string) {
  await requireAdmin()
  const supabase = createSupabaseAdminClient()

  // First fetch affected paths before update
  await revalidateReviewPaths(supabase, [reviewId])

  const { error } = await supabase
    .from('reviews')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', reviewId)

  if (error) {
    console.error('Review status update error:', error.message)
    throw new Error(error.message || 'Failed to update review status in database')
  }

  await revalidateReviewPaths(supabase, [reviewId])
}

export async function bulkUpdateReviewsStatusAction(reviewIds: string[], status: string) {
  await requireAdmin()
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from('reviews')
    .update({ status, updated_at: new Date().toISOString() })
    .in('id', reviewIds)

  if (error) {
    console.error('Bulk review status update error:', error.message)
    throw new Error(error.message || 'Failed to bulk update review status')
  }

  await revalidateReviewPaths(supabase, reviewIds)
}

export async function bulkDeleteReviewsAction(reviewIds: string[]) {
  await requireAdmin()
  const supabase = createSupabaseAdminClient()

  // Revalidate before delete while product_id is accessible
  await revalidateReviewPaths(supabase, reviewIds)

  const { error } = await supabase
    .from('reviews')
    .delete()
    .in('id', reviewIds)

  if (error) {
    console.error('Bulk review delete error:', error.message)
    throw new Error(error.message || 'Failed to delete reviews')
  }

  revalidatePath('/admin/reviews')
  revalidatePath('/shop')
  revalidatePath('/', 'layout')
}


