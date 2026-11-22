import Link from 'next/link'

import {
  authInputClassName,
  authLabelClassName,
} from '@/components/auth/auth-form-styles'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PasswordInput } from '@/components/auth/password-input'


export default function SignupPage() {
  return (
    <div className='flex flex-col gap-8'>
      <div className='space-y-2'>
        <p className='text-xs font-semibold uppercase text-gold'>
          New customer
        </p>
        <h2 className='font-sans text-4xl font-semibold'>
          Signup details
        </h2>
      </div>

      <Alert><AlertDescription id='signup-unavailable'>Account creation is temporarily unavailable while signup is being connected. Existing customers can sign in.</AlertDescription></Alert>
      <div className='flex flex-col gap-6'>
        <button
          type='button'
          disabled
          aria-describedby='signup-unavailable'
          className='inline-flex h-12 w-full items-center justify-center gap-3 border border-black px-5 text-sm font-semibold transition-colors hover:bg-black hover:text-white'
        >
          <span className='text-lg font-semibold'>G</span>
          Continue with Google
        </button>

        <fieldset disabled aria-describedby='signup-unavailable' className='flex min-w-0 flex-col gap-5'>
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

          <Button type='button' disabled className='w-full'>Create account</Button>
        </fieldset>
      </div>

      <div className='flex flex-col gap-3 border-t border-black/10 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between'>
        <span>Already have an account?</span>
        <Link
          href='/login'
          className='font-semibold text-black underline underline-offset-4'
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}
