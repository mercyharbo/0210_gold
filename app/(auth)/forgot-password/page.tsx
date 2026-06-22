import Link from 'next/link'

import {
  AuthShell,
  authInputClassName,
  authLabelClassName,
} from '@/components/auth/auth-shell'
import { AuthSubmitButton } from '@/components/auth/auth-submit-button'

import { forgotPassword } from '../actions'

type ForgotPasswordPageProps = {
  searchParams?: Promise<{
    error?: string
    message?: string
  }>
}

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams

  return (
    <AuthShell
      eyebrow='Password reset'
      title='Recover access to your account.'
      description='Use the email connected to your customer profile to start the password reset process.'
      footer={
        <div className='flex flex-col gap-3 text-sm text-black/62 sm:flex-row sm:items-center sm:justify-between'>
          <span>Remember your password?</span>
          <Link
            href='/login'
            className='font-semibold text-black underline underline-offset-4'
          >
            Back to login
          </Link>
        </div>
      }
    >
      <div className='mb-8'>
        <p className='text-xs font-semibold uppercase text-[#b88a2b]'>
          Reset password
        </p>
        <h2 className='mt-2 font-heading text-4xl font-semibold'>
          Email verification
        </h2>
      </div>

      {params?.error ? (
        <p className='mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700'>
          {params.error}
        </p>
      ) : null}

      {params?.message ? (
        <p className='mb-5 border border-[#f3d77a] bg-[#fff8df] px-4 py-3 text-sm leading-6 text-black/70'>
          {params.message}
        </p>
      ) : null}

      <form action={forgotPassword} className='space-y-5'>
        <label className='block space-y-2'>
          <span className={authLabelClassName}>Email address</span>
          <input
            autoComplete='email'
            className={authInputClassName}
            name='email'
            placeholder='you@example.com'
            required
            type='email'
          />
        </label>

        <AuthSubmitButton
          idleLabel='Send reset link'
          loadingLabel='Sending reset link'
        />
      </form>
    </AuthShell>
  )
}
