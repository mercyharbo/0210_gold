'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'

import { useStorefrontNavigation } from '@/stores/storefront-navigation'
import { useCartStore } from './use-cart'

export function useStoreHeader() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  const navigation = useStorefrontNavigation(useShallow((state) => ({
    menuOpen: state.menuOpen,
    setMenuOpen: state.setMenuOpen,
    setSearchOpen: state.setSearchOpen,
    reset: state.reset,
  })))

  const { reset } = navigation

  // Match server output before reading the persisted cart after hydration.
  const totalItems = useSyncExternalStore(
    useCartStore.subscribe,
    () => useCartStore.getState().items.reduce((count, item) => count + item.quantity, 0),
    () => 0,
  )

  useEffect(() => {
    reset()
  }, [pathname, reset])

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY >= window.innerHeight - 82)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return { ...navigation, home: pathname === '/', scrolled, totalItems }
}
