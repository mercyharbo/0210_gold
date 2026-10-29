'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { neonAuthClient } from '@/lib/auth/neon-client'
import { AuthField } from './auth-field'
import { AuthFeedback } from './auth-feedback'

const schema = z.object({
  email: z.email(),
  otp: z.string().trim().min(1, 'Enter the code from your email.'),
})

export function VerificationForm({ email = '' }: { email?: string }) {
  const router = useRouter()
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email, otp: '' },
  })
  const resend = useForm()
  async function sendCode() {
    if (!(await form.trigger('email'))) return
    try {
      const { error } = await neonAuthClient.emailOtp.sendVerificationOtp({
        email: form.getValues('email'),
        type: 'email-verification',
      })
      resend.setError('root', {
        message:
          error?.message ||
          'If the account can be verified, a code has been sent.',
      })
    } catch {
      resend.setError('root', { message: 'Unable to send a code. Try again.' })
    }
  }
  const submit = form.handleSubmit(async (values) => {
    try {
      const { error } = await neonAuthClient.emailOtp.verifyEmail(values)
      if (error) {
        form.setError('root', { message: error.message })
        return
      }
      router.push(
        '/login?message=Email%20verified.%20Sign%20in%20to%20continue.',
      )
      router.refresh()
    } catch {
      form.setError('root', {
        message: 'Verification failed. Check your code and try again.',
      })
    }
  })
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-3xl font-semibold">Verify your email</h2>
      <p className="text-sm text-muted-foreground">
        Request a verification code, then enter it below.
      </p>
      <FormProvider {...form}>
        <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
          <FieldGroup>
            <AuthField
              name="email"
              label="Email address"
              type="email"
              autoComplete="email"
            />
            <AuthField
              name="otp"
              label="Verification code"
              autoComplete="one-time-code"
            />
          </FieldGroup>
          <AuthFeedback message={form.formState.errors.root?.message} error />
          <Button disabled={form.formState.isSubmitting}>Verify email</Button>
        </form>
      </FormProvider>
      <form
        onSubmit={resend.handleSubmit(sendCode)}
        className="flex flex-col gap-3"
      >
        <Button variant="outline" disabled={resend.formState.isSubmitting}>
          Send verification code
        </Button>
        <AuthFeedback message={resend.formState.errors.root?.message} />
      </form>
      <Link className="text-sm underline underline-offset-4" href="/login">
        Back to sign in
      </Link>
    </div>
  )
}
