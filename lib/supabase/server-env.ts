export const supabaseServerEnvKeys = {
  url: 'SUPABASE_URL',
  publishableKey: 'SUPABASE_PUBLISHABLE_KEY',
  secretKey: 'SUPABASE_SECRET_KEY',
} as const

export function getSupabaseServerEnv() {
  return {
    url: process.env.SUPABASE_URL,
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
    secretKey: process.env.SUPABASE_SECRET_KEY,
  }
}

export function getRequiredSupabaseServerEnv() {
  const env = getSupabaseServerEnv()

  if (!env.url || !env.publishableKey) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY environment variable.',
    )
  }

  return {
    url: env.url,
    publishableKey: env.publishableKey,
    secretKey: env.secretKey,
  }
}
