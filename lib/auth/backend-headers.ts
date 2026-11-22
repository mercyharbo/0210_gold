import 'server-only'

import { cookies } from 'next/headers'

export async function getIdentityHeaders() {
  const session = (await cookies()).get('fmluxe_session')?.value
  return session ? { Cookie: `fmluxe_session=${session}` } : null
}
