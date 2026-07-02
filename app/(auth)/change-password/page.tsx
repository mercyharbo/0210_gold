import Link from 'next/link'
import { redirect } from 'next/navigation'

import {
  authInputClassName,
  authLabelClassName,
} from '@/components/auth/auth-form-styles'
import { AuthSubmitButton } from '@/components/auth/auth-submit-button'
import { PasswordInput } from '@/components/auth/password-input'
import { createSupabaseServerClient } from '@/lib/supabase/server'

import { changePassword } from '../actions'

export default async function ChangePasswordPage() {
  const supabase = await createSupabaseServerClient()
  const { data: claimsData } = await supabase.auth.getClaims()

  if (!claimsData?.claims) {
    redirect(
      '/forgot-password?error=Use the reset link from your email before changing your password.',
    )
  }

  return (
    <div className='flex flex-col gap-8'>
      <div className='space-y-2'>
        <p className='text-xs font-semibold uppercase text-gold'>
          Update password
        </p>
        <h2 className='font-sans text-4xl font-semibold'>
          New password
        </h2>
      </div>

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

      <div className='flex flex-col gap-3 border-t border-black/10 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between'>
        <span>Manage your customer details</span>
        <Link
          href='/profile'
          className='font-semibold text-black underline underline-offset-4'
        >
          Open profile
        </Link>
      </div>
    </div>
  )
}
