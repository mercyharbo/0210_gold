import Link from 'next/link'

import {
  authInputClassName,
  authLabelClassName,
} from '@/components/auth/auth-form-styles'
import { AuthSubmitButton } from '@/components/auth/auth-submit-button'

import { forgotPassword } from '../actions'

export default function ForgotPasswordPage() {
  return (
    <div className='flex flex-col gap-8'>
      <div className='space-y-2'>
        <p className='text-xs font-semibold uppercase text-gold'>
          Reset password
        </p>
        <h2 className='font-sans text-4xl font-semibold'>
          Email verification
        </h2>
      </div>

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
