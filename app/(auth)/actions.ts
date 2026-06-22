'use server'

import { redirect } from 'next/navigation'

import { getSiteUrl } from '@/lib/site-url'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  changePasswordSchema,
  forgotPasswordSchema,
  getFirstValidationError,
  loginSchema,
  signupSchema,
} from '@/lib/validations/auth'

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key)

  return typeof value === 'string' ? value.trim() : ''
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

function redirectWithMessage(path: string, message: string): never {
  redirect(`${path}?message=${encodeURIComponent(message)}`)
}

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: getFormString(formData, 'email'),
    password: getFormString(formData, 'password'),
  })

  if (!parsed.success) {
    redirectWithError('/login', getFirstValidationError(parsed.error))
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    redirectWithError('/login', error.message)
  }

  redirect('/profile')
}

export async function signup(formData: FormData) {
  const parsed = signupSchema.safeParse({
    firstName: getFormString(formData, 'firstName'),
    lastName: getFormString(formData, 'lastName'),
    phone: getFormString(formData, 'phone'),
    email: getFormString(formData, 'email'),
    password: getFormString(formData, 'password'),
  })

  if (!parsed.success) {
    redirectWithError('/signup', getFirstValidationError(parsed.error))
  }

  const { email, firstName, lastName, password, phone } = parsed.data
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/auth/confirmed`,
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        phone,
      },
    },
  })

  if (error) {
    redirectWithError('/signup', error.message)
  }

  if (data.session) {
    redirect('/profile')
  }

  redirectWithMessage(
    '/login',
    'Account created. Check your email to confirm your account, then sign in.',
  )
}

export async function forgotPassword(formData: FormData) {
  const parsed = forgotPasswordSchema.safeParse({
    email: getFormString(formData, 'email'),
  })

  if (!parsed.success) {
    redirectWithError('/forgot-password', getFirstValidationError(parsed.error))
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${getSiteUrl()}/auth/callback?next=/change-password`,
    },
  )

  if (error) {
    redirectWithError('/forgot-password', error.message)
  }

  redirectWithMessage(
    '/forgot-password',
    'Password reset link sent. Check your email to continue.',
  )
}

export async function changePassword(formData: FormData) {
  const parsed = changePasswordSchema.safeParse({
    password: getFormString(formData, 'password'),
    confirmPassword: getFormString(formData, 'confirmPassword'),
  })

  if (!parsed.success) {
    redirectWithError('/change-password', getFirstValidationError(parsed.error))
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) {
    redirectWithError('/change-password', error.message)
  }

  redirectWithMessage(
    '/login',
    'Password changed successfully. Sign in with your new password.',
  )
}

export async function logout() {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    redirectWithError('/profile', error.message)
  }

  redirectWithMessage('/login', 'Signed out successfully.')
}
