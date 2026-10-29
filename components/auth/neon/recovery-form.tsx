'use client'

import Link from 'next/link'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { neonAuthClient } from '@/lib/auth/neon-client'
import { AuthField } from './auth-field'
import { AuthFeedback } from './auth-feedback'

const schema = z.object({
  email: z.email('Enter a valid email address.'),
  otp: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
})

export function RecoveryForm({ reset = false }: { reset?: boolean }) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', otp: '', password: '', confirmPassword: '' },
  })
  const submit = form.handleSubmit(async (values) => {
    if (reset && !values.otp.trim()) {
      form.setError(
        'otp',
        { message: 'Enter your reset code.' },
        { shouldFocus: true },
      )
      return
    }
    if (reset && values.password.length < 8) {
      form.setError(
        'password',
        { message: 'Use at least 8 characters.' },
        { shouldFocus: true },
      )
      return
    }
    if (reset && values.password !== values.confirmPassword) {
      form.setError(
        'confirmPassword',
        { message: 'Passwords do not match.' },
        { shouldFocus: true },
      )
      return
    }
    try {
      // Email OTP supports shared SMTP without requiring a custom email link sender.
      const { error } = reset
        ? await neonAuthClient.emailOtp.resetPassword({
            email: values.email,
            otp: values.otp,
            password: values.password,
          })
        : await neonAuthClient.emailOtp.sendVerificationOtp({
            email: values.email,
            type: 'forget-password',
          })
      if (error) {
        form.setError('root', { message: error.message })
        return
      }
      form.reset({ ...values, otp: '', password: '', confirmPassword: '' })
      form.setError('root.success', {
        message: reset
          ? 'Password changed. You can now sign in.'
          : 'If this account exists, a reset code has been sent.',
      })
    } catch {
      form.setError('root', { message: 'Unable to connect. Try again.' })
    }
  })
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-3xl font-semibold">
        {reset ? 'Choose a new password' : 'Reset your password'}
      </h2>
      <FormProvider {...form}>
        <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
          <FieldGroup>
            <AuthField
              name="email"
              label="Email address"
              type="email"
              autoComplete="email"
            />
            {reset && (
              <>
                <AuthField
                  name="otp"
                  label="Reset code"
                  autoComplete="one-time-code"
                />
                <AuthField
                  name="password"
                  label="New password"
                  type="password"
                  autoComplete="new-password"
                />
                <AuthField
                  name="confirmPassword"
                  label="Confirm password"
                  type="password"
                  autoComplete="new-password"
                />
              </>
            )}
          </FieldGroup>
          <AuthFeedback message={form.formState.errors.root?.message} error />
          <AuthFeedback
            message={form.formState.errors.root?.success?.message}
          />
          <Button disabled={form.formState.isSubmitting}>
            {reset ? 'Change password' : 'Send reset code'}
          </Button>
        </form>
      </FormProvider>
      {!reset && (
        <Link
          className="text-sm underline underline-offset-4"
          href="/change-password"
        >
          I have a reset code
        </Link>
      )}
      <Link className="text-sm underline underline-offset-4" href="/login">
        Back to sign in
      </Link>
    </div>
  )
}
