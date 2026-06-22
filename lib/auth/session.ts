import { redirect } from 'next/navigation'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { CustomerProfile, UserRole } from '@/types/profile'

const ADMIN_ROLES = new Set<UserRole>(['admin', 'super_admin'])

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

export async function getCurrentUserProfile() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle<CustomerProfile>()

  return data
}

export async function getCurrentUserRole() {
  const profile = await getCurrentUserProfile()

  return profile?.role ?? null
}

export async function requireAdmin() {
  const user = await requireUser('/login?error=Sign in to continue.')
  const role = await getCurrentUserRole()

  if (!role || !ADMIN_ROLES.has(role)) {
    redirect('/profile?error=You do not have admin access.')
  }

  return {
    user,
    role,
  }
}

export async function redirectAuthenticatedUser(redirectTo = '/profile') {
  const user = await getCurrentUser()

  if (user) {
    redirect(redirectTo)
  }

  return null
}
