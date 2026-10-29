import { notFound } from 'next/navigation'
import { getAuthProvider } from '@/lib/auth/provider'
import { AuthComplete } from '@/components/auth/neon/auth-complete'

export default function AuthCompletePage() {
  if (getAuthProvider() !== 'neon') notFound()
  return <AuthComplete />
}
