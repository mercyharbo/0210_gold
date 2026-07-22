import * as React from 'react'

import { cn } from '@/lib/utils'

type StatusBadgeProps = {
  status: string
  className?: string
}

function formatStatusText(status: string): string {
  if (!status) return ''
  return status
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getStatusStyles(status: string): string {
  const normalized = (status || '').toLowerCase()

  switch (normalized) {
    case 'delivered':
    case 'paid':
    case 'active':
    case 'completed':
    case 'published':
      return 'bg-emerald-500/10 text-emerald-700 border-emerald-300'

    case 'pending':
    case 'sourcing':
    case 'awaiting':
      return 'bg-amber-500/10 text-amber-700 border-amber-300'

    case 'shipped':
    case 'processing':
    case 'in transit':
      return 'bg-blue-500/10 text-blue-700 border-blue-300'

    case 'cancelled':
    case 'failed':
    case 'draft':
    case 'inactive':
    case 'rejected':
      return 'bg-rose-500/10 text-rose-700 border-rose-300'

    default:
      return 'bg-neutral-100 text-neutral-800 border-neutral-300'
  }
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const formattedText = formatStatusText(status)
  const colorStyles = getStatusStyles(status)

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-2.5 py-0.5 text-sm font-medium border font-sans shrink-0',
        colorStyles,
        className
      )}
    >
      {formattedText}
    </span>
  )
}
