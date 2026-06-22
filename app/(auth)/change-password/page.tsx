import Link from 'next/link'
import { redirect } from 'next/navigation'

import {
  AuthShell,
  authInputClassName,
  authLabelClassName,
} from '@/components/auth/auth-shell'
import { AuthSubmitButton } from '@/components/auth/auth-submit-button'
import { PasswordInput } from '@/components/auth/password-input'
import { createSupabaseServerClient } from '@/lib/supabase/server'

import { changePassword } from '../actions'

type ChangePasswordPageProps = {
  searchParams?: Promise<{
    error?: string
  }>
}

export default async function ChangePasswordPage({
  searchParams,
}: ChangePasswordPageProps) {
  const params = await searchParams
  const supabase = await createSupabaseServerClient()
  const { data: claimsData } = await supabase.auth.getClaims()

  if (!claimsData?.claims) {
    redirect(
      '/forgot-password?error=Use the reset link from your email before changing your password.',
    )
  }

  return (
    <AuthShell
      eyebrow='Account security'
      title='Change your password securely.'
      description='Update the password connected to your profile, orders, reviews, saved products, and personal shopper requests.'
      footer={
        <div className='flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between'>
          <span>Manage your customer details</span>
          <Link
            href='/profile'
            className='font-semibold text-black underline underline-offset-4'
          >
            Open profile
          </Link>
        </div>
      }
    >
      <div className='mb-8'>
        <p className='text-xs font-semibold uppercase text-gold'>
          Update password
        </p>
        <h2 className='mt-2 font-heading text-4xl font-semibold'>
          New password
        </h2>
      </div>

      {params?.error ? (
        <p className='mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700'>
          {params.error}
        </p>
      ) : null}

      <form action={changePassword} className='space-y-5'>
        <label className='block space-y-2'>
          <span className={authLabelClassName}>New password</span>
          <PasswordInput
            autoComplete='new-password'
            className={authInputClassName}
            minLength={8}
            name='password'
            placeholder='Enter new password'
            required
          />
        </label>

        <label className='block space-y-2'>
          <span className={authLabelClassName}>Confirm password</span>
          <PasswordInput
            autoComplete='new-password'
            className={authInputClassName}
            minLength={8}
            name='confirmPassword'
            placeholder='Confirm new password'
            required
          />
        </label>

        <AuthSubmitButton
          idleLabel='Change password'
          loadingLabel='Changing password'
        />
      </form>
    </AuthShell>
  )
}
