'use client'

import { logout } from '@/app/(auth)/actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import gsap from 'gsap'
import {
  LockKeyhole,
  LogOut,
  Menu,
  PackageCheck,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { type FormEvent, useLayoutEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

const navItems = [
  { href: '/about', label: 'About' },
  { href: '/companies', label: 'Companies' },
  { href: '/categories', label: 'Collections' },
  { href: '/shop', label: 'Shop' },
  { href: '/personal-shopper-request', label: 'Personal Shopper' },
  { href: '/contact', label: 'Contact' },
]

const utilityNavItems = [
  { href: '/shop', label: 'Search' },
  { href: '/profile', label: 'Account' },
  { href: '/cart', label: 'Cart' },
]

function BrandMark() {
  return (
    <Link href='/' aria-label='0210 Gold home' className='inline-block shrink-0'>
      <span className='block font-heading text-4xl font-semibold leading-none text-black'>
        0210
      </span>
      <span className='flex w-full justify-between text-[10px] text-black'>
        <span>G</span>
        <span>O</span>
        <span>L</span>
        <span>D</span>
      </span>
    </Link>
  )
}

export function IndexHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const router = useRouter()
  const desktopNavItemsRef = useRef<HTMLAnchorElement[]>([])
  const mobileNavScopeRef = useRef<HTMLDivElement>(null)

  function isActiveNavItem(href: string) {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`) ||
      (href === '/shop' && pathname.startsWith('/products/'))
    )
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedQuery = searchQuery.trim()

    setSearchOpen(false)
    setMenuOpen(false)

    router.push(
      normalizedQuery
        ? `/shop?q=${encodeURIComponent(normalizedQuery)}`
        : '/shop',
    )
  }

  useLayoutEffect(() => {
    const desktopItems = desktopNavItemsRef.current.filter(Boolean)

    if (!desktopItems.length) return

    gsap.fromTo(
      desktopItems,
      { autoAlpha: 0, y: -8 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.08,
      },
    )
  }, [])

  useLayoutEffect(() => {
    if (!menuOpen) return

    let animationFrame = 0
    let attempts = 0
    let active = true

    const animateWhenMounted = () => {
      if (!active) return

      const mobileItems = gsap.utils.toArray<HTMLElement>(
        '[data-mobile-nav-item]',
        mobileNavScopeRef.current,
      )

      if (!mobileItems.length) {
        attempts += 1

        if (attempts < 10) {
          animationFrame = window.requestAnimationFrame(animateWhenMounted)
        }

        return
      }

      gsap.fromTo(
        mobileItems,
        { autoAlpha: 0, x: 18 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.45,
          ease: 'power2.out',
          stagger: 0.07,
        },
      )
    }

    animationFrame = window.requestAnimationFrame(animateWhenMounted)

    return () => {
      active = false
      window.cancelAnimationFrame(animationFrame)
    }
  }, [menuOpen])

  return (
    <header className='sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur'>
      <div className='mx-auto grid h-20 w-full grid-cols-[1fr_auto] items-center gap-6 px-5 sm:px-8 lg:px-12 xl:grid-cols-[auto_1fr_auto]'>
        <div className='order-2 hidden items-center gap-8 xl:order-1 xl:flex'>
          <nav className='hidden items-center gap-10 xl:flex'>
            {navItems.slice(0, 2).map((item) => (
              <Link
                key={item.href}
                ref={(node) => {
                  if (node)
                    desktopNavItemsRef.current[navItems.indexOf(item)] = node
                }}
                href={item.href}
                className={cn(
                  'invisible text-sm font-medium transition-opacity hover:opacity-60',
                  isActiveNavItem(item.href) ? 'text-gold' : 'text-black',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className='order-1 flex justify-start xl:order-2 xl:justify-center'>
          <BrandMark />
        </div>

        <div className='order-2 flex items-center justify-end gap-8 xl:order-3'>
          <nav className='hidden items-center gap-10 xl:flex'>
            {navItems.slice(2).map((item) => (
              <Link
                key={item.href}
                ref={(node) => {
                  if (node)
                    desktopNavItemsRef.current[navItems.indexOf(item)] = node
                }}
                href={item.href}
                className={cn(
                  'invisible text-sm font-medium transition-opacity hover:opacity-60',
                  isActiveNavItem(item.href) ? 'text-gold' : 'text-black',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className='flex items-center gap-4'>
            <button
              type='button'
              aria-label='Search'
              onClick={() => setSearchOpen(true)}
              className={cn(
                isActiveNavItem('/shop') ? 'text-gold' : 'text-black',
              )}
            >
              <Search className='size-5 stroke-[1.6]' />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label='Account menu'
                className='hidden text-black outline-none transition-opacity hover:opacity-60 focus-visible:ring-2 focus-visible:ring-black/25 sm:grid sm:size-8 sm:place-items-center'
              >
                <User className='size-5 stroke-[1.6]' />
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='rounded-none'>
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href='/profile'>
                    <User className='size-4' strokeWidth={1.7} />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href='/track-order'>
                    <PackageCheck className='size-4' strokeWidth={1.7} />
                    Track order
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href='/change-password'>
                    <LockKeyhole className='size-4' strokeWidth={1.7} />
                    Change password
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action={logout}>
                  <DropdownMenuItem asChild variant='destructive'>
                    <button type='submit' className='w-full'>
                      <LogOut className='size-4' strokeWidth={1.7} />
                      Logout
                    </button>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              aria-label='Cart'
              href='/cart'
              className={cn(
                'relative',
                isActiveNavItem('/cart') ? 'text-gold' : 'text-black',
              )}
            >
              <ShoppingBag className='size-5 stroke-[1.6]' />
              <span className='absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-black text-[10px] font-medium text-white'>
                0
              </span>
            </Link>
            <button
              type='button'
              aria-label='Open menu'
              onClick={() => setMenuOpen(true)}
              className='text-black xl:hidden'
            >
              <Menu className='size-6 stroke-[1.6]' />
            </button>
          </div>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side='left'
          className='w-full border-l border-black/10 bg-white p-0 text-black sm:max-w-md [&>button]:hidden'
        >
          <SheetHeader className='sr-only'>
            <SheetTitle>Navigation menu</SheetTitle>
          </SheetHeader>

          <div
            ref={mobileNavScopeRef}
            className='flex h-dvh flex-col overflow-y-auto'
          >
            <div className='space-y-5'>
              <div className='flex h-20 items-center justify-between border-b border-black/10 px-5 sm:px-8'>
                <BrandMark />
                <button
                  type='button'
                  aria-label='Close menu'
                  onClick={() => setMenuOpen(false)}
                  className='text-black'
                >
                  <X className='size-6 stroke-[1.6]' />
                </button>
              </div>

              <nav className='flex flex-col justify-center gap-4 px-5 sm:px-8'>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    data-mobile-nav-item
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'invisible font-heading text-2xl font-semibold transition-opacity hover:opacity-60',
                      isActiveNavItem(item.href) ? 'text-gold' : 'text-black',
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <span className='my-2 h-px bg-black/10' />
                {utilityNavItems.map((item) =>
                  item.label === 'Search' ? (
                    <button
                      key={item.href}
                      data-mobile-nav-item
                      type='button'
                      onClick={() => {
                        setMenuOpen(false)
                        setSearchOpen(true)
                      }}
                      className={cn(
                        'invisible text-left text-base font-medium transition-opacity hover:opacity-60',
                        isActiveNavItem(item.href) ? 'text-gold' : 'text-black',
                      )}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      key={item.href}
                      data-mobile-nav-item
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        'invisible text-base font-medium transition-opacity hover:opacity-60',
                        isActiveNavItem(item.href)
                          ? 'text-gold'
                          : 'text-black',
                      )}
                    >
                      {item.label}
                    </Link>
                  ),
                )}
              </nav>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
        <SheetContent
          side='top'
          className='border-b border-black/10 bg-white p-0 text-black [&>button]:hidden'
        >
          <div className='mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-6 sm:px-8'>
            <SheetHeader className='gap-2 text-left'>
              <SheetTitle className='font-heading text-2xl font-semibold'>
                Search 0210 Gold
              </SheetTitle>
              <SheetDescription>
                Find jewellery, bags, shoes, clothing, and curated edits.
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={submitSearch} className='flex gap-3'>
              <label className='relative flex-1'>
                <span className='sr-only'>Search products</span>
                <Search className='pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 stroke-[1.7] text-muted-foreground' />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  autoFocus
                  placeholder='Search products...'
                  className='h-12 w-full border border-black/10 bg-white pl-11 pr-4 text-sm text-black outline-none transition-colors placeholder:text-muted-foreground focus:border-black'
                />
              </label>
              <button
                type='submit'
                className='h-12 bg-black px-6 text-sm font-medium text-white transition-opacity hover:opacity-80'
              >
                Search
              </button>
              <button
                type='button'
                aria-label='Close search'
                onClick={() => setSearchOpen(false)}
                className='grid h-12 w-12 place-items-center border border-black/10 text-black transition-colors hover:border-black'
              >
                <X className='size-5 stroke-[1.6]' />
              </button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
