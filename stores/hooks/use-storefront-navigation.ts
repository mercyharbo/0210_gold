'use client'

import { useCallback, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'

import { useStorefrontNavigation } from '@/stores/storefront-navigation'

export function useStoreMenu() {
  return useStorefrontNavigation(useShallow((state) => ({
    menuOpen: state.menuOpen,
    reset: state.reset,
  })))
}

export function useStoreSearch() {
  return useStorefrontNavigation(useShallow((state) => ({
    searchOpen: state.searchOpen,
    setSearchOpen: state.setSearchOpen,
  })))
}

export function useStoreFooter() {
  return useStorefrontNavigation(useShallow((state) => ({
    setNewsletterOpen: state.setNewsletterOpen,
  })))
}

export function useStoreNewsletter(autoOpen: boolean) {
  const pathname = usePathname()

  const { newsletterOpen, setNewsletterOpen } = useStorefrontNavigation(useShallow((state) => ({
    newsletterOpen: state.newsletterOpen,
    setNewsletterOpen: state.setNewsletterOpen,
  })))

  const handleNewsletterOpenChange = useCallback((open: boolean) => {
    setNewsletterOpen(open)
    sessionStorage.setItem('fm-luxe-newsletter-seen', '1')
  }, [setNewsletterOpen])

  useEffect(() => {
    if (!autoOpen || pathname === '/profile' || pathname.startsWith('/profile/')) {
      return
    }

    if (sessionStorage.getItem('fm-luxe-newsletter-seen')) {
      return
    }

    const timer = window.setTimeout(() => {
      // Read current overlay state when the timer fires, not a stale render snapshot.
      const { menuOpen, searchOpen } = useStorefrontNavigation.getState()

      if (!menuOpen && !searchOpen) {
        handleNewsletterOpenChange(true)
      }
    }, 8000)

    return () => window.clearTimeout(timer)
  }, [autoOpen, pathname, handleNewsletterOpenChange])

  return { newsletterOpen, handleNewsletterOpenChange }
}
