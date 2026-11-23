'use client'

import { useApiRequest } from '@/hooks/use-api-request'
import { ApiError } from '@/lib/api/client'
import { useToast } from '@/stores/hooks/use-toast'
import type {
  RequestEmailVerificationPayload,
  VerifyEmailPayload,
  VerifyEmailResponse,
} from '@/types/authentication'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field'
import { ConfirmationCodeInput } from './confirmation-code-input'
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
  const { toast } = useToast()
  const busy = isSubmitting || verifyRequest.loading || resendRequest.loading

  async function onSubmit(data: VerifyEmailPayload) {
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
        toast(response.message || 'Email verified. Sign in to continue.', 'success')
        router.replace('/login')
      } else {
        toast(response.message || 'Email verification could not be confirmed. Try again.', 'failure')
      }
    } catch (error: unknown) {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const name of ['email', 'code'] as const) {
          const message = error.fieldErrors[name]?.[0]
          if (message) setError(name, { message })
        }
        const firstInvalid = (['email', 'code'] as const).find((name) => error.fieldErrors?.[name]?.length)
        if (firstInvalid) form.setFocus(firstInvalid)
      }
      toast(error instanceof Error ? error.message : 'Email verification failed. Try again.', 'failure')
    }
  }

  //   Resend code function
  async function resendCode() {
    if (busy) return
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
        toast(response.message || 'Check your inbox and spam folder for a new verification code.', 'success')
      } else {
        toast(response.message || 'The verification-code request could not be confirmed.', 'failure')
      }
    } catch (error: unknown) {
      if (error instanceof ApiError && error.fieldErrors?.email?.[0]) {
        setError('email', { message: error.fieldErrors.email[0] }, { shouldFocus: true })
      }
      toast(error instanceof Error ? error.message : 'The verification code could not be requested. Try again.', 'failure')
    }
  }

  return (
    <div className='space-y-8'>
      <header className='space-y-2'>
        <h1 className='account-title'>Verify your email</h1>
        <p className='text-sm text-muted-foreground'>
          Check your inbox and spam folder for the verification code, then enter it below. You can request another code if needed.
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
            <FieldLabel htmlFor='code'>Verification code</FieldLabel>
            <Controller
              name='code'
              control={form.control}
              render={({ field, fieldState }) => (
                <ConfirmationCodeInput
                  {...field}
                  id='code'
                  onComplete={() => {
                    if (!busy) void form.handleSubmit(onSubmit)()
                  }}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={fieldState.invalid ? 'code-error' : undefined}
                  disabled={busy}
                />
              )}
            />
            <FieldError id='code-error' errors={[errors.code]} />
          </Field>
        </FieldGroup>

        <div className='flex flex-col gap-2'>
          <Button type='submit' disabled={busy}>
            {isSubmitting ? (
              <div className='flex items-center gap-2'>
                <Spinner /> Verifying...
              </div>
            ) : (
              'Verify email'
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
              'Resend code'
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
    </div>
  )
}
