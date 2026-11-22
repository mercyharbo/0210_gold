import 'server-only'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { getIdentityHeaders } from './backend-headers'

export async function requireCatalogAdmin() {
  await connection()
  const headers = await getIdentityHeaders()
  if (!headers) redirect('/login')
  if (!process.env.BACKEND_URL) throw new Error('BACKEND_URL is not configured.')
  const response = await fetch(new URL('/v1/admin/auth-check', process.env.BACKEND_URL), {
    headers, cache: 'no-store', signal: AbortSignal.timeout(30000),
  })
  if (response.status === 401) redirect('/login')
  if (response.status === 403 || response.status === 409) redirect('/')
  if (!response.ok) throw new Error('Unable to verify administrator access. Try again.')
}
