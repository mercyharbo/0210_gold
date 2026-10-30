'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="mx-auto flex min-h-96 max-w-xl flex-col items-start justify-center gap-5 px-5 py-12">
    <Link href="/" className="text-2xl font-semibold">FM LUXE</Link>
    <h1 className="text-xl font-medium">We couldn’t load this page</h1>
    <p className="text-sm text-gray-600">The store service may be waking up. Please try again shortly.</p>
    <Button onClick={reset}>Try again</Button>
  </main>
}
