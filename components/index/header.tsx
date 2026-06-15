'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import gsap from 'gsap'
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import Link from 'next/link'
import { useLayoutEffect, useRef, useState } from 'react'

const navItems = [
  { href: '/about', label: 'About' },
  { href: '/categories', label: 'Collections' },
  { href: '/shop', label: 'Shop' },
  { href: '/personal-shopper-request', label: 'Personal Shopper' },
  { href: '/contact', label: 'Contact' },
]

const utilityNavItems = [
  { href: '/shop', label: 'Search' },
  { href: '/track-order', label: 'Account' },
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
  const desktopNavItemsRef = useRef<HTMLAnchorElement[]>([])
  const mobileNavScopeRef = useRef<HTMLDivElement>(null)

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
                className='invisible text-sm font-medium text-black transition-opacity hover:opacity-60'
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
                className='invisible text-sm font-medium text-black transition-opacity hover:opacity-60'
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className='flex items-center gap-4'>
            <Link aria-label='Search' href='/shop' className='text-black'>
              <Search className='size-5 stroke-[1.6]' />
            </Link>
            <Link
              aria-label='Account'
              href='/track-order'
              className='hidden text-black sm:block'
            >
              <User className='size-5 stroke-[1.6]' />
            </Link>
            <Link
              aria-label='Cart'
              href='/cart'
              className='relative text-black'
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
                    className='invisible font-heading text-2xl font-semibold text-black transition-opacity hover:opacity-60'
                  >
                    {item.label}
                  </Link>
                ))}
                <span className='my-2 h-px bg-black/10' />
                {utilityNavItems.map((item) => (
                  <Link
                    key={item.href}
                    data-mobile-nav-item
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className='invisible text-base font-medium text-black transition-opacity hover:opacity-60'
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
