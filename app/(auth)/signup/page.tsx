import Link from 'next/link'

import {
  AuthShell,
  authInputClassName,
  authLabelClassName,
} from '@/components/auth/auth-shell'
import { AuthSubmitButton } from '@/components/auth/auth-submit-button'
import { PasswordInput } from '@/components/auth/password-input'

import { signup } from '../actions'

type SignupPageProps = {
  searchParams?: Promise<{
    error?: string
  }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams

  return (
    <AuthShell
      eyebrow='Create account'
      title='Build your customer profile.'
      description='Create an account for faster checkout, order history, product reviews, saved fashion items, and personal shopper request tracking.'
      footer={
        <div className='flex flex-col gap-3 text-sm text-black/62 sm:flex-row sm:items-center sm:justify-between'>
          <span>Already have an account?</span>
          <Link
            href='/login'
            className='font-semibold text-black underline underline-offset-4'
          >
            Sign in
          </Link>
        </div>
      }
    >
      <div className='mb-8'>
        <p className='text-xs font-semibold uppercase text-[#b88a2b]'>
          New customer
        </p>
        <h2 className='mt-2 font-heading text-4xl font-semibold'>
          Signup details
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

      <form action={signup} className='space-y-5'>
        <div className='grid gap-5 sm:grid-cols-2'>
          <label className='block space-y-2'>
            <span className={authLabelClassName}>First name</span>
            <input
              autoComplete='given-name'
              className={authInputClassName}
              name='firstName'
              placeholder='First name'
              required
              type='text'
            />
          </label>

          <label className='block space-y-2'>
            <span className={authLabelClassName}>Last name</span>
            <input
              autoComplete='family-name'
              className={authInputClassName}
              name='lastName'
              placeholder='Last name'
              required
              type='text'
            />
          </label>
        </div>

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
          <span className={authLabelClassName}>Phone or WhatsApp</span>
          <input
            autoComplete='tel'
            className={authInputClassName}
            name='phone'
            placeholder='+234...'
            type='tel'
          />
        </label>

        <label className='block space-y-2'>
          <span className={authLabelClassName}>Password</span>
          <PasswordInput
            autoComplete='new-password'
            className={authInputClassName}
            minLength={8}
            name='password'
            placeholder='Create a password'
            required
          />
        </label>

        <AuthSubmitButton
          idleLabel='Create account'
          loadingLabel='Creating account'
        />
      </form>
    </AuthShell>
  )
}
