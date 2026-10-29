import { notFound } from 'next/navigation'
import { getAuthProvider } from '@/lib/auth/provider'
import { VerificationForm } from '@/components/auth/neon/verification-form'

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  if (getAuthProvider() !== 'neon') notFound()
  return <VerificationForm email={(await searchParams).email} />
}
