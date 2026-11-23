'use client'

import { PasswordInput } from '@/components/auth/password-input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useApiRequest } from '@/hooks/use-api-request'
import { ApiError } from '@/lib/api/client'
import type {
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
import { z } from 'zod'

// Validate before submitting; do not trim passwords or change their characters.
const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter your name.')
    .max(255, 'Use no more than 255 characters.'),
  email: z
    .email('Enter a valid email address.')
    .max(320, 'Email address is too long.'),
  password: z
    .string()
    .min(8, 'Use at least eight characters.')
    .max(128, 'Use no more than 128 characters.')
    .regex(/[A-Z]/, 'Include an uppercase letter.')
    .regex(/[a-z]/, 'Include a lowercase letter.')
    .regex(/[0-9]/, 'Include a number.')
    .regex(/[^A-Za-z0-9\s]/, 'Include a special character.'),
})

export default function SignupPage() {
  const router = useRouter()
  // Retain only the email after account creation so a failed email request cannot repeat signup.
  const [createdEmail, setCreatedEmail] = useState<string | null>(null)
  const form = useForm<SignupPayload>({
    resolver: zodResolver(schema),
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
  const busy = isSubmitting || signupRequest.loading || codeRequest.loading

  async function onSubmit(values: SignupPayload) {
    if (createdEmail) return
    form.clearErrors('root')
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
        setError('root', {
          message:
            response.message ||
            'Account creation could not be confirmed. Try again.',
        })
        return
      }
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
      setError('root', {
        message:
          error instanceof Error
            ? error.message
            : 'Unable to create your account. Try again.',
      })
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
        setError('root', {
          message:
            response.message ||
            'The verification-code request could not be confirmed.',
        })
        return
      }
      router.push(`/verify-email?email=${encodeURIComponent(values.email)}`)
    } catch (error: unknown) {
      setError('root', {
        message:
          error instanceof Error
            ? error.message
            : 'Unable to request your verification code.',
      })
    }
  }

  return (
    <div className='flex flex-col gap-8'>
      <div className='space-y-2'>
        <p className='text-xs font-semibold text-gold'>New customer</p>
        <h2 className='text-3xl font-semibold'>Signup details</h2>
      </div>

      {createdEmail ? (
        <div className='space-y-5'>
          <Alert
            role='status'
            aria-live='polite'
            className='border-green-200 bg-green-50 text-green-900'
          >
            <AlertTitle>Account created</AlertTitle>
            <AlertDescription className='text-green-800'>
              {busy
                ? 'Requesting your email verification code...'
                : 'Continue to email verification to request another code. You do not need to sign up again.'}
            </AlertDescription>
          </Alert>
          <FieldError role='alert' errors={[errors.root]} />
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
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor='signup-name'>Name</FieldLabel>
              <Input
                id='signup-name'
                autoComplete='name'
                placeholder='Your full name'
                readOnly={busy}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'signup-name-error' : undefined}
                {...register('name')}
              />
              <FieldError id='signup-name-error' errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor='signup-email'>Email address</FieldLabel>
              <Input
                id='signup-email'
                type='email'
                autoComplete='email'
                placeholder='you@example.com'
                readOnly={busy}
                aria-invalid={!!errors.email}
                aria-describedby={
                  errors.email ? 'signup-email-error' : undefined
                }
                {...register('email')}
              />
              <FieldError id='signup-email-error' errors={[errors.email]} />
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor='signup-password'>Password</FieldLabel>
              <PasswordInput
                id='signup-password'
                autoComplete='new-password'
                placeholder='Create a password'
                disabled={busy}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password
                    ? 'signup-password-help signup-password-error'
                    : 'signup-password-help'
                }
                {...register('password')}
              />
              <FieldDescription id='signup-password-help'>
                Use 8–128 characters, including uppercase and lowercase letters,
                a number and a special character.
              </FieldDescription>
              <FieldError
                id='signup-password-error'
                errors={[errors.password]}
              />
            </Field>
          </FieldGroup>
          <FieldError role='alert' errors={[errors.root]} />
          <Button
            type='submit'
            disabled={busy}
            aria-busy={busy}
            className='w-full'
          >
            {busy ? (
              <>
                <Spinner /> Creating account...
              </>
            ) : (
              'Create account'
            )}
          </Button>
        </form>
      )}
      <div className='flex flex-col gap-3 border-t border-black/10 pt-6 text-sm text-muted-foreground'>
        <p>
          Prefer Google?{' '}
          <Link
            href='/login'
            className='font-semibold text-black underline underline-offset-4'
          >
            Continue on the login page
          </Link>
        </p>
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
