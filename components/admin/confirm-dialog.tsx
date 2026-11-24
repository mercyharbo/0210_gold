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
  onCloseAutoFocus?: (event: Event) => void
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
  onCloseAutoFocus,
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!isPending) onOpenChange(open) }}>
      <DialogContent
        showCloseButton={!isPending}
        onCloseAutoFocus={onCloseAutoFocus}
        onEscapeKeyDown={(event) => { if (isPending) event.preventDefault() }}
        onInteractOutside={(event) => { if (isPending) event.preventDefault() }}
        className='max-w-sm gap-3 rounded-md bg-white p-5 text-black sm:max-w-md'
      >
        <DialogHeader className='gap-3 text-left'>
          <div className='flex items-center gap-2.5'>
            {variant === 'destructive' ? (
              <div className='flex size-9 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive'>
                <AlertTriangle className='size-5' />
              </div>
            ) : (
              <div className='flex size-9 shrink-0 items-center justify-center rounded-md bg-gray-100 font-bold text-black'>
                ?
              </div>
            )}
            <DialogTitle className='text-base font-bold text-foreground '>
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className='text-xs text-muted-foreground leading-relaxed'>
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className='flex flex-row justify-end gap-2 border-t-none bg-transparent'>
          <DialogClose asChild>
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={isPending}
              className='h-10 rounded-md'
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
            className='h-10 gap-2 rounded-md px-4'
          >
            {isPending && <Spinner className='size-3' />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
