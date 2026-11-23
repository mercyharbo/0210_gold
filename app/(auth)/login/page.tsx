'use client'

import { PasswordInput } from '@/components/auth/password-input'
import { GoogleButton } from '@/components/auth/google-button'
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
import { useToast } from '@/stores/hooks/use-toast'
import { ApiError } from '@/lib/api/client'
import { resetSessionUi } from '@/lib/auth/client-session'
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
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { loginSchema } from '@/lib/validations/authentication'

export default function LoginPage() {
  const { toast } = useToast()
  const [redirecting, setRedirecting] = useState(false)
  const form = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const passwordRequest = useApiRequest<AuthSession, LoginPayload>()
  const googleRequest = useApiRequest<GoogleAuthorization>()
  const submitting = useRef(false)

  const {
    register,
    setError,
    formState: { errors, isSubmitting },
  } = form

  const busy = redirecting || isSubmitting || googleRequest.loading

  async function submit(values: LoginPayload) {
    if (submitting.current || redirecting) return
    submitting.current = true
    try {
      const response = await passwordRequest.execute('post', '/auth/login', values)
      const role = verifiedSessionRole(response.data)
      if (!role) {
        toast('Your account could not be loaded. Please try again.', 'failure')
        return
      }
      setRedirecting(true)
      resetSessionUi()
      // A full navigation uses the new cookie and starts with fresh private caches.
      window.location.replace(loginDestination(role))
    } catch (error: unknown) {
      if (error instanceof ApiError && error.fieldErrors) {
        const fields = ['email', 'password'] as const
        for (const name of fields) {
          const message = error.fieldErrors[name]?.[0]
          if (message) setError(name, { message })
        }
        const firstInvalid = fields.find((name) => error.fieldErrors?.[name]?.length)
        if (firstInvalid) form.setFocus(firstInvalid)
      }
      toast(error instanceof Error ? error.message : 'Sign-in failed. Try again.', 'failure')
    } finally {
      submitting.current = false
    }
  }

  async function googleSubmit() {
    if (submitting.current || redirecting) return
    submitting.current = true
    try {
      const response = await googleRequest.execute('post', '/auth/google/start')
      if (!response.data?.authorization_url) throw new Error('Google sign-in is unavailable. Try again.')
      window.location.assign(response.data.authorization_url)
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : 'Google sign-in failed. Try again.', 'failure')
    } finally {
      submitting.current = false
    }
  }

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col gap-2'>
        <h1 className='account-title'>Sign in</h1>
        <p className='text-sm text-muted-foreground'>Welcome back. Sign in to your FM LUXE account.</p>
      </div>
      
      <div className='flex flex-col gap-5'>
        <GoogleButton onClick={googleSubmit} disabled={busy} loading={googleRequest.loading} />

        <div className='account-divider' aria-hidden='true'>Or</div>
        <form onSubmit={form.handleSubmit(submit)} className='flex flex-col gap-5' noValidate>
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
                className='rounded-none'
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


          <Button
            type='submit'
            disabled={busy}
            aria-busy={isSubmitting || redirecting}
            className='w-full'
          >
            {redirecting ? 'Redirecting...' : isSubmitting ? 'Signing in' : 'Sign in'}
            {isSubmitting || redirecting ? (
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
