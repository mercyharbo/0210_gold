'use client'

import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { neonAuthClient } from '@/lib/auth/neon-client'
import { AuthFeedback } from './auth-feedback'

export function GoogleSignIn() {
  const {
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = useForm()
  const submit = handleSubmit(async () => {
    try {
      // SDK exception: OAuth needs Neon's redirect and session-verifier protocol.
      const { error } = await neonAuthClient.signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/auth/preview/account`,
        errorCallbackURL: `${window.location.origin}/login?error=Google%20sign-in%20was%20not%20completed`,
      })
      if (error)
        setError('root', { message: error.message || 'Google sign-in failed.' })
    } catch {
      setError('root', {
        message: 'Google sign-in could not connect. Try again.',
      })
    }
  })
  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Button type="submit" variant="outline" disabled={isSubmitting}>
        {isSubmitting ? 'Connecting to Google…' : 'Continue with Google'}
      </Button>
      <AuthFeedback message={errors.root?.message} error />
    </form>
  )
}
