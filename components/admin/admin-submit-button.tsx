'use client'

import { Save } from 'lucide-react'
import { useFormStatus } from 'react-dom'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

type AdminSubmitButtonProps = {
  idleLabel: string
  loadingLabel: string
}

export function AdminSubmitButton({
  idleLabel,
  loadingLabel,
}: AdminSubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} aria-busy={pending}>
      {pending ? (
        <Spinner className="size-4" />
      ) : (
        <Save className="size-4" />
      )}
      {pending ? loadingLabel : idleLabel}
    </Button>
  )
}
