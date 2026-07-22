'use client'

import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'

type ConfirmDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'destructive' | 'default'
  isPending?: boolean
  onConfirm: () => void
}

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm Action',
  cancelText = 'Cancel',
  variant = 'destructive',
  isPending = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='bg-white text-black font-sans max-w-sm sm:max-w-md p-6 space-y-4 rounded-lg border border-border shadow-xl'>
        <DialogHeader className='space-y-2 text-left'>
          <div className='flex items-center gap-2.5'>
            {variant === 'destructive' ? (
              <div className='size-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0'>
                <AlertTriangle className='size-5' />
              </div>
            ) : (
              <div className='size-9 rounded-full bg-neutral-100 text-black flex items-center justify-center shrink-0 font-bold'>
                ?
              </div>
            )}
            <DialogTitle className='text-base font-bold text-foreground font-sans'>
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className='text-xs text-muted-foreground leading-relaxed font-sans'>
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className='flex flex-row justify-end gap-2 pt-2 border-t border-border bg-neutral-50 -mx-6 -mb-6 p-4 rounded-b-lg'>
          <DialogClose asChild>
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={isPending}
              className='h-9 text-xs font-medium border-border bg-white hover:bg-neutral-100 cursor-pointer'
            >
              {cancelText}
            </Button>
          </DialogClose>

          <Button
            type='button'
            size='sm'
            variant={variant}
            disabled={isPending}
            onClick={() => {
              onConfirm()
            }}
            className='h-9 text-xs font-semibold px-4 cursor-pointer gap-1.5'
          >
            {isPending && <Spinner className='size-3' />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
