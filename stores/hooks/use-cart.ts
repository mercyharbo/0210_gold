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
}

type CartState = {
  items: CartItem[]
  addItem: (
    product: Product,
    quantity: number,
    size?: string,
    color?: string
  ) => void
  removeItem: (productId: string, size?: string, color?: string) => void
  updateQuantity: (
    productId: string,
    quantity: number,
    size?: string,
    color?: string
  ) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, quantity, size, color) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.product.id === product.id &&
              item.selectedSize === size &&
              item.selectedColor === color
          )

          if (existingIndex > -1) {
            const updatedItems = [...state.items]
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + quantity,
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
              },
            ],
          }
        }),
      removeItem: (productId, size, color) =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.product.id === productId &&
                item.selectedSize === size &&
                item.selectedColor === color
              )
          ),
        })),
      updateQuantity: (productId, quantity, size, color) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId &&
            item.selectedSize === size &&
            item.selectedColor === color
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
        (total, item) => total + (item.product.price ?? 0) * item.quantity,
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
