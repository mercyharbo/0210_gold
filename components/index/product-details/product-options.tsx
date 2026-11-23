'use client'

import { Check, Heart, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useEffect } from 'react'
import type { Product } from '@/components/index/shop/shop-data'
import { getEffectiveProductPrice } from '@/lib/products/gold-pricing'
import { useCart } from '@/stores/hooks/use-cart'
import { useProductDetailStore } from '@/stores/hooks/use-product-detail'
import { useToast } from '@/stores/hooks/use-toast'
import { LegacyProductSelections } from './legacy-product-selections'

export function ProductOptions({ product }: { product: Product }) {
  const { items: cartItems, addItem, updateQuantity } = useCart()
  const { toast } = useToast()
  const quantity = useProductDetailStore((state) => state.quantity)
  const setQuantity = useProductDetailStore((state) => state.setQuantity)
  const selectedSize = useProductDetailStore((state) => state.selectedSize)
  const selectedColor = useProductDetailStore((state) => state.selectedColor)
  const selectedKarat = useProductDetailStore((state) => state.selectedKarat)
  const selectedWeightGrams = useProductDetailStore((state) => state.selectedWeightGrams)
  const activeWeight = selectedWeightGrams ?? product.goldWeightGrams ?? 1
  const currentUnitPrice = getEffectiveProductPrice(product, selectedKarat, undefined, activeWeight) ?? product.price ?? 0
  const cartItem = cartItems.find((item) => item.product.id === product.id &&
    item.selectedSize === (selectedSize || undefined) && item.selectedColor === (selectedColor || undefined) &&
    item.selectedKarat === (selectedKarat || undefined))
  const maxQuantity = typeof product.stock === 'number' ? Math.max(1, product.stock) : Number.POSITIVE_INFINITY

  useEffect(() => {
    setQuantity(cartItem?.quantity ?? 1)
  }, [selectedSize, selectedColor, selectedKarat, cartItem, setQuantity])

  function changeQuantity(nextQuantity: number) {
    setQuantity(nextQuantity)
    if (cartItem) updateQuantity(product.id, nextQuantity, selectedSize || undefined, selectedColor || undefined, selectedKarat || undefined)
  }

  function handleAddToCart() {
    addItem(product, quantity, selectedSize || undefined, selectedColor || undefined, selectedKarat || undefined, currentUnitPrice)
    toast(`"${product.name}" added to your shopping cart.`, 'success')
  }

  return (
    <div className='flex flex-col gap-6 py-6'>
      <LegacyProductSelections product={product} />
      <div className='flex flex-col gap-3 border-t border-black/10 pt-6'>
        <p className='text-xs font-medium text-muted-foreground'>Quantity</p>
        <div className='grid gap-3 sm:grid-cols-[auto_1fr_auto]'>
          <div className='flex h-12 w-full items-center justify-between border border-black/15 px-3 sm:w-32'>
            <button type='button' aria-label='Decrease quantity' onClick={() => changeQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1} className='flex size-6 items-center justify-center disabled:opacity-40'>
              <Minus className='size-4' />
            </button>
            <span className='font-heading text-base font-semibold'>{quantity}</span>
            <button type='button' aria-label='Increase quantity' onClick={() => changeQuantity(Math.min(maxQuantity, quantity + 1))}
              disabled={quantity >= maxQuantity} className='flex size-6 items-center justify-center disabled:opacity-40'>
              <Plus className='size-4' />
            </button>
          </div>
          <button type='button' onClick={handleAddToCart} disabled={!!cartItem}
            className='inline-flex h-12 items-center justify-center gap-3 bg-black px-7 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50'>
            {cartItem ? 'Added to cart' : 'Add to cart'}
            {cartItem ? <Check className='size-4' /> : <ShoppingBag className='size-4' />}
          </button>
          <button type='button' disabled aria-label='Wishlist is currently unavailable' aria-describedby='legacy-wishlist-unavailable'
            className='grid h-12 w-full place-items-center border border-black/15 text-gray-500 sm:w-12'>
            <Heart className='size-5' />
          </button>
        </div>
        <p id='legacy-wishlist-unavailable' className='text-xs text-muted-foreground'>Wishlist is currently unavailable.</p>
      </div>
    </div>
  )
}
