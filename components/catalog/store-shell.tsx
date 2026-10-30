import Link from 'next/link'
import { readCatalog } from '@/lib/catalog/server'
import type { CatalogSettings } from '@/types/catalog'

export async function CatalogStoreShell({ children }: { children: React.ReactNode }) {
  const settings = await readCatalog<CatalogSettings>('settings')
  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <header className="flex flex-col gap-5 border-b px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" className="self-center text-3xl font-semibold" aria-label="FM LUXE home">
          FM LUXE
        </Link>
        <nav
          aria-label="Main navigation"
          className="flex flex-wrap items-center justify-center gap-5 text-sm"
        >
          <Link href="/shop">Shop</Link>
          <Link href="/categories">Collections</Link>
          <Link href="/about">About</Link>
          <Link href="/auth/preview/account">Account</Link>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="flex flex-col gap-3 border-t bg-black px-5 py-10 text-sm text-white sm:px-8 lg:px-12">
        <p className="text-xl font-semibold">{settings.store_name || 'FM LUXE'}</p>
        <p>Jewellery, fashion, and carefully chosen details.</p>
        {settings.support_email && <a href={`mailto:${settings.support_email}`}>{settings.support_email}</a>}
        {settings.support_phone && <p>{settings.support_phone}</p>}
        {settings.store_address && <p>{settings.store_address}</p>}
        {settings.business_hours && <p>{settings.business_hours}</p>}
        <Link href="/shop" className="underline underline-offset-4">
          Explore the collection
        </Link>
      </footer>
    </div>
  )
}
