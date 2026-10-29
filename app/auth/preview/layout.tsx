import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getAuthProvider } from '@/lib/auth/provider'
import { getNeonAuth } from '@/lib/auth/neon-server'

export const dynamic = 'force-dynamic'

export default async function PreviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (getAuthProvider() !== 'neon') notFound()
  const { data: session } = await getNeonAuth().getSession()
  if (!session?.user) redirect('/login')
  return (
    <main className="min-h-dvh bg-muted px-5 py-12">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <Link
          href="/auth/preview/account"
          className="text-sm underline underline-offset-4"
        >
          FM LUXE account
        </Link>
        {children}
      </div>
    </main>
  )
}
