import { redirect } from 'next/navigation'

import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

export async function requireUser(redirectTo = '/login?error=Sign in to continue.') {
  const user = await getCurrentUser()

  if (!user) {
    redirect(redirectTo)
  }

  return user
}

export async function redirectAuthenticatedUser(redirectTo = '/profile') {
  const user = await getCurrentUser()

  if (user) {
    redirect(redirectTo)
  }

  return null
}
