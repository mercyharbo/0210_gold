'use client'

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
import { useToast } from '@/stores/hooks/use-toast'
import type {
  PasswordResetRequestPayload,
  PasswordResetResponse,
} from '@/types/authentication'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Validate the email before sending a request; FastAPI also validates the payload.
const schema = z.object({
  email: z.email('Enter a valid email address.'),
})

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  // The resolver connects Zod validation to inline field errors and focus handling.
  const form = useForm<PasswordResetRequestPayload>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const {
    register,
    setError,
    formState: { errors, isSubmitting },
  } = form

  // Generics describe response.data first, then the payload accepted by execute.
  // This hook owns request loading/errors and attaches CSRF automatically.
  const passwordRequest = useApiRequest<
    PasswordResetResponse,
    PasswordResetRequestPayload
  >()
  // Cover form submission and network work so inputs/buttons stay locked while pending.
  const busy = isSubmitting || passwordRequest.loading

  async function onSubmit(data: PasswordResetRequestPayload) {
    // Clear previous feedback without clearing the email if the next request fails.
    try {
      // The shared transport adds /api; Next.js forwards this request to FastAPI.
      const response = await passwordRequest.execute(
        'post',
        '/auth/password-reset/request',
        data,
      )

      if (response.success && response.data?.accepted) {
        // Accepted does not reveal whether the email has an account.
        // Prefer server feedback; this endpoint currently needs a success-message fallback.
        toast(
          response.message ||
            'If an account exists for this email, check your inbox and spam folder for a password-reset code.',
          'success',
        )
        // This flow chooses its next page locally; next_action is not required.
        router.push('/change-password')
      } else {
        // Guard against an unexpected response that did not confirm acceptance.
        toast(response.message || 'The password-reset request could not be confirmed. Try again.', 'failure')
      }
    } catch (error: unknown) {
      if (error instanceof ApiError && error.fieldErrors?.email?.[0]) {
        setError('email', { message: error.fieldErrors.email[0] }, { shouldFocus: true })
      }
      toast(error instanceof Error ? error.message : 'Unable to request a password-reset code. Try again.', 'failure')
    }
  }

  return (
    <div className='flex flex-col gap-8'>
      <div className='space-y-2'>
        <h1 className='account-title'>Forgot your password?</h1>
        <p className='text-sm text-muted-foreground'>Enter your account email to request a password-reset code. Check your inbox and spam folder, then use the code to set a new password.</p>
      </div>

      {/* handleSubmit validates first, then passes the typed values to onSubmit. */}
      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-5'
      >
        <FieldGroup>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor='forgot-password-email'>
              Email address
            </FieldLabel>
            <Input
              id='forgot-password-email'
              type='email'
              autoComplete='email'
              placeholder='you@example.com'
              aria-invalid={!!errors.email}
              aria-describedby={
                errors.email ? 'forgot-password-email-error' : undefined
              }
              readOnly={busy}
              {...register('email')}
            />
            {errors.email && (
              <FieldError
                id='forgot-password-email-error'
                errors={[errors.email]}
              />
            )}
          </Field>
        </FieldGroup>

        <Button
          type='submit'
          disabled={busy}
          aria-busy={busy}
          className='w-full'
        >
          {busy ? (
            <div className='flex items-center gap-2'>
              <Spinner /> Sending reset code...
            </div>
          ) : (
            'Send reset code'
          )}
        </Button>
      </form>

      <div className='flex flex-col gap-3 border-t border-black/10 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between'>
        <span>Remember your password?</span>
        <Link
          href='/login'
          className='font-semibold text-black underline underline-offset-4'
        >
          Back to login
        </Link>
      </div>
    </div>
  )
}
