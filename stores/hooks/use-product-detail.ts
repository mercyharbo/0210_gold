'use client'

import { create } from 'zustand'

type ProductDetailState = {
  activeImageIndex: number
  galleryOpen: boolean
  descriptionOpen: boolean
  quantity: number
  selectedSize: string | null
  selectedColor: string | null
  isWishlisted: boolean
  wishlistPending: boolean

  setActiveImageIndex: (val: number) => void
  setGalleryOpen: (val: boolean) => void
  setDescriptionOpen: (val: boolean) => void
  setQuantity: (val: number) => void
  setSelectedSize: (val: string | null) => void
  setSelectedColor: (val: string | null) => void
  setIsWishlisted: (val: boolean) => void
  setWishlistPending: (val: boolean) => void
  resetStore: () => void
}

export const useProductDetailStore = create<ProductDetailState>((set) => ({
  activeImageIndex: 0,
  galleryOpen: false,
  descriptionOpen: false,
  quantity: 1,
  selectedSize: null,
  selectedColor: null,
  isWishlisted: false,
  wishlistPending: false,

  setActiveImageIndex: (activeImageIndex) => set({ activeImageIndex }),
  setGalleryOpen: (galleryOpen) => set({ galleryOpen }),
  setDescriptionOpen: (descriptionOpen) => set({ descriptionOpen }),
  setQuantity: (quantity) => set({ quantity }),
  setSelectedSize: (selectedSize) => set({ selectedSize }),
  setSelectedColor: (selectedColor) => set({ selectedColor }),
  setIsWishlisted: (isWishlisted) => set({ isWishlisted }),
  setWishlistPending: (wishlistPending) => set({ wishlistPending }),
  resetStore: () =>
    set({
      activeImageIndex: 0,
      galleryOpen: false,
      descriptionOpen: false,
      quantity: 1,
      selectedSize: null,
      selectedColor: null,
      isWishlisted: false,
      wishlistPending: false,
    }),
}))
