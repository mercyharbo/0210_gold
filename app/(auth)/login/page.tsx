import Link from 'next/link'

import {
  authInputClassName,
  authLabelClassName,
} from '@/components/auth/auth-form-styles'
import { AuthSubmitButton } from '@/components/auth/auth-submit-button'
import { PasswordInput } from '@/components/auth/password-input'

import { login } from '../actions'

export default function LoginPage() {
  return (
    <>
      <div className='mb-8'>
        <p className='text-xs font-semibold uppercase text-gold'>
          Welcome back
        </p>
        <h2 className='mt-2 font-sans text-4xl font-semibold'>
          Login details
        </h2>
      </div>

      <button
        type='button'
        className='mb-6 inline-flex h-12 w-full items-center justify-center gap-3 border border-black px-5 text-sm font-semibold transition-colors hover:bg-black hover:text-white'
      >
        <span className='text-lg font-semibold'>G</span>
        Continue with Google
      </button>

      <form action={login} className='space-y-5'>
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

        <label className='block space-y-2'>
          <span className={authLabelClassName}>Password</span>
          <PasswordInput
            autoComplete='current-password'
            className={authInputClassName}
            name='password'
            placeholder='Enter your password'
            required
          />
        </label>

        <div className='flex justify-end'>
          <Link
            href='/forgot-password'
            className='text-sm font-semibold underline underline-offset-4'
          >
            Forgot password?
          </Link>
        </div>

        <AuthSubmitButton
          idleLabel='Sign in'
          loadingLabel='Signing in'
        />
      </form>

      <div className='mt-7 flex flex-col gap-3 border-t border-black/10 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between'>
        <span>New customer?</span>
        <Link
          href='/signup'
          className='font-semibold text-black underline underline-offset-4'
        >
          Create an account
        </Link>
      </div>
    </>
  )
}
