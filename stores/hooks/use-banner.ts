'use client'

import { create } from 'zustand'

import type { HeroBanner } from '@/types/hero-banner'

type BannerState = {
  selectedBanner: HeroBanner | null
  isDeleteDialogOpen: boolean
  openDeleteDialog: (banner: HeroBanner) => void
  closeDeleteDialog: () => void
}

export const useBanner = create<BannerState>((set) => ({
  selectedBanner: null,
  isDeleteDialogOpen: false,
  openDeleteDialog: (banner) =>
    set({ selectedBanner: banner, isDeleteDialogOpen: true }),
  closeDeleteDialog: () =>
    set({ selectedBanner: null, isDeleteDialogOpen: false }),
}))
