import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { ReviewsClient, type ReviewRecord } from '@/components/admin/reviews-client'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export default async function AdminReviewsPage() {
  const supabase = createSupabaseAdminClient()

  let reviews: ReviewRecord[] = []

  try {
    const { data } = await supabase
      .from('reviews')
      .select('*, products(name)')
      .order('created_at', { ascending: false })

    if (data && data.length > 0) {
      reviews = data.map((r: any) => ({
        id: r.id,
        customer: r.customer_name || 'Verified Customer',
        rating: r.rating || 5,
        comment: r.comment || r.content || '',
        product: r.products?.name || r.product_name || 'Luxury Collection Item',
        date: new Date(r.created_at).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        status: r.status || 'Pending',
      }))
    }
  } catch (error) {
    console.warn('Could not fetch reviews from database:', error)
  }

  return (
    <div className='flex flex-col gap-6 bg-white text-black font-sans'>
      <AdminPageHeader
        title='Reviews & Feedback'
        description='Moderate product testimonials, feedback stars, and client recommendations.'
      />

      <ReviewsClient initialReviews={reviews} />
    </div>
  )
}
