'use client'

import Link from 'next/link'
import { UserRound } from 'lucide-react'
import { SignOutButton } from '@/components/auth/neon/sign-out-button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAccountProfile } from '@/hooks/use-account-endpoint'
import { profileDisplayName } from '@/lib/validations/account-profile'
import { NavLabel } from './nav-label'

export function StorefrontAccountMenu() {
  const { data, error, isLoading } = useAccountProfile()
  const profile = error?.status === 401 ? undefined : data?.data
  if (!profile) {
    const guest = error?.status === 401
    return (
      <Link className='meere-link' href={guest ? '/login' : '/profile'} aria-label={guest ? 'Sign in' : 'Account'}>
        <UserRound className='meere-nav-icon' />
        <NavLabel>{guest ? 'Sign in' : 'Account'}</NavLabel>
        {isLoading && <span className='sr-only'>Checking your account</span>}
      </Link>
    )
  }
  const name = profileDisplayName(profile)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='meere-link' aria-label={`Account for ${name}`}>
        <UserRound className='meere-nav-icon' />
        <NavLabel>{profile.first_name || profile.name.split(' ')[0] || 'Account'}</NavLabel>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-64'>
        <DropdownMenuLabel className='break-words'>{name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link href='/profile'>Profile</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className='p-2'><SignOutButton /></div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
