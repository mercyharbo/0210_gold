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
import { useCart } from '@/stores/hooks/use-cart'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { type FormEvent, useLayoutEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

type NavItem = {
  href: string
  label: string
  match?: 'exact' | 'shop' | 'new-arrivals'
}

const desktopLeftNavItems: NavItem[] = [
  { href: '/shop', label: 'Shop', match: 'shop' },
  { href: '/shop?sort=newest', label: 'New Arrivals', match: 'new-arrivals' },
  { href: '/categories', label: 'Collections' },
]

const desktopRightNavItems: NavItem[] = [
  { href: '/about', label: 'About' },
]

const menuNavItems: NavItem[] = [
  { href: '/', label: 'Home', match: 'exact' },
  { href: '/shop', label: 'Shop', match: 'shop' },
  { href: '/shop?sort=newest', label: 'New Arrivals', match: 'new-arrivals' },
  { href: '/categories', label: 'Collections' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

const utilityNavItems = [
  { href: '/shop', label: 'Search' },
  { href: '/profile', label: 'Account' },
  { href: '/cart', label: 'Cart' },
]

const desktopNavItems = [...desktopLeftNavItems, ...desktopRightNavItems]

const navLinkClassName =
  'relative inline-flex text-sm font-medium after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform hover:after:scale-x-100 focus-visible:outline-none focus-visible:after:scale-x-100'

const menuLinkClassName =
  'relative inline-flex w-fit max-w-full font-heading text-4xl font-semibold leading-none after:absolute after:-bottom-2 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform hover:after:scale-x-100 focus-visible:outline-none focus-visible:after:scale-x-100 sm:text-5xl lg:text-7xl'

function BrandMark() {
  return (
    <Link href='/' aria-label='FM LUXE home' className='inline-block shrink-0'>
      <span className='block font-heading text-4xl font-semibold leading-none text-black'>
        FM
      </span>
      <span className='flex w-full justify-between text-xs text-black'>
        <span>L</span>
        <span>U</span>
        <span>X</span>
        <span>E</span>
      </span>
    </Link>
  )
}

type IndexHeaderProps = {
  isLoggedIn?: boolean
}

export function IndexHeader({ isLoggedIn = false }: IndexHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const desktopNavItemsRef = useRef<HTMLAnchorElement[]>([])
  const menuNavScopeRef = useRef<HTMLDivElement>(null)
  const { totalItems } = useCart()

  function isActiveNavItem(item: NavItem) {
    const currentSort = searchParams.get('sort')

    if (item.match === 'exact') {
      return pathname === item.href
    }

    if (item.match === 'new-arrivals') {
      return pathname === '/shop' && currentSort === 'newest'
    }

    if (item.match === 'shop') {
      return (
        (pathname === '/shop' && currentSort !== 'newest') ||
        pathname.startsWith('/products/')
      )
    }

    return pathname === item.href || pathname.startsWith(`${item.href}/`)
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

      const menuItems = gsap.utils.toArray<HTMLElement>(
        '[data-menu-nav-item]',
        menuNavScopeRef.current,
      )

      if (!menuItems.length) {
        attempts += 1

        if (attempts < 10) {
          animationFrame = window.requestAnimationFrame(animateWhenMounted)
        }

        return
      }

      gsap.fromTo(
        menuItems,
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.06,
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
            {desktopLeftNavItems.map((item) => (
              <Link
                key={item.href}
                ref={(node) => {
                  if (node)
                    desktopNavItemsRef.current[
                      desktopNavItems.indexOf(item)
                    ] = node
                }}
                href={item.href}
                className={cn(
                  'invisible',
                  navLinkClassName,
                  isActiveNavItem(item)
                    ? 'text-gold after:scale-x-100'
                    : 'text-black',
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
            {desktopRightNavItems.map((item) => (
              <Link
                key={item.href}
                ref={(node) => {
                  if (node)
                    desktopNavItemsRef.current[
                      desktopNavItems.indexOf(item)
                    ] = node
                }}
                href={item.href}
                className={cn(
                  'invisible',
                  navLinkClassName,
                  isActiveNavItem(item)
                    ? 'text-gold after:scale-x-100'
                    : 'text-black',
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
                'transition-colors hover:text-gold',
                pathname === '/shop' ? 'text-gold' : 'text-black',
              )}
            >
              <Search className='size-5 stroke-[1.6]' />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label='Account menu'
                className='hidden text-black outline-none transition-colors hover:text-gold focus-visible:ring-2 focus-visible:ring-black/25 sm:grid sm:size-8 sm:place-items-center'
              >
                <User className='size-5 stroke-[1.6]' />
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='rounded-none'>
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isLoggedIn ? (
                  <>
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
                        <button type='submit' className='w-full cursor-pointer'>
                          <LogOut className='size-4' strokeWidth={1.7} />
                          Logout
                        </button>
                      </DropdownMenuItem>
                    </form>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href='/login'>
                        <User className='size-4' strokeWidth={1.7} />
                        Login
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href='/register'>
                        <User className='size-4' strokeWidth={1.7} />
                        Register
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href='/track-order'>
                        <PackageCheck className='size-4' strokeWidth={1.7} />
                        Track order
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              aria-label='Cart'
              href='/cart'
              className={cn(
                'relative transition-colors hover:text-gold',
                pathname === '/cart' ? 'text-gold' : 'text-black',
              )}
            >
              <ShoppingBag className='size-5 stroke-[1.6]' />
              <span className='absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-black text-xs font-medium text-white'>
                {totalItems}
              </span>
            </Link>
            <button
              type='button'
              aria-label='Open menu'
              onClick={() => setMenuOpen(true)}
              className='text-black transition-colors hover:text-gold'
            >
              <Menu className='size-6 stroke-[1.6]' />
            </button>
          </div>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side='left'
          className='!w-full !max-w-none border-r border-black/10 bg-white p-0 text-black sm:!max-w-none [&>button]:hidden'
        >
          <SheetHeader className='sr-only'>
            <SheetTitle>Navigation menu</SheetTitle>
            <SheetDescription>
              Browse FM LUXE navigation links and account shortcuts.
            </SheetDescription>
          </SheetHeader>

          <div
            ref={menuNavScopeRef}
            className='flex h-dvh flex-col overflow-y-auto'
          >
            <div className='flex h-20 shrink-0 items-center justify-between border-b border-black/10 px-5 sm:px-8 lg:px-12'>
              <BrandMark />
              <button
                type='button'
                aria-label='Close menu'
                onClick={() => setMenuOpen(false)}
                className='text-black transition-colors hover:text-gold'
              >
                <X className='size-6 stroke-[1.6]' />
              </button>
            </div>

            <div className='grid flex-1 gap-10 px-5 py-10 sm:px-8 md:grid-cols-[1fr_0.85fr] md:items-center lg:px-12 lg:py-16'>
              <nav className='flex flex-col gap-5 sm:gap-6'>
                {menuNavItems.map((item) => (
                  <Link
                    key={item.href}
                    data-menu-nav-item
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'invisible',
                      menuLinkClassName,
                      isActiveNavItem(item)
                        ? 'text-gold after:scale-x-100'
                        : 'text-black',
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className='flex flex-col gap-8'>
                <div
                  data-menu-nav-item
                  className='invisible flex flex-col gap-4'
                >
                  <p className='text-sm font-medium text-gold'>Style desk</p>
                  <p className='max-w-md text-xl leading-8 text-black sm:text-2xl'>
                    Curated fashion, gold, bags, shoes, and premium accessories
                    for polished everyday and occasion looks.
                  </p>
                </div>

                <div
                  data-menu-nav-item
                  className='invisible flex flex-wrap gap-5'
                >
                  {utilityNavItems.map((item) =>
                    item.label === 'Search' ? (
                      <button
                        key={item.href}
                        type='button'
                        onClick={() => {
                          setMenuOpen(false)
                          setSearchOpen(true)
                        }}
                        className={cn(
                          navLinkClassName,
                          'text-left',
                          pathname === '/shop' ? 'text-gold' : 'text-black',
                        )}
                      >
                        {item.label}
                      </button>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          navLinkClassName,
                          pathname === item.href ? 'text-gold' : 'text-black',
                        )}
                      >
                        {item.label}
                      </Link>
                    ),
                  )}
                </div>
              </div>
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
                Search FM LUXE
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
