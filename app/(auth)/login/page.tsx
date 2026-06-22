import Link from 'next/link'

import {
  AuthShell,
  authInputClassName,
  authLabelClassName,
} from '@/components/auth/auth-shell'
import { AuthSubmitButton } from '@/components/auth/auth-submit-button'
import { PasswordInput } from '@/components/auth/password-input'

import { login } from '../actions'

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string
    message?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams

  return (
    <AuthShell
      eyebrow='Customer login'
      title='Access your 0210 Gold account.'
      description='Sign in to review orders, saved products, personal shopping requests, addresses, and customer support history.'
      footer={
        <div className='flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between'>
          <span>New customer?</span>
          <Link
            href='/signup'
            className='font-semibold text-black underline underline-offset-4'
          >
            Create an account
          </Link>
        </div>
      }
    >
      <div className='mb-8'>
        <p className='text-xs font-semibold uppercase text-gold'>
          Welcome back
        </p>
        <h2 className='mt-2 font-heading text-4xl font-semibold'>
          Login details
        </h2>
      </div>

      <button
        type='button'
        className='mb-6 inline-flex h-12 w-full items-center justify-center gap-3 border border-black px-5 text-sm font-semibold transition-colors hover:bg-black hover:text-white'
      >
        <span className='font-heading text-lg'>G</span>
        Continue with Google
      </button>

      {params?.error ? (
        <p className='mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700'>
          {params.error}
        </p>
      ) : null}

      {params?.message ? (
        <p className='mb-5 border border-gold/40 bg-gold/10 px-4 py-3 text-sm leading-6 text-muted-foreground'>
          {params.message}
        </p>
      ) : null}

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
    </AuthShell>
  )
}
