'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, MessageSquare, Send, Star, User } from 'lucide-react'

import { submitProductReviewAction, type StorefrontReview } from '@/lib/reviews/storefront-reviews'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

type ProductReviewsProps = {
  productId: string
  productSlug: string
  initialReviews: StorefrontReview[]
}

export function ProductReviews({
  productId,
  productSlug,
  initialReviews,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<StorefrontReview[]>(initialReviews)
  const [isFormOpen, setIsFormOpen] = useState(false)
  
  // Form State
  const [rating, setRating] = useState(5)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [comment, setComment] = useState('')

  const [isPending, startTransition] = useTransition()
  const [formFeedback, setFormFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormFeedback(null)

    const formData = new FormData()
    formData.set('productId', productId)
    formData.set('productSlug', productSlug)
    formData.set('customerName', customerName)
    formData.set('customerEmail', customerEmail)
    formData.set('rating', String(rating))
    formData.set('comment', comment)

    startTransition(async () => {
      const res = await submitProductReviewAction(formData)
      if (res.success) {
        setFormFeedback({ type: 'success', message: res.message || 'Review submitted!' })
        setComment('')
        setIsFormOpen(false)
      } else {
        setFormFeedback({ type: 'error', message: res.error || 'Failed to submit review.' })
      }
    })
  }

  return (
    <div className='flex flex-col gap-8 py-8 border-t border-black/10 font-sans text-black'>
      {/* Header & Metrics */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <MessageSquare className='size-5 text-gold' />
            <h2 className='font-heading text-2xl font-bold text-black'>
              Customer Reviews ({reviews.length})
            </h2>
          </div>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <div className='flex items-center gap-0.5 text-amber-500'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-3.5 fill-current ${
                    i < Math.round(Number(avgRating)) ? 'opacity-100' : 'opacity-25'
                  }`}
                />
              ))}
            </div>
            <span className='font-bold text-black text-sm'>{avgRating} out of 5</span>
            <span>({reviews.length} verified review{reviews.length === 1 ? '' : 's'})</span>
          </div>
        </div>

        <Button
          type='button'
          onClick={() => setIsFormOpen(!isFormOpen)}
          className='bg-black text-white hover:bg-gold hover:text-black text-xs font-semibold h-10 px-5 rounded-none cursor-pointer'
        >
          {isFormOpen ? 'Cancel' : 'Write a Review'}
        </Button>
      </div>

      {/* Submission Feedback Alert */}
      {formFeedback && (
        <div
          className={`p-4 text-xs font-medium border flex items-start gap-2.5 rounded-none ${
            formFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
          }`}
        >
          <CheckCircle2 className='size-4 shrink-0 mt-0.5 text-emerald-600' />
          <span>{formFeedback.message}</span>
        </div>
      )}

      {/* Interactive Review Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className='p-6 bg-neutral-50 border border-black/10 space-y-5 animate-in fade-in duration-200'
        >
          <h3 className='font-heading text-lg font-bold text-black'>Share Your Feedback</h3>

          {/* Star Rating Picker */}
          <div className='space-y-1.5'>
            <label className='block text-xs font-semibold uppercase text-black/70'>
              Overall Rating *
            </label>
            <div className='flex items-center gap-1.5'>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type='button'
                  onClick={() => setRating(star)}
                  className='p-1 cursor-pointer transition-transform hover:scale-110'
                >
                  <Star
                    className={`size-6 ${
                      star <= rating
                        ? 'fill-amber-500 text-amber-500'
                        : 'text-neutral-300'
                    }`}
                  />
                </button>
              ))}
              <span className='ml-2 text-xs font-bold text-black'>{rating} Star{rating > 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className='grid sm:grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <label className='block text-xs font-semibold uppercase text-black/70'>
                Your Name *
              </label>
              <input
                type='text'
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder='e.g., Tunde Bakare'
                className='w-full h-11 px-4 text-xs bg-white border border-black/15 outline-none focus:border-gold'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='block text-xs font-semibold uppercase text-black/70'>
                Your Email (Optional)
              </label>
              <input
                type='email'
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder='Used to verify your order'
                className='w-full h-11 px-4 text-xs bg-white border border-black/15 outline-none focus:border-gold'
              />
            </div>
          </div>

          <div className='space-y-1.5'>
            <label className='block text-xs font-semibold uppercase text-black/70'>
              Review Description *
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder='Describe the product quality, weight, finish, and delivery experience...'
              className='w-full p-4 text-xs bg-white border border-black/15 outline-none focus:border-gold resize-none'
            />
          </div>

          <Button
            type='submit'
            disabled={isPending}
            className='bg-black text-white hover:bg-gold hover:text-black text-xs font-semibold h-11 px-6 gap-2 rounded-none cursor-pointer'
          >
            {isPending ? (
              <>
                <Spinner className='size-4' />
                Submitting Review...
              </>
            ) : (
              <>
                <Send className='size-3.5' />
                Submit Review for Moderation
              </>
            )}
          </Button>
        </form>
      )}

      {/* Reviews List */}
      <div className='space-y-4'>
        {reviews.length === 0 ? (
          <div className='p-8 text-center border border-dashed border-black/15 bg-neutral-50/50 space-y-2'>
            <User className='size-8 text-neutral-400 mx-auto' />
            <p className='text-xs text-muted-foreground'>
              No customer reviews yet. Be the first to leave a review for this item!
            </p>
          </div>
        ) : (
          <div className='divide-y divide-black/10 border-t border-b border-black/10'>
            {reviews.map((rev) => (
              <div key={rev.id} className='py-5 space-y-2'>
                <div className='flex items-center justify-between gap-4'>
                  <div className='flex items-center gap-2'>
                    <span className='font-bold text-sm text-black'>{rev.customer_name}</span>
                    <span className='inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 rounded-full'>
                      <CheckCircle2 className='size-3' /> Verified Buyer
                    </span>
                  </div>
                  <span className='text-xs text-muted-foreground'>{rev.created_at}</span>
                </div>

                <div className='flex items-center gap-0.5 text-amber-500'>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 fill-current ${
                        i < rev.rating ? 'opacity-100' : 'opacity-20'
                      }`}
                    />
                  ))}
                </div>

                <p className='text-xs leading-relaxed text-neutral-700 font-sans pt-1'>
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
