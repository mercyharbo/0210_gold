'use server'

import { revalidatePath } from 'next/cache'

import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server'


export type StorefrontReview = {
  id: string
  customer_name: string
  rating: number
  comment: string
  created_at: string
}

export async function getApprovedProductReviews(productId: string): Promise<StorefrontReview[]> {
  let reviewsData: any[] = []

  try {
    const adminSupabase = createSupabaseAdminClient()
    const { data, error } = await adminSupabase
      .from('reviews')
      .select('id, customer_name, rating, comment, created_at, status')
      .eq('product_id', productId)
      .in('status', ['Approved', 'approved'])
      .order('created_at', { ascending: false })

    if (!error && data) {
      reviewsData = data
    } else {
      const supabase = await createSupabaseServerClient()
      const { data: fallbackData } = await supabase
        .from('reviews')
        .select('id, customer_name, rating, comment, created_at, status')
        .eq('product_id', productId)
        .in('status', ['Approved', 'approved'])
        .order('created_at', { ascending: false })

      reviewsData = fallbackData || []
    }
  } catch (error: any) {
    console.warn('Error fetching product reviews:', error?.message || error)
  }

  return reviewsData.map((r) => ({
    id: r.id,
    customer_name: r.customer_name || 'Verified Customer',
    rating: r.rating,
    comment: r.comment,
    created_at: new Date(r.created_at).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  }))
}


export async function submitProductReviewAction(formData: FormData) {
  const productId = formData.get('productId') as string
  const customerName = formData.get('customerName') as string
  const customerEmail = formData.get('customerEmail') as string
  const ratingStr = formData.get('rating') as string
  const comment = formData.get('comment') as string
  const productSlug = formData.get('productSlug') as string

  if (!productId || !customerName || !ratingStr || !comment) {
    return { success: false, error: 'Please fill in all required review fields.' }
  }

  const rating = parseInt(ratingStr, 10)
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return { success: false, error: 'Please select a valid rating between 1 and 5 stars.' }
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('reviews').insert({
    product_id: productId,
    user_id: user?.id ?? null,
    customer_name: customerName,
    customer_email: customerEmail || null,
    rating,
    comment,
    status: 'Pending',
  })

  if (error) {
    console.error('Failed to submit review:', error)
    return { success: false, error: error.message || 'Failed to submit review.' }
  }

  if (productSlug) {
    revalidatePath(`/products/${productSlug}`)
  }

  return {
    success: true,
    message: 'Thank you! Your review has been submitted and is pending admin approval before going live.',
  }
}
