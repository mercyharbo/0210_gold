'use client'

import { useApiRequest } from '@/hooks/use-api-request'
import type {
  RequestEmailVerificationPayload,
  VerifyEmailPayload,
  VerifyEmailResponse,
} from '@/types/authentication'
import { zodResolver } from '@hookform/resolvers/zod'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Alert, AlertDescription } from '../ui/alert'
import { Button } from '../ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp'
import { Spinner } from '../ui/spinner'

const schema = z.object({
  email: z.email('Enter a valid email address.'),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the six-digit code from your email.'),
})

export default function VerifyEmailComp({ email = '' }: { email?: string }) {
  const router = useRouter()
  const form = useForm<VerifyEmailPayload>({
    resolver: zodResolver(schema),
    values: { email, code: '' },
  })

  const {
    setError,
    formState: { errors, isSubmitting },
  } = form

  const verifyRequest = useApiRequest<VerifyEmailResponse, VerifyEmailPayload>()
  const resendRequest = useApiRequest<
    VerifyEmailResponse,
    RequestEmailVerificationPayload
  >()
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const busy = isSubmitting || verifyRequest.loading || resendRequest.loading

  async function onSubmit(data: VerifyEmailPayload) {
    setResendMessage(null)
    form.clearErrors('root')
    try {
      const response = await verifyRequest.execute(
        'post',
        '/auth/email-verification/confirm',
        data,
      )
      if (
        response.success &&
        response.data?.accepted &&
        response.data.next_action === 'sign_in'
      ) {
        router.replace('/login')
      }
    } catch (error: unknown) {
      setError('root', {
        message:
          error instanceof Error
            ? error.message
            : 'Email verification failed. Try again.',
      })
    }
  }

  //   Resend code function
  async function resendCode() {
    if (busy) return
    form.clearErrors('root')
    setResendMessage(null)
    if (!(await form.trigger('email'))) return
    try {
      const payload = { email: form.getValues('email') }
      const response = await resendRequest.execute(
        'post',
        '/auth/email-verification/request',
        payload,
      )
      if (response.success && response.data?.accepted) {
        form.resetField('code')
        setResendMessage(
          'Check your inbox and spam folder for a new verification code. If it does not arrive, wait a moment before requesting another.',
        )
      }
    } catch (error: unknown) {
      setError('root', {
        message:
          error instanceof Error
            ? error.message
            : 'The verification code could not be requested. Try again.',
      })
    }
  }

  return (
    <main className='space-y-5'>
      <header className='space-y-2'>
        <h2 className='text-3xl font-semibold'>Verify your email</h2>
        <p className='text-sm text-muted-foreground'>
          Request a verification code, then enter it below.
        </p>
      </header>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className='flex flex-col gap-5'
      >
        <FieldGroup>
          <div className='flex flex-col gap-1'>
            <p className='text-sm text-muted-foreground'>Email address</p>
            <p className='break-all font-medium'>
              {email || 'No email address provided.'}
            </p>
            <FieldError errors={[errors.email]} />
          </div>

          <Field data-invalid={Boolean(errors.code)}>
            <FieldLabel htmlFor='code'>Verification Code</FieldLabel>
            <Controller
              name='code'
              control={form.control}
              render={({ field, fieldState }) => (
                <InputOTP
                  {...field}
                  id='code'
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  inputMode='numeric'
                  autoComplete='one-time-code'
                  onComplete={() => {
                    if (!busy) void form.handleSubmit(onSubmit)()
                  }}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? 'code-error' : undefined
                  }
                  disabled={busy}
                  containerClassName='grid w-full max-w-72 grid-cols-6 gap-2'
                >
                  {Array.from({ length: 6 }, (_, index) => (
                    <InputOTPGroup key={index} className='rounded-md'>
                      <InputOTPSlot
                        index={index}
                        className='aspect-square size-auto w-full rounded-md border text-base first:rounded-l-md last:rounded-r-md'
                        aria-invalid={fieldState.invalid}
                      />
                    </InputOTPGroup>
                  ))}
                </InputOTP>
              )}
            />
            <FieldError id='code-error' errors={[errors.code]} />
          </Field>
        </FieldGroup>

        <FieldError errors={[errors.root]} />

        {resendMessage && (
          <Alert
            role='status'
            aria-live='polite'
            className='bg-green-50 text-green-800'
          >
            <AlertDescription className='text-green-500 text-sm'>
              {resendMessage}
            </AlertDescription>
          </Alert>
        )}

        <div className='flex flex-col gap-2'>
          <Button type='submit' disabled={busy}>
            {isSubmitting ? (
              <div className='flex items-center gap-2'>
                <Spinner /> Verifying...
              </div>
            ) : (
              'Verify Email'
            )}
          </Button>
          <Button
            type='button'
            variant='outline'
            onClick={resendCode}
            disabled={busy}
            aria-busy={resendRequest.loading}
          >
            {resendRequest.loading ? (
              <div className='flex items-center gap-2'>
                <Spinner /> Resending…
              </div>
            ) : (
              'Resend Code'
            )}
          </Button>
          <Button
            type='button'
            variant='link'
            onClick={() => router.push('/login')}
            disabled={busy}
          >
            Back to login
          </Button>
        </div>
      </form>
    </main>
  )
}
