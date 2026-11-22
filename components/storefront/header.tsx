'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { Heart, Menu, Search, ShoppingCart, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStorefrontNavigation } from '@/stores/storefront-navigation'
import { StorefrontMenu } from './menu'
import { StorefrontSearch } from './search'
import { useCartStore } from '@/stores/hooks/use-cart'
import { NavLabel } from './nav-label'

export function StorefrontHeader() {
  const pathname = usePathname()
  const home = pathname === '/'
  const totalItems = useSyncExternalStore(useCartStore.subscribe,
    () => useCartStore.getState().items.reduce((count, item) => count + item.quantity, 0),
    () => 0)
  const [scrolled, setScrolled] = useState(false)
  const menuOpen = useStorefrontNavigation((state) => state.menuOpen)
  const setMenuOpen = useStorefrontNavigation((state) => state.setMenuOpen)
  const setSearchOpen = useStorefrontNavigation((state) => state.setSearchOpen)
  const reset = useStorefrontNavigation((state) => state.reset)

  useEffect(() => { reset() }, [pathname, reset])
  useEffect(() => {
    function update() { setScrolled(window.scrollY >= window.innerHeight - 82) }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <header className={`meere-header ${home ? 'meere-header-home' : ''} ${scrolled || menuOpen ? 'meere-header-solid' : ''}`}>
      <a href="#storefront-content" className="sr-only focus:not-sr-only focus:block focus:bg-white focus:p-3">Skip to content</a>
      <div className="meere-announcement" aria-label="Discover FM LUXE gold jewellery">
        <div className="meere-marquee" aria-hidden="true">
          {[0, 1].map((group) => (
            <div className="meere-marquee-group" key={group}>
              {[0, 1, 2, 3, 4, 5].map((item) => <span key={item}>Discover FM LUXE gold jewellery<i /></span>)}
            </div>
          ))}
        </div>
      </div>
      <div className="meere-navigation">
        <nav aria-label="Main navigation" className="meere-desktop-links">
          <button className="meere-link" aria-expanded={menuOpen} aria-controls="storefront-menu" onClick={() => setMenuOpen(!menuOpen)}><NavLabel>Shop</NavLabel></button>
          <Link className="meere-link" href="/#new-arrivals"><NavLabel>New Arrivals</NavLabel></Link>
          <Link className="meere-link" href="/categories"><NavLabel>Collections</NavLabel></Link>
        </nav>
        <div className="meere-mobile-menu">
          <Button variant="ghost" size="icon" className="rounded-none" aria-label="Open navigation"
            aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><Menu className="size-4" /></Button>
        </div>
        <Link href="/" aria-label="FM LUXE home" className="meere-logo">fm luxe</Link>
        <nav aria-label="Shopping navigation" className="meere-shopping-links">
          <Link className="meere-link" href="/profile?tab=wishlist" aria-label="Favorites"><Heart className="meere-nav-icon" /><NavLabel>Favorites</NavLabel></Link>
          <button className="meere-link" aria-label="Search" onClick={() => setSearchOpen(true)}><Search className="meere-nav-icon" /><NavLabel>Search</NavLabel></button>
          <Link className="meere-link" href="/auth/preview/account" aria-label="Account"><UserRound className="meere-nav-icon" /><NavLabel>Account</NavLabel></Link>
          <Link className="meere-link" href="/cart" aria-label={`Cart, ${totalItems} items`}><ShoppingCart className="meere-nav-icon" /><NavLabel>Cart</NavLabel><b className="meere-cart-count">{totalItems}</b></Link>
        </nav>
      </div>
      <StorefrontMenu />
      <StorefrontSearch />
    </header>
  )
}
