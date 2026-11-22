import { create } from 'zustand'

type NavigationState = {
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
  searchOpen: boolean
  newsletterOpen: boolean
  setSearchOpen: (open: boolean) => void
  setNewsletterOpen: (open: boolean) => void
  reset: () => void
}

export const useStorefrontNavigation = create<NavigationState>((set) => ({
  menuOpen: false,
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  searchOpen: false,
  newsletterOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setNewsletterOpen: (newsletterOpen) => set({ newsletterOpen }),
  reset: () => set({ menuOpen: false, searchOpen: false, newsletterOpen: false }),
}))
