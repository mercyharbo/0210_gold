import VerifyEmailComp from '@/components/auth/verify-email'

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  return <VerifyEmailComp email={(await searchParams).email} />
}
