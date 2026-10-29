export function getAuthProvider(): 'supabase' | 'neon' {
  const value = process.env.AUTH_PROVIDER ?? 'supabase'
  if (value !== 'supabase' && value !== 'neon') {
    throw new Error('AUTH_PROVIDER must be supabase or neon.')
  }
  return value
}

export function assertLegacyAuthEnabled() {
  if (getAuthProvider() === 'neon') {
    throw new Error(
      'This shopping feature is temporarily unavailable in the Neon auth preview.',
    )
  }
}
