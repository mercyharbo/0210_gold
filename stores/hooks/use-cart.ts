'use client'

import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Product } from '@/components/index/shop/shop-data'

export type CartItem = {
  product: Product
  quantity: number
  selectedSize?: string
  selectedColor?: string
  selectedKarat?: string
  unitPrice?: number
}

type CartState = {
  items: CartItem[]
  addItem: (
    product: Product,
    quantity: number,
    size?: string,
    color?: string,
    karat?: string,
    unitPrice?: number
  ) => void
  removeItem: (productId: string, size?: string, color?: string, karat?: string) => void
  updateQuantity: (
    productId: string,
    quantity: number,
    size?: string,
    color?: string,
    karat?: string
  ) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, quantity, size, color, karat, unitPrice) =>
        set((state) => {
          const effectivePrice = unitPrice ?? product.price ?? 0
          const existingIndex = state.items.findIndex(
            (item) =>
              item.product.id === product.id &&
              item.selectedSize === size &&
              item.selectedColor === color &&
              item.selectedKarat === karat
          )

          if (existingIndex > -1) {
            const updatedItems = [...state.items]
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + quantity,
              unitPrice: effectivePrice,
            }
            return { items: updatedItems }
          }

          return {
            items: [
              ...state.items,
              {
                product,
                quantity,
                selectedSize: size,
                selectedColor: color,
                selectedKarat: karat,
                unitPrice: effectivePrice,
              },
            ],
          }
        }),
      removeItem: (productId, size, color, karat) =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.product.id === productId &&
                item.selectedSize === size &&
                item.selectedColor === color &&
                item.selectedKarat === karat
              )
          ),
        })),
      updateQuantity: (productId, quantity, size, color, karat) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId &&
            item.selectedSize === size &&
            item.selectedColor === color &&
            item.selectedKarat === karat
              ? { ...item, quantity: Math.max(1, quantity) }
              : item
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'fm-luxe-shopping-cart',
    }
  )
)

export function useCart() {
  const store = useCartStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const items = mounted ? store.items : []
  const subtotal = mounted
    ? store.items.reduce(
        (total, item) => total + (item.unitPrice ?? item.product.price ?? 0) * item.quantity,
        0
      )
    : 0
  const totalItems = mounted
    ? store.items.reduce((total, item) => total + item.quantity, 0)
    : 0

  return {
    items,
    subtotal,
    totalItems,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    isHydrated: mounted,
  }
}

