import type { IdentityProfile } from '@/types/identity'

export function loginDestination(role: IdentityProfile['role']) {
  return role === 'admin' || role === 'super_admin' ? '/admin/categories' : '/'
}

export function verifiedSessionRole(
  value: unknown,
): IdentityProfile['role'] | null {
  if (
    !value ||
    typeof value !== 'object' ||
    !('identity' in value) ||
    !('profile' in value)
  )
    return null
  const { identity, profile } = value
  if (
    !identity ||
    typeof identity !== 'object' ||
    !('email_verified' in identity) ||
    identity.email_verified !== true
  )
    return null
  if (!profile || typeof profile !== 'object' || !('role' in profile))
    return null
  return profile.role === 'customer' ||
    profile.role === 'admin' ||
    profile.role === 'super_admin'
    ? profile.role
    : null
}
