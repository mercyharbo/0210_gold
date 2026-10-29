import { redirect } from 'next/navigation'
import { AdminPreview } from '@/components/auth/neon/admin-preview'
import { getIdentityHeaders } from '@/lib/auth/backend-headers'

export default async function AdminPreviewPage() {
  const headers = await getIdentityHeaders()
  if (!headers) redirect('/login')
  const origin = process.env.BACKEND_URL
  if (!origin) throw new Error('BACKEND_URL is not configured.')
  const response = await fetch(new URL('/v1/admin/auth-check', origin), {
    headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(30000),
  })
  if (response.status === 401) redirect('/login')
  if (response.status === 403 || response.status === 409)
    redirect(
      '/auth/preview/account?error=Administrator%20access%20is%20required.',
    )
  if (!response.ok)
    throw new Error('Unable to verify administrator access. Try again.')
  return <AdminPreview />
}
