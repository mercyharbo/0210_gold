'use client'

import { Star } from 'lucide-react'
import { useState, useTransition } from 'react'

import { createProductReviewAction } from '@/app/(index)/profile/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

export type ReviewItem = {
  id: string
  productId: string
  productName: string
  rating: number
  comment: string | null
}

export type ReadyReviewItem = {
  id: string
  name: string
}

type ProfileReviewsProps = {
  reviews: ReviewItem[]
  readyForReview: ReadyReviewItem[]
}

export function ProfileReviews({ reviews, readyForReview }: ProfileReviewsProps) {
  const [isPending, startTransition] = useTransition()
  const [activeProductId, setActiveProductId] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (productId: string) => {
    setError(null)
    if (rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5.')
      return
    }

    startTransition(async () => {
      try {
        await createProductReviewAction(productId, rating, comment)
        setActiveProductId(null)
        setRating(5)
        setComment('')
      } catch (err: any) {
        setError(err.message || 'Failed to submit review.')
      }
    })
  }

  return (
    <div className='space-y-6'>
      {/* Ready for Review Section */}
      {readyForReview.length > 0 && (
        <div className='space-y-4'>
          <h4 className='text-xs font-bold uppercase tracking-wider text-gold'>
            Ready for review
          </h4>
          <div className='space-y-4'>
            {readyForReview.map((item) => {
              const isEditing = activeProductId === item.id
              return (
                <div
                  key={item.id}
                  className='border border-black/10 p-4 rounded-none bg-muted/20 space-y-4'
                >
                  <div className='flex items-start justify-between gap-4'>
                    <div className='space-y-1'>
                      <h3 className='text-sm font-semibold'>{item.name}</h3>
                      <p className='text-xs text-muted-foreground'>
                        Share fit, fabric, and styling feedback
                      </p>
                    </div>
                    {!isEditing && (
                      <button
                        type='button'
                        onClick={() => {
                          setActiveProductId(item.id)
                          setError(null)
                        }}
                        className='shrink-0 text-xs font-semibold text-gold underline underline-offset-2 hover:text-black'
                      >
                        Write review
                      </button>
                    )}
                  </div>

                  {isEditing && (
                    <div className='space-y-4 pt-2 border-t border-black/5'>
                      {error && (
                        <p className='text-xs font-medium text-destructive'>
                          {error}
                        </p>
                      )}

                      {/* Stars Selector */}
                      <div className='flex flex-col gap-1.5'>
                        <Label className='text-xs font-semibold'>Rating</Label>
                        <div className='flex gap-1'>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type='button'
                              onClick={() => setRating(star)}
                              className='p-0.5 transition-transform hover:scale-110'
                            >
                              <Star
                                className={`size-5 ${
                                  star <= rating
                                    ? 'fill-gold text-gold'
                                    : 'text-muted-foreground/30'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comment Input */}
                      <div className='flex flex-col gap-1.5'>
                        <Label htmlFor={`comment-${item.id}`} className='text-xs font-semibold'>
                          Review comment
                        </Label>
                        <textarea
                          id={`comment-${item.id}`}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder='Tell us what you think about this product...'
                          rows={3}
                          className='flex w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                        />
                      </div>

                      <div className='flex gap-3 pt-2'>
                        <Button
                          type='button'
                          onClick={() => handleSubmit(item.id)}
                          disabled={isPending}
                          size='xs'
                          className='rounded-none h-8 px-4 bg-black text-white hover:bg-gold hover:text-black gap-1 cursor-pointer'
                        >
                          {isPending && <Spinner className='size-3 text-current' />}
                          Submit
                        </Button>
                        <Button
                          type='button'
                          onClick={() => {
                            setActiveProductId(null)
                            setError(null)
                          }}
                          disabled={isPending}
                          variant='outline'
                          size='xs'
                          className='rounded-none h-8 px-4 border-black/25 cursor-pointer'
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Written Reviews Section */}
      <div className='space-y-4'>
        <h4 className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
          Your reviews
        </h4>
        {reviews.length === 0 ? (
          <p className='text-sm text-muted-foreground pt-2'>
            You haven't written any product reviews yet.
          </p>
        ) : (
          <div className='divide-y divide-black/10'>
            {reviews.map((item) => (
              <div key={item.id} className='py-4 first:pt-0 last:pb-0'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='space-y-1.5 min-w-0'>
                    <h3 className='text-sm font-semibold text-black truncate'>
                      {item.productName}
                    </h3>
                    <div className='flex gap-0.5'>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`size-3.5 ${
                            star <= item.rating
                              ? 'fill-gold text-gold'
                              : 'text-muted-foreground/20'
                          }`}
                        />
                      ))}
                    </div>
                    {item.comment && (
                      <p className='text-sm leading-relaxed text-muted-foreground mt-2'>
                        {item.comment}
                      </p>
                    )}
                  </div>
                  <span className='shrink-0 text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-50 px-2 py-0.5 border border-emerald-100'>
                    Reviewed
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
