'use client'

import { useState, useTransition } from 'react'
import {
  Check,
  CheckCircle,
  Filter,
  MessageSquare,
  MoreHorizontal,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  Trash2,
  X,
} from 'lucide-react'

import {
  bulkDeleteReviewsAction,
  bulkUpdateReviewsStatusAction,
  updateReviewStatusAction,
} from '@/app/(admin)/admin/reviews/actions'
import { AdminPlaceholderCard } from '@/components/admin/admin-placeholder-card'
import { BulkActionsBar } from '@/components/admin/bulk-actions-bar'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { StatusBadge } from '@/components/ui/status-badge'
import { useToast } from '@/stores/hooks/use-toast'

export type ReviewRecord = {
  id: string
  customer: string
  rating: number
  comment: string
  product: string
  date: string
  status: string
}

type ReviewsClientProps = {
  initialReviews: ReviewRecord[]
}

export function ReviewsClient({ initialReviews }: ReviewsClientProps) {
  const [reviews, setReviews] = useState<ReviewRecord[]>(initialReviews)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [minRating, setMinRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low'>('newest')
  const [searchQuery, setSearchQuery] = useState<string>('')
  
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  // Modal Confirmation State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => void
    variant?: 'destructive' | 'default'
    confirmText?: string
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  })

  // Metrics
  const totalCount = reviews.length
  const pendingCount = reviews.filter((r) => r.status.toLowerCase() === 'pending').length
  const avgRating =
    totalCount > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1)
      : '0.0'

  // Filtered & Sorted Reviews
  const filteredReviews = reviews
    .filter((r) => {
      const matchesStatus =
        selectedStatus === 'all' || r.status.toLowerCase() === selectedStatus.toLowerCase()
      const matchesRating = minRating === 0 || r.rating >= minRating
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        r.customer.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        r.product.toLowerCase().includes(q)

      return matchesStatus && matchesRating && matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime()
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime()
      if (sortBy === 'rating_high') return b.rating - a.rating
      if (sortBy === 'rating_low') return a.rating - b.rating
      return 0
    })

  const activeFilterCount =
    (selectedStatus !== 'all' ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (sortBy !== 'newest' ? 1 : 0)

  const isAllSelected =
    filteredReviews.length > 0 &&
    filteredReviews.every((r) => selectedIds.includes(r.id))

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredReviews.map((r) => r.id))
    }
  }

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const resetFilters = () => {
    setSelectedStatus('all')
    setMinRating(0)
    setSortBy('newest')
  }

  const handleSingleStatusUpdate = (reviewId: string, newStatus: string) => {
    startTransition(async () => {
      try {
        await updateReviewStatusAction(reviewId, newStatus)
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
        )
        toast(`Review marked as ${newStatus}.`, 'success')
      } catch (err: any) {
        toast('Failed to update review status.', 'error')
      }
    })
  }

  const promptSingleDelete = (reviewId: string, customer: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Customer Review',
      description: `Are you sure you want to delete the review by "${customer}"? This action cannot be undone.`,
      confirmText: 'Delete Review',
      variant: 'destructive',
      onConfirm: () => {
        startTransition(async () => {
          try {
            await bulkDeleteReviewsAction([reviewId])
            setReviews((prev) => prev.filter((r) => r.id !== reviewId))
            toast('Review deleted successfully.', 'success')
            setConfirmConfig((prev) => ({ ...prev, isOpen: false }))
          } catch (err: any) {
            toast('Failed to delete review.', 'error')
          }
        })
      },
    })
  }

  const promptBulkDelete = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Selected Reviews',
      description: `Are you sure you want to delete ${selectedIds.length} selected review(s)? This action cannot be undone.`,
      confirmText: 'Delete Reviews',
      variant: 'destructive',
      onConfirm: () => {
        startTransition(async () => {
          try {
            await bulkDeleteReviewsAction(selectedIds)
            setReviews((prev) => prev.filter((r) => !selectedIds.includes(r.id)))
            toast(`${selectedIds.length} review(s) deleted.`, 'success')
            setSelectedIds([])
            setConfirmConfig((prev) => ({ ...prev, isOpen: false }))
          } catch (err: any) {
            toast('Failed to delete selected reviews.', 'error')
          }
        })
      },
    })
  }

  const promptBulkStatus = (status: string) => {
    setConfirmConfig({
      isOpen: true,
      title: `Set Status to ${status.toUpperCase()}`,
      description: `Change moderation status to "${status}" for ${selectedIds.length} selected review(s)?`,
      confirmText: `Set ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      variant: 'default',
      onConfirm: () => {
        startTransition(async () => {
          try {
            await bulkUpdateReviewsStatusAction(selectedIds, status)
            setReviews((prev) =>
              prev.map((r) => (selectedIds.includes(r.id) ? { ...r, status } : r))
            )
            toast(`Status updated to ${status} for ${selectedIds.length} review(s).`, 'success')
            setSelectedIds([])
            setConfirmConfig((prev) => ({ ...prev, isOpen: false }))
          } catch (err: any) {
            toast('Failed to update review status.', 'error')
          }
        })
      },
    })
  }

  return (
    <div className='flex flex-col gap-6 font-sans'>
      {/* Metrics Header Cards */}
      <div className='grid gap-6 sm:grid-cols-3'>
        <AdminPlaceholderCard
          title='Total Reviews'
          value={String(totalCount)}
          icon={MessageSquare}
        />
        <AdminPlaceholderCard
          title='Average Rating'
          value={`${avgRating} / 5`}
          icon={Star}
        />
        <AdminPlaceholderCard
          title='Pending Moderation'
          value={String(pendingCount)}
          icon={CheckCircle}
        />
      </div>

      {/* Search & Sheet Filter Controls */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-1'>
        <div className='flex items-center gap-3 flex-1 max-w-md'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
            <input
              type='text'
              placeholder='Search customer, product, or comment...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full h-10 pl-9 pr-4 text-xs bg-white border border-border rounded-md outline-none focus:border-gold'
            />
          </div>

          {/* Sheet Filter Drawer Trigger Button */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='h-10 px-3.5 gap-2 border-border bg-white hover:bg-neutral-100 text-xs font-semibold shrink-0 cursor-pointer relative'
              >
                <SlidersHorizontal className='size-4 text-gold' />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className='size-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center ml-0.5'>
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>

            {/* Sheet Filter Drawer Content */}
            <SheetContent side='right' showCloseButton className='p-0 bg-white text-black max-w-md w-full font-sans flex flex-col justify-between'>
              <SheetHeader className='p-6 border-b border-border space-y-1 text-left'>
                <div className='flex items-center gap-2 text-gold'>
                  <Filter className='size-5' />
                  <SheetTitle className='text-lg font-bold text-foreground font-sans'>
                    Filter Reviews
                  </SheetTitle>
                </div>
                <SheetDescription className='text-xs text-muted-foreground font-sans'>
                  Filter feedback records by moderation status, minimum star rating, and sort order.
                </SheetDescription>
              </SheetHeader>

              <div className='p-6 space-y-6 flex-1 overflow-y-auto text-xs'>
                {/* Moderation Status Section */}
                <div className='space-y-3'>
                  <label className='font-bold uppercase text-muted-foreground text-[11px] block'>
                    Moderation Status
                  </label>
                  <div className='flex flex-wrap gap-2'>
                    {['all', 'approved', 'pending', 'rejected'].map((st) => (
                      <button
                        key={st}
                        type='button'
                        onClick={() => setSelectedStatus(st)}
                        className={`px-3.5 py-2 rounded-md border text-xs font-medium transition-colors cursor-pointer capitalize ${
                          selectedStatus === st
                            ? 'bg-black text-white border-black'
                            : 'bg-neutral-50 text-neutral-700 border-border hover:bg-neutral-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating Filter Section */}
                <div className='space-y-3 pt-4 border-t border-border'>
                  <label className='font-bold uppercase text-muted-foreground text-[11px] block'>
                    Minimum Star Rating
                  </label>
                  <div className='flex flex-wrap gap-2'>
                    {[
                      { value: 0, label: 'All Ratings' },
                      { value: 5, label: '5 Stars Only' },
                      { value: 4, label: '4 Stars & above' },
                      { value: 3, label: '3 Stars & above' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type='button'
                        onClick={() => setMinRating(opt.value)}
                        className={`px-3.5 py-2 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                          minRating === opt.value
                            ? 'bg-black text-white border-black'
                            : 'bg-neutral-50 text-neutral-700 border-border hover:bg-neutral-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Order Section */}
                <div className='space-y-3 pt-4 border-t border-border'>
                  <label className='font-bold uppercase text-muted-foreground text-[11px] block'>
                    Sort Reviews By
                  </label>
                  <div className='grid grid-cols-2 gap-2'>
                    {[
                      { key: 'newest', label: 'Newest First' },
                      { key: 'oldest', label: 'Oldest First' },
                      { key: 'rating_high', label: 'Highest Rating' },
                      { key: 'rating_low', label: 'Lowest Rating' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type='button'
                        onClick={() => setSortBy(opt.key as any)}
                        className={`p-2.5 rounded-md border text-xs font-medium text-center transition-colors cursor-pointer ${
                          sortBy === opt.key
                            ? 'bg-black text-white border-black'
                            : 'bg-neutral-50 text-neutral-700 border-border hover:bg-neutral-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sheet Footer Actions */}
              <SheetFooter className='p-6 border-t border-border flex flex-row items-center justify-between gap-3 bg-neutral-50'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={resetFilters}
                  className='h-10 px-4 text-xs font-semibold gap-1.5 border-border bg-white cursor-pointer'
                >
                  <RotateCcw className='size-3.5 text-muted-foreground' />
                  Reset Filters
                </Button>

                <SheetClose asChild>
                  <Button
                    type='button'
                    size='sm'
                    className='h-10 px-6 bg-black text-white hover:bg-gold hover:text-black text-xs font-semibold cursor-pointer'
                  >
                    Apply Filters
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onDelete={promptBulkDelete}
      >
        <Button
          type='button'
          size='xs'
          variant='outline'
          disabled={isPending}
          onClick={() => promptBulkStatus('Approved')}
          className='h-8 border-border text-foreground bg-white hover:bg-neutral-100 text-xs font-semibold cursor-pointer'
        >
          {isPending && <Spinner className='size-3 mr-1' />}
          Approve Selected
        </Button>

        <Button
          type='button'
          size='xs'
          variant='outline'
          disabled={isPending}
          onClick={() => promptBulkStatus('Rejected')}
          className='h-8 border-border text-foreground bg-white hover:bg-neutral-100 text-xs font-semibold cursor-pointer'
        >
          {isPending && <Spinner className='size-3 mr-1' />}
          Reject Selected
        </Button>
      </BulkActionsBar>

      {/* Customer Reviews Table */}
      <AdminPlaceholderCard
        title='Customer Feedback & Moderation'
        description={`Displaying ${filteredReviews.length} review(s)`}
      >
        {filteredReviews.length === 0 ? (
          <p className='text-xs text-muted-foreground py-8 text-center'>
            No reviews found matching your search or filters.
          </p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse text-left text-sm'>
              <thead>
                {/* STRICT RULE: only font-semibold on table header texts */}
                <tr className='border-b border-border font-semibold text-muted-foreground text-xs uppercase'>
                  <th className='p-3 w-10 text-center font-semibold'>
                    <input
                      type='checkbox'
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className='size-4 rounded border-border cursor-pointer accent-black'
                    />
                  </th>
                  <th className='px-4 py-3 font-semibold'>Customer</th>
                  <th className='px-4 py-3 font-semibold'>Rating</th>
                  <th className='px-4 py-3 font-semibold'>Feedback</th>
                  <th className='px-4 py-3 font-semibold'>Associated Item</th>
                  <th className='px-4 py-3 text-center font-semibold'>Status</th>
                  <th className='px-4 py-3 text-right font-semibold'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border'>
                {filteredReviews.map((review) => {
                  const isSelected = selectedIds.includes(review.id)
                  return (
                    <tr
                      key={review.id}
                      className={`transition-colors ${isSelected ? 'bg-muted/60' : 'hover:bg-muted/30'}`}
                    >
                      <td className='p-3 text-center'>
                        <input
                          type='checkbox'
                          checked={isSelected}
                          onChange={() => toggleSelectRow(review.id)}
                          className='size-4 rounded border-border cursor-pointer accent-black'
                        />
                      </td>
                      <td className='px-4 py-4 font-medium text-foreground text-sm'>
                        {review.customer}
                      </td>
                      <td className='px-4 py-4'>
                        <div className='flex items-center gap-0.5 text-amber-500'>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`size-3.5 fill-current ${
                                i < review.rating ? 'opacity-100' : 'opacity-20'
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className='px-4 py-4 text-muted-foreground max-w-xs text-xs'>
                        <p className='line-clamp-2 leading-relaxed'>
                          &ldquo;{review.comment}&rdquo;
                        </p>
                        <span className='text-3xs block text-muted-foreground/70 mt-1'>
                          {review.date}
                        </span>
                      </td>
                      <td className='px-4 py-4 text-foreground font-medium text-xs'>
                        {review.product}
                      </td>
                      <td className='px-4 py-4 text-center'>
                        {/* STRICT RULE: use StatusBadge component */}
                        <StatusBadge status={review.status} />
                      </td>
                      <td className='px-4 py-4 text-right'>
                        {/* STRICT RULE: Actions section is DropdownMenu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon-xs'
                              className='size-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer rounded-md'
                              title='Review Actions'
                            >
                              <MoreHorizontal className='size-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end' className='w-40 bg-white text-black border border-border shadow-md rounded-md p-1 font-sans text-xs'>
                            <DropdownMenuItem
                              onClick={() => handleSingleStatusUpdate(review.id, 'Approved')}
                              className='flex items-center gap-2 px-2.5 py-2 hover:bg-neutral-100 rounded cursor-pointer text-xs font-medium text-emerald-700'
                            >
                              <Check className='size-3.5 text-emerald-600' />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSingleStatusUpdate(review.id, 'Rejected')}
                              className='flex items-center gap-2 px-2.5 py-2 hover:bg-neutral-100 rounded cursor-pointer text-xs font-medium text-amber-700'
                            >
                              <X className='size-3.5 text-amber-600' />
                              Reject
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className='my-1 border-t border-border' />
                            <DropdownMenuItem
                              variant='destructive'
                              onClick={() => promptSingleDelete(review.id, review.customer)}
                              className='flex items-center gap-2 px-2.5 py-2 hover:bg-rose-50 rounded cursor-pointer text-xs font-medium text-rose-600'
                            >
                              <Trash2 className='size-3.5 text-rose-600' />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminPlaceholderCard>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onOpenChange={(open) => setConfirmConfig((prev) => ({ ...prev, isOpen: open }))}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
        isPending={isPending}
        onConfirm={confirmConfig.onConfirm}
      />
    </div>
  )
}
