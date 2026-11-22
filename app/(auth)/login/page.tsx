'use client'

import { PasswordInput } from '@/components/auth/password-input'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useApiRequest } from '@/hooks/use-api-request'
import { ApiError } from '@/lib/api/client'
import { isUserScopedKey, resetSessionUi } from '@/lib/auth/client-session'
import {
  loginDestination,
  verifiedSessionRole,
} from '@/lib/auth/login-destination'
import type {
  AuthSession,
  GoogleAuthorization,
  LoginPayload,
} from '@/types/authentication'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, type FormEvent } from 'react'
import { useForm } from 'react-hook-form'
import { useSWRConfig } from 'swr'
import { z } from 'zod'

const schema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z
    .string()
    .min(1, 'Enter your password.')
    .max(1024, 'Password is too long.'),
})

export default function LoginPage() {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const form = useForm<LoginPayload>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const googleForm = useForm()
  const passwordRequest = useApiRequest<AuthSession, LoginPayload>()
  const googleRequest = useApiRequest<GoogleAuthorization>()
  const submitting = useRef(false)

  const {
    register,
    setError,
    formState: { errors, isSubmitting },
  } = form

  const busy = isSubmitting || googleForm.formState.isSubmitting

  // Handle error codes from Google sign-in redirect
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('error')
    if (code === 'google_sign_in')
      setError('root', {
        message:
          'Google sign-in was cancelled or could not finish. Please try again.',
      })
    if (code === 'service_unavailable')
      setError('root', {
        message: 'The sign-in service is unavailable. Please try again.',
      })
  }, [setError])

  // Handle error codes from email verification redirect
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true
    try {
      await form.handleSubmit(async (values) => {
        form.clearErrors('root')
        let session: AuthSession | undefined
        try {
          const response = await passwordRequest.execute(
            'post',
            '/auth/login',
            values,
          )
          session = response.data
        } catch (error: unknown) {
          const fields =
            error instanceof ApiError ? error.fieldErrors : undefined
          let focused = false
          for (const name of ['email', 'password'] as const) {
            const message = fields?.[name]?.[0]
            if (message) {
              setError(name, { message }, { shouldFocus: !focused })
              focused = true
            }
          }
          if (!focused)
            setError('root', {
              message:
                error instanceof Error
                  ? error.message
                  : 'Sign-in failed. Try again.',
            })
          return
        }
        form.reset()
        resetSessionUi()
        try {
          await mutate(isUserScopedKey, undefined, { revalidate: false })
        } catch {
          /* Login succeeded; navigation reloads private data. */
        }
        const role = verifiedSessionRole(session)
        router.replace(role ? loginDestination(role) : '/login')
        router.refresh()
      })(event)
    } finally {
      submitting.current = false
    }
  }

  async function googleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true
    try {
      await googleForm.handleSubmit(async () => {
        googleForm.clearErrors('root')
        try {
          const response = await googleRequest.execute(
            'post',
            '/auth/google/start',
          )
          if (!response.data?.authorization_url)
            throw new Error('Google sign-in is unavailable. Try again.')
          window.location.assign(response.data.authorization_url)
        } catch (error: unknown) {
          googleForm.setError('root', {
            message:
              error instanceof Error
                ? error.message
                : 'Google sign-in failed. Try again.',
          })
        }
      })(event)
    } finally {
      submitting.current = false
    }
  }

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col gap-2'>
        <p className='text-xs font-semibold uppercase text-gold'>
          Welcome back
        </p>
        <h2 className='font-sans text-4xl font-semibold'>Login details</h2>
      </div>
      <div className='flex flex-col gap-6'>
        <form onSubmit={googleSubmit} className='flex flex-col gap-3'>
          <Button
            type='submit'
            variant='outline'
            disabled={busy}
            aria-busy={googleForm.formState.isSubmitting}
          >
            {googleForm.formState.isSubmitting
              ? 'Connecting to Google…'
              : 'Continue with Google'}
          </Button>
          <FieldError errors={[googleForm.formState.errors.root]} />
        </form>
        <form onSubmit={submit} className='flex flex-col gap-5' noValidate>
          <FieldGroup className='gap-5'>
            <Field className='gap-2' data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor='login-email'>Email address</FieldLabel>
              <Input
                id='login-email'
                autoComplete='email'
                placeholder='you@example.com'
                type='email'
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? 'login-email-error' : undefined
                }
                readOnly={busy}
                {...register('email')}
              />
              <FieldError id='login-email-error' errors={[errors.email]} />
            </Field>
            <Field className='gap-2' data-invalid={Boolean(errors.password)}>
              <FieldLabel htmlFor='login-password'>Password</FieldLabel>
              <PasswordInput
                id='login-password'
                autoComplete='current-password'
                placeholder='Enter your password'
                className='rounded-md'
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? 'login-password-error' : undefined
                }
                readOnly={busy}
                {...register('password')}
              />
              <FieldError
                id='login-password-error'
                errors={[errors.password]}
              />
            </Field>
          </FieldGroup>
          <Link
            href='/forgot-password'
            className='flex justify-end text-sm font-semibold underline underline-offset-4'
          >
            Forgot password?
          </Link>
          <FieldError errors={[errors.root]} />
          <Button
            type='submit'
            disabled={busy}
            aria-busy={isSubmitting}
            className='w-full'
          >
            {isSubmitting ? 'Signing in' : 'Sign in'}
            {isSubmitting ? (
              <Spinner data-icon='inline-end' />
            ) : (
              <ArrowRight data-icon='inline-end' strokeWidth={1.8} />
            )}
          </Button>
        </form>
      </div>
      <div className='flex flex-wrap gap-4 text-sm'>
        <Link className='underline underline-offset-4' href='/signup'>
          Create an account
        </Link>
        <Link className='underline underline-offset-4' href='/forgot-password'>
          Forgot password?
        </Link>
        <Link className='underline underline-offset-4' href='/verify-email'>
          Verify email
        </Link>
      </div>
    </div>
  )
}
