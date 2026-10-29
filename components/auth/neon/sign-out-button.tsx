'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useSWRConfig } from 'swr'
import { Button } from '@/components/ui/button'
import { neonAuthClient } from '@/lib/auth/neon-client'
import { AuthFeedback } from './auth-feedback'

export function SignOutButton() {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const {
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm()
  const submit = handleSubmit(async () => {
    try {
      // SDK exception: logout must invalidate managed session cookies.
      const { error } = await neonAuthClient.signOut()
      if (error) {
        setError('root', { message: error.message })
        return
      }
      await mutate(() => true, undefined, { revalidate: false })
      router.replace('/login')
      router.refresh()
    } catch {
      setError('root', { message: 'Sign out could not complete. Try again.' })
    }
  })
  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Button type="submit" variant="outline" disabled={isSubmitting}>
        Sign out
      </Button>
      <AuthFeedback message={errors.root?.message} error />
    </form>
  )
}
