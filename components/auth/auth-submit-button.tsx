'use client'

import { ArrowRight } from 'lucide-react'
import { useFormStatus } from 'react-dom'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

type AuthSubmitButtonProps = {
  idleLabel: string
  loadingLabel: string
}

export function AuthSubmitButton({
  idleLabel,
  loadingLabel,
}: AuthSubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      type='submit'
      disabled={pending}
      aria-busy={pending}
      className='h-12 w-full rounded-none bg-black px-6 text-sm font-semibold text-white hover:bg-gold disabled:cursor-not-allowed disabled:bg-black/60'
    >
      {pending ? loadingLabel : idleLabel}
      {pending ? (
        <Spinner className='size-4' />
      ) : (
        <ArrowRight className='size-4' strokeWidth={1.8} />
      )}
    </Button>
  )
}
