'use client'

import { useTransition } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { useBanner } from '@/stores/hooks/use-banner'
import { deleteHeroBannerAction } from './actions'

export function DeleteBannerDialog() {
  const { selectedBanner, isDeleteDialogOpen, closeDeleteDialog } = useBanner()
  const [isPending, startTransition] = useTransition()

  if (!selectedBanner) {
    return null
  }

  function handleConfirm() {
    const formData = new FormData()
    formData.set('bannerId', selectedBanner!.id)

    startTransition(async () => {
      await deleteHeroBannerAction(formData)
      closeDeleteDialog()
    })
  }

  return (
    <Dialog
      open={isDeleteDialogOpen}
      onOpenChange={(open) => !open && closeDeleteDialog()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Banner</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{selectedBanner.title}&rdquo;?
            This action cannot be undone and will permanently remove the banner
            image from storage.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={closeDeleteDialog}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant='destructive'
            disabled={isPending}
            onClick={handleConfirm}
            className='gap-2'
          >
            {isPending && <Spinner className='size-4' />}
            Delete Banner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
