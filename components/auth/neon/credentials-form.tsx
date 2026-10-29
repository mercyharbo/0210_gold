'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { neonAuthClient } from '@/lib/auth/neon-client'
import { AuthField } from './auth-field'
import { AuthFeedback } from './auth-feedback'
import { GoogleSignIn } from './google-sign-in'

export function CredentialsForm({ signup = false }: { signup?: boolean }) {
  const router = useRouter()
  const schema = z.object({
    email: z.email('Enter a valid email address.'),
    password: z
      .string()
      .min(
        signup ? 8 : 1,
        signup ? 'Use at least 8 characters.' : 'Enter your password.',
      ),
    name: signup
      ? z.string().trim().min(1, 'Enter your full name.')
      : z.string(),
  })
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
  })
  const submit = form.handleSubmit(async (values) => {
    try {
      // SDK exception: the auth service owns password hashing and cookie sessions.
      const result = signup
        ? await neonAuthClient.signUp.email({
            ...values,
            callbackURL: '/auth/preview/account',
          })
        : await neonAuthClient.signIn.email({
            email: values.email,
            password: values.password,
          })
      if (result.error) {
        if (result.error.code === 'EMAIL_NOT_VERIFIED') {
          router.push(`/verify-email?email=${encodeURIComponent(values.email)}`)
          return
        }
        form.setError('root', {
          message: result.error.message || 'Unable to sign in.',
        })
        return
      }
      form.reset()
      router.push(
        signup
          ? `/verify-email?email=${encodeURIComponent(values.email)}`
          : '/auth/preview/account',
      )
      router.refresh()
    } catch {
      form.setError('root', {
        message: 'Unable to connect. Your details have been kept; try again.',
      })
    }
  })
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-semibold">
          {signup ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className="text-sm text-muted-foreground">Your FM LUXE account</p>
      </div>
      <GoogleSignIn />
      <Separator />
      <FormProvider {...form}>
        <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
          <FieldGroup>
            {signup && (
              <AuthField name="name" label="Full name" autoComplete="name" />
            )}
            <AuthField
              name="email"
              label="Email address"
              type="email"
              autoComplete="email"
            />
            <AuthField
              name="password"
              label="Password"
              type="password"
              autoComplete={signup ? 'new-password' : 'current-password'}
            />
          </FieldGroup>
          <AuthFeedback message={form.formState.errors.root?.message} error />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? 'Please wait…'
              : signup
                ? 'Create account'
                : 'Sign in'}
          </Button>
        </form>
      </FormProvider>
      <div className="flex flex-wrap gap-4 text-sm">
        <Link
          className="underline underline-offset-4"
          href={signup ? '/login' : '/signup'}
        >
          {signup ? 'Already have an account? Sign in' : 'Create an account'}
        </Link>
        <Link className="underline underline-offset-4" href="/forgot-password">
          Forgot password?
        </Link>
        <Link className="underline underline-offset-4" href="/verify-email">
          Verify email
        </Link>
      </div>
    </div>
  )
}
