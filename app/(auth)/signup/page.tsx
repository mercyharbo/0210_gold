'use client'

import { Button } from '@/components/ui/button'
import { GoogleButton } from '@/components/auth/google-button'
import { Spinner } from '@/components/ui/spinner'
import { useApiRequest } from '@/hooks/use-api-request'
import { useToast } from '@/stores/hooks/use-toast'
import { ApiError } from '@/lib/api/client'
import type {
  GoogleAuthorization,
  RequestEmailVerificationPayload,
  SignupPayload,
  SignupResponse,
  VerifyEmailResponse,
} from '@/types/authentication'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { signupSchema } from '@/lib/validations/authentication'
import { SignupFields } from '@/components/auth/signup-fields'

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  // Retain only the email after account creation so a failed email request cannot repeat signup.
  const [createdEmail, setCreatedEmail] = useState<string | null>(null)
  const form = useForm<SignupPayload>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
  })
  const {
    register,
    setError,
    formState: { errors, isSubmitting },
  } = form
  // Each mutation owns its loading state; both receive cookies and CSRF automatically.
  const signupRequest = useApiRequest<SignupResponse, SignupPayload>()
  const codeRequest = useApiRequest<
    VerifyEmailResponse,
    RequestEmailVerificationPayload
  >()
  const googleRequest = useApiRequest<GoogleAuthorization>()
  const busy = isSubmitting || signupRequest.loading || codeRequest.loading || googleRequest.loading

  async function onSubmit(values: SignupPayload) {
    if (createdEmail || googleRequest.loading) return
    const payload = {
      name: values.name,
      email: values.email,
      password: values.password,
    }
    try {
      const response = await signupRequest.execute(
        'post',
        '/auth/signup',
        payload,
      )
      if (
        !response.success ||
        !response.data?.accepted ||
        response.data.next_action !== 'verify_email'
      ) {
        toast(response.message || 'Account creation could not be confirmed. Try again.', 'failure')
        return
      }
      toast(response.message || 'Account created. Verify your email to continue.', 'success')
    } catch (error: unknown) {
      // Server fieldErrors belong beside the input; general failures belong to the form.
      if (error instanceof ApiError && error.fieldErrors) {
        const fields = ['name', 'email', 'password'] as const
        for (const name of fields) {
          const message = error.fieldErrors[name]?.[0]
          if (message) setError(name, { message })
        }
        const firstInvalid = fields.find(
          (name) => error.fieldErrors?.[name]?.length,
        )
        if (firstInvalid) form.setFocus(firstInvalid)
      }
      toast(error instanceof Error ? error.message : 'Unable to create your account. Try again.', 'failure')
      return
    }

    setCreatedEmail(values.email)
    form.resetField('password')

    // Signup does not send a code or sign in. Explicitly request verification next.
    try {
      const response = await codeRequest.execute(
        'post',
        '/auth/email-verification/request',
        { email: values.email },
      )
      if (!response.success || !response.data?.accepted) {
        toast(response.message || 'The verification-code request could not be confirmed.', 'failure')
        return
      }
      toast(response.message || 'Check your inbox and spam folder for your verification code.', 'info')
      router.push(`/verify-email?email=${encodeURIComponent(values.email)}`)
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : 'Unable to request your verification code.', 'failure')
    }
  }

  async function googleSubmit() {
    if (busy || createdEmail) return
    try {
      const response = await googleRequest.execute('post', '/auth/google/start')
      if (!response.data?.authorization_url) throw new Error('Google sign-in is unavailable. Try again.')
      window.location.assign(response.data.authorization_url)
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : 'Google sign-in failed. Try again.', 'failure')
    }
  }

  return (
    <div className='flex flex-col gap-8'>
      <div className='space-y-2'>
        <h1 className='account-title'>Create an account</h1>
        <p className='text-sm text-muted-foreground'>Create your FM LUXE account. Verify your email, then sign in.</p>
      </div>

      {createdEmail ? (
        <div className='space-y-5'>
          <p className='text-sm text-muted-foreground'>
            {busy ? 'Requesting your email verification code...' : 'Continue to email verification to request another code. You do not need to sign up again.'}
          </p>
          <Button asChild disabled={busy} className='w-full'>
            <Link
              href={`/verify-email?email=${encodeURIComponent(createdEmail)}`}
              aria-disabled={busy}
              tabIndex={busy ? -1 : undefined}
              onClick={(event) => {
                if (busy) event.preventDefault()
              }}
            >
              Continue to email verification
            </Link>
          </Button>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-5'
        >
          <SignupFields register={register} errors={errors} busy={busy} />
          <Button
            type='submit'
            disabled={busy}
            aria-busy={busy}
            className='w-full'
          >
            {isSubmitting || signupRequest.loading ? (
              <>
                <Spinner /> Creating account...
              </>
            ) : (
              'Create account'
            )}
          </Button>
        </form>
      )}
      {!createdEmail && (
        <div className='flex flex-col gap-5'>
          <div className='account-divider' aria-hidden='true'>Or</div>
          <GoogleButton onClick={googleSubmit} disabled={busy} loading={googleRequest.loading} />
        </div>
      )}
      <div className='flex flex-col gap-3 border-t border-black/10 pt-6 text-sm text-muted-foreground'>
        <p>
          Already have an account?{' '}
          <Link
            href='/login'
            className='font-semibold text-black underline underline-offset-4'
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
