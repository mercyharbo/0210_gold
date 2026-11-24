'use client'

import { Heart, Menu, Search, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Marquee } from '@/components/ui/marquee'
import { useStoreHeader } from '@/stores/hooks/use-store-header'

import { StorefrontAccountMenu } from './account-menu'
import { StorefrontMenu } from './menu'
import { NavLabel } from './nav-label'
import { StorefrontSearch } from './search'

export function StorefrontHeader() {
  const { home, scrolled, totalItems, menuOpen, setMenuOpen, setSearchOpen } = useStoreHeader()

  return (
    <header
      className={`top-0 z-40 w-full ${home ? 'fixed bg-transparent' : 'sticky bg-white'}`}
    >
      <a
        href='#storefront-content'
        className='sr-only focus:not-sr-only focus:block focus:bg-white focus:p-3'
      >
        Skip to content
      </a>

      <div
        className='h-7 overflow-hidden bg-[#e10600] text-white'
        aria-label='Discover FM LUXE gold jewellery'
      >
        <Marquee label='Discover FM LUXE gold jewellery'>
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <span
              key={item}
              className='flex items-center gap-7 whitespace-nowrap pr-7 text-xs leading-[14px]'
            >
              Discover FM LUXE gold jewellery
              <i className='size-1 rounded-full bg-white' />
            </span>
          ))}
        </Marquee>
      </div>

      <div
        className={`relative grid h-14 grid-cols-[auto_1fr_auto] items-center gap-3 px-6
          transition-colors duration-300 motion-reduce:transition-none lg:h-[54px]
          lg:grid-cols-[1fr_auto_1fr] lg:gap-6 max-[390px]:gap-2 max-[390px]:px-4
          ${scrolled || menuOpen ? 'bg-white' : ''}`}
      >
        <nav aria-label='Main navigation' className='hidden items-center gap-6 lg:flex'>

          <button
            className='group inline-flex items-center gap-3 whitespace-nowrap
              text-base font-medium leading-none transition-colors duration-200 hover:text-black motion-reduce:transition-none'
            aria-expanded={menuOpen}
            aria-controls='storefront-menu'
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <NavLabel>Shop</NavLabel>
          </button>

          <Link
            className='group inline-flex items-center gap-3 whitespace-nowrap
              text-base font-medium leading-none transition-colors duration-200 hover:text-black motion-reduce:transition-none'
            href='/new-arrivals'
          >
            <NavLabel>New Arrivals</NavLabel>
          </Link>

          <Link
            className='group inline-flex items-center gap-3 whitespace-nowrap
              text-base font-medium leading-none transition-colors duration-200 hover:text-black motion-reduce:transition-none'
            href='/categories'
          >
            <NavLabel>Collections</NavLabel>
          </Link>
        </nav>

        <div className='block lg:hidden'>
          <Button
            variant='ghost'
            size='icon'
            className='rounded-none'
            aria-label='Open navigation'
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu className='size-4' />
          </Button>
        </div>

        <Link
          href='/'
          aria-label='FM LUXE home'
          className='justify-self-start text-2xl font-semibold leading-none lg:justify-self-center max-[390px]:text-[22px]'
        >
          fm luxe
        </Link>

        <nav aria-label='Shopping navigation' className='flex items-center justify-end gap-4 lg:gap-6 max-[390px]:gap-3'>
          <Link
            className='group inline-flex items-center gap-3 whitespace-nowrap
              text-base font-medium leading-none transition-colors duration-200 hover:text-black motion-reduce:transition-none
              [&>span]:hidden lg:[&>span]:inline-flex'
            href='/profile?tab=wishlist'
            aria-label='Favorites'
          >
            <Heart className='size-[18px] stroke-[1.5] lg:hidden' />
            <NavLabel>Favorites</NavLabel>
          </Link>

          <button
            className='group inline-flex items-center gap-3 whitespace-nowrap
              text-base font-medium leading-none transition-colors duration-200 hover:text-black motion-reduce:transition-none
              [&>span]:hidden lg:[&>span]:inline-flex'
            aria-label='Search'
            onClick={() => setSearchOpen(true)}
          >
            <Search className='size-[18px] stroke-[1.5] lg:hidden' />
            <NavLabel>Search</NavLabel>
          </button>

          <StorefrontAccountMenu />

          <Link
            className='group inline-flex items-center gap-3 whitespace-nowrap
              text-base font-medium leading-none transition-colors duration-200 hover:text-black motion-reduce:transition-none
              [&>span]:hidden lg:[&>span]:inline-flex'
            href='/cart'
            aria-label={`Cart, ${totalItems} items`}
          >
            <ShoppingCart className='size-[18px] stroke-[1.5] lg:hidden' />
            <NavLabel>Cart</NavLabel>
            <b className='inline-grid size-5 place-items-center bg-[#ff0000] text-xs font-normal text-white'>
              {totalItems}
            </b>
          </Link>
        </nav>
      </div>

      <StorefrontMenu />
      <StorefrontSearch />
    </header>
  )
}
