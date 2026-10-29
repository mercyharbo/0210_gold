'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { neonAuthClient } from '@/lib/auth/neon-client'
import { AuthFeedback } from './auth-feedback'

export function AuthComplete() {
  const router = useRouter()
  const {
    setError,
    formState: { errors },
  } = useForm()
  useEffect(() => {
    // Initializing the official client completes the popup broadcast protocol.
    if (window.opener) return
    let active = true
    neonAuthClient
      .getSession()
      .then(({ data, error }) => {
        if (!active) return
        if (error || !data?.user) {
          setError('root', {
            message: error?.message || 'Sign-in was not completed. Try again.',
          })
          return
        }
        router.replace('/auth/preview/account')
        router.refresh()
      })
      .catch(() => {
        if (active)
          setError('root', {
            message: 'Unable to complete sign-in. Try again.',
          })
      })
    return () => {
      active = false
    }
  }, [router, setError])
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">Completing sign-in</h2>
      <AuthFeedback
        message={
          errors.root?.message || 'Please wait while your session is restored.'
        }
        error={Boolean(errors.root)}
      />
      <Link className="text-sm underline underline-offset-4" href="/login">
        Return to sign in
      </Link>
    </div>
  )
}
