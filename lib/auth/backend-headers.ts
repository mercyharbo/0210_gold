import 'server-only'

import { getNeonAuth } from './neon-server'
import { getAuthProvider } from './provider'

export async function getIdentityHeaders() {
  if (getAuthProvider() !== 'neon') return null
  const auth = getNeonAuth()
  const { data: session } = await auth.getSession()
  if (!session?.user) return null
  const { data, error } = await auth.token()
  if (error || !data?.token) return null
  return { Authorization: `Bearer ${data.token}` }
}
