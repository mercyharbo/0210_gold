import Link from 'next/link'
import { SignOutButton } from '@/components/auth/neon/sign-out-button'

export function CatalogAdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b bg-white px-5 py-5 sm:px-8">
        <Link href="/admin/products" className="text-xl font-semibold">
          FM LUXE · Admin
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/shop">View store</Link>
          <SignOutButton />
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8">
        <nav aria-label="Administration" className="flex flex-wrap gap-4 text-sm">
          <Link href="/admin/products">Products</Link>
          <Link href="/admin/categories">Categories</Link>
          <Link href="/admin/hero-banners">Hero banners</Link>
          <Link href="/admin/settings">Settings &amp; gold rates</Link>
        </nav>
        <main>{children}</main>
      </div>
    </div>
  )
}
