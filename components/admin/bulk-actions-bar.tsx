'use client'

import { CheckSquare, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'

type BulkActionsBarProps = {
  selectedCount: number
  onClearSelection: () => void
  onDelete?: () => void
  children?: React.ReactNode
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onDelete,
  children,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className='flex flex-wrap items-center justify-between gap-3 py-2 font-sans text-xs animate-in fade-in duration-150'>
      <div className='flex items-center gap-2 font-medium text-foreground'>
        <CheckSquare className='size-4 text-gold' />
        <span>
          <strong className='text-foreground font-bold'>{selectedCount}</strong> item(s) selected
        </span>
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        {children}

        {onDelete && (
          <Button
            type='button'
            size='xs'
            variant='destructive'
            onClick={onDelete}
            className='h-8 px-3 gap-1.5 text-xs font-semibold cursor-pointer rounded-md'
          >
            <Trash2 className='size-3.5' />
            Delete Selected
          </Button>
        )}

        <button
          type='button'
          onClick={onClearSelection}
          className='p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-neutral-100 cursor-pointer ml-1'
          title='Clear Selection'
        >
          <X className='size-4' />
        </button>
      </div>
    </div>
  )
}
