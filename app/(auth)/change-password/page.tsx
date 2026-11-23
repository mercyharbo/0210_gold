'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PasswordInput } from '@/components/auth/password-input'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ConfirmationCodeInput } from '@/components/auth/confirmation-code-input'
import { Spinner } from '@/components/ui/spinner'
import { useApiRequest } from '@/hooks/use-api-request'
import { useToast } from '@/stores/hooks/use-toast'
import { ApiError } from '@/lib/api/client'
import type { PasswordResetConfirmPayload, PasswordResetResponse } from '@/types/authentication'

// Confirm password is validated locally; it is not sent to FastAPI.
const schema = z.object({
  email: z.email('Enter a valid email address.'),
  code: z.string().regex(/^\d{6}$/, 'Enter the six-digit code from your email.'),
  password: z.string().min(8, 'Use at least eight characters.').max(128, 'Use no more than 128 characters.'),
  confirmPassword: z.string().min(1, 'Confirm your new password.'),
}).refine((values) => values.password === values.confirmPassword, {
  path: ['confirmPassword'], message: 'Passwords do not match.',
})
type FormValues = z.infer<typeof schema>

export default function ChangePasswordPage() {
  const { toast } = useToast()
  const [completed, setCompleted] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', code: '', password: '', confirmPassword: '' },
  })
  const { register, setError, formState: { errors, isSubmitting } } = form
  // The shared hook supplies cookies and CSRF, and owns request loading/errors.
  const passwordRequest = useApiRequest<PasswordResetResponse, PasswordResetConfirmPayload>()
  const busy = isSubmitting || passwordRequest.loading

  async function onSubmit(values: FormValues) {
    try {
      const payload = { email: values.email, code: values.code, password: values.password }
      const response = await passwordRequest.execute('post', '/auth/password-reset/confirm', payload)
      if (response.success && response.data?.accepted && response.data.next_action === 'sign_in') {
        toast(response.message || 'Your password has been changed. Sign in with your new password.', 'success')
        setCompleted(true)
        // Clear sensitive fields only after FastAPI confirms the change.
        form.reset()
      } else {
        toast(response.message || 'The password change could not be confirmed. Try again.', 'failure')
      }
    } catch (error: unknown) {
      // Keep input on failure and show backend field errors beside the relevant input.
      if (error instanceof ApiError && error.fieldErrors) {
        const fields = ['email', 'code', 'password'] as const
        for (const name of fields) {
          const message = error.fieldErrors[name]?.[0]
          if (message) setError(name, { message })
        }
        const firstInvalid = fields.find((name) => error.fieldErrors?.[name]?.length)
        if (firstInvalid) form.setFocus(firstInvalid)
      }
      toast(error instanceof Error ? error.message : 'Unable to change your password. Try again.', 'failure')
    }
  }

  return (
    <div className='flex flex-col gap-8'>
      <div className='space-y-2'>
        <h1 className='account-title'>Choose a new password</h1>
        <p className='text-sm text-muted-foreground'>Enter your email, the code from your reset email and a new password.</p>
      </div>
      {completed ? (
        <div className='space-y-5'>
          <p className='text-sm text-muted-foreground'>Sign in with your new password to continue.</p>
          <Button asChild className='w-full'><Link href='/login'>Sign in</Link></Button>
        </div>
      ) : (
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor='reset-email'>Email address</FieldLabel>
              <Input
                id='reset-email' type='email' autoComplete='email' placeholder='you@example.com'
                readOnly={busy} aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'reset-email-error' : undefined}
                {...register('email')}
              />
              <FieldError id='reset-email-error' errors={[errors.email]} />
            </Field>
            <Field data-invalid={!!errors.code}>
              <FieldLabel htmlFor='reset-code'>Confirmation code</FieldLabel>
              <Controller
                name='code' control={form.control}
                render={({ field, fieldState }) => (
                  <ConfirmationCodeInput
                    {...field} id='reset-code' disabled={busy}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.invalid ? 'reset-code-error' : undefined}
                  />
                )}
              />
              <FieldError id='reset-code-error' errors={[errors.code]} />
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor='reset-password'>New password</FieldLabel>
              <PasswordInput
                id='reset-password' autoComplete='new-password' placeholder='Enter new password'
                readOnly={busy} disabled={busy} aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'reset-password-error' : undefined}
                {...register('password')}
              />
              <FieldError id='reset-password-error' errors={[errors.password]} />
            </Field>
            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor='reset-confirm-password'>Confirm password</FieldLabel>
              <PasswordInput
                id='reset-confirm-password' autoComplete='new-password' placeholder='Confirm new password'
                readOnly={busy} disabled={busy} aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'reset-confirm-error' : undefined}
                {...register('confirmPassword')}
              />
              <FieldError id='reset-confirm-error' errors={[errors.confirmPassword]} />
            </Field>
          </FieldGroup>
          <Button type='submit' disabled={busy} aria-busy={busy} className='w-full'>
            {busy ? <><Spinner /> Changing password...</> : 'Change password'}
          </Button>
        </form>
      )}
      <div className='flex flex-col gap-3 border-t border-black/10 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between'>
        <Link href='/forgot-password' className='font-semibold text-black underline underline-offset-4'>Request another code</Link>
        <Link href='/login' className='font-semibold text-black underline underline-offset-4'>Back to login</Link>
      </div>
    </div>
  )
}
