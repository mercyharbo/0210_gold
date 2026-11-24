'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { SignOutButton } from '@/components/auth/neon/sign-out-button'

export function AdminHeader() {
  const segments = usePathname().split('/').filter(Boolean)
  return (
    <header className='sticky top-0 z-40 flex min-h-16 items-center justify-between gap-3 border-b border-gold/30 bg-card px-4 py-3 sm:px-6'>
      <div className='flex min-w-0 items-center gap-3'>
        <SidebarTrigger className='text-gold hover:bg-gold/10 hover:text-gold' />
        <nav aria-label='Breadcrumb' className='hidden flex-wrap items-center gap-2 text-sm sm:flex'>
          {segments.map((segment, index) => {
            const href = `/${segments.slice(0, index + 1).join('/')}`
            const title = segment === 'admin' ? 'Dashboard' : segment.replaceAll('-', ' ')
            return (
              <span key={href} className='flex items-center gap-2'>
                {index > 0 && <span aria-hidden='true'>/</span>}
                {index === segments.length - 1
                  ? <span aria-current='page' className='capitalize font-semibold'>{title}</span>
                  : <Link href={href} className='capitalize hover:text-gold'>{title}</Link>}
              </span>
            )
          })}
        </nav>
      </div>
      <div className='flex shrink-0 items-center gap-3'>
        <Button variant='outline' size='sm' asChild className='hidden border-gold/40 text-gold sm:inline-flex'>
          <Link href='/' target='_blank'>View store<ExternalLink className='size-3' /></Link>
        </Button>
        <SignOutButton />
      </div>
    </header>
  )
}
