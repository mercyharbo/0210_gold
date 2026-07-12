'use client'

import { Check, Heart, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { toggleWishlistItemAction } from '@/app/(index)/profile/actions'
import type { Product } from '@/components/index/shop/shop-data'
import { cn } from '@/lib/utils'
import { useCart } from '@/stores/hooks/use-cart'
import { useProductDetailStore } from '@/stores/hooks/use-product-detail'
import { useToast } from '@/stores/hooks/use-toast'

type ProductOptionsProps = {
  product: Product
}

export function ProductOptions({ product }: ProductOptionsProps) {
  const router = useRouter()
  const { items: cartItems, addItem, updateQuantity } = useCart()
  const { toast } = useToast()

  const {
    quantity,
    setQuantity,
    selectedSize,
    setSelectedSize,
    selectedColor,
    setSelectedColor,
    isWishlisted,
    setIsWishlisted,
    wishlistPending,
    setWishlistPending,
  } = useProductDetailStore()

  const cartItem = cartItems.find(
    (item) =>
      item.product.id === product.id &&
      item.selectedSize === (selectedSize || undefined) &&
      item.selectedColor === (selectedColor || undefined)
  )

  const isAlreadyInCart = !!cartItem
  const maxQuantity =
    typeof product.stock === 'number'
      ? Math.max(1, product.stock)
      : Number.POSITIVE_INFINITY

  // Sync local quantity state with cart item quantity when selected options or cartItem changes
  useEffect(() => {
    if (cartItem) {
      setQuantity(cartItem.quantity)
    } else {
      setQuantity(1)
    }
  }, [selectedSize, selectedColor, cartItem, setQuantity])

  const handleToggleWishlist = async () => {
    if (wishlistPending) return

    const nextStatus = !isWishlisted
    setIsWishlisted(nextStatus)
    setWishlistPending(true)

    try {
      await toggleWishlistItemAction(product.id)
      toast(
        nextStatus
          ? `"${product.name}" saved to your wishlist.`
          : `"${product.name}" removed from your wishlist.`,
        'success'
      )
    } catch (err: any) {
      setIsWishlisted(!nextStatus)
      router.push('/login?error=Sign in to save items to your wishlist.')
    } finally {
      setWishlistPending(false)
    }
  }

  const handleAddToCart = () => {
    addItem(
      product,
      quantity,
      selectedSize || undefined,
      selectedColor || undefined
    )
    toast(`"${product.name}" added to your shopping cart.`, 'success')
  }

  const decreaseQuantity = () => {
    const nextQty = Math.max(1, quantity - 1)
    setQuantity(nextQty)
    if (cartItem) {
      updateQuantity(
        product.id,
        nextQty,
        selectedSize || undefined,
        selectedColor || undefined
      )
    }
  }

  const increaseQuantity = () => {
    const nextQty = Math.min(maxQuantity, quantity + 1)
    setQuantity(nextQty)
    if (cartItem) {
      updateQuantity(
        product.id,
        nextQty,
        selectedSize || undefined,
        selectedColor || undefined
      )
    }
  }

  return (
    <div className='flex flex-col gap-6 py-6'>
      {/* Sizes Section */}
      {product.sizes.length > 0 && (
        <div className='flex flex-col gap-3'>
          <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
            Size
          </p>
          <div className='flex flex-wrap gap-2'>
            {product.sizes.map((size) => {
              const isActive = selectedSize === size
              return (
                <button
                  key={size}
                  type='button'
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    'h-10 min-w-12 border px-4 text-sm font-medium transition-colors cursor-pointer rounded-none',
                    isActive
                      ? 'bg-black text-white border-black'
                      : 'border-black/15 text-black hover:border-black'
                  )}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Colors Section */}
      {product.colors.length > 0 && (
        <div className='flex flex-col gap-3'>
          <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
            Color
          </p>
          <div className='flex flex-wrap gap-2'>
            {product.colors.map((color) => {
              const isActive = selectedColor === color
              return (
                <button
                  key={color}
                  type='button'
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    'h-10 min-w-12 border px-4 text-sm font-medium transition-colors cursor-pointer rounded-none',
                    isActive
                      ? 'bg-black text-white border-black'
                      : 'border-black/15 text-black hover:border-black'
                  )}
                >
                  {color}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Quantity & CTA buttons */}
      <div className='flex flex-col gap-3 border-t border-black/10 pt-6'>
        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
          Quantity
        </p>
        <div className='grid gap-3 sm:grid-cols-[auto_1fr_auto]'>
          <div className='flex h-12 w-full items-center justify-between border border-black/15 px-3 sm:w-32'>
            <button
              type='button'
              aria-label='Decrease quantity'
              onClick={decreaseQuantity}
              disabled={quantity <= 1}
              className='flex size-6 items-center justify-center text-muted-foreground transition-colors hover:text-black disabled:opacity-40 cursor-pointer'
            >
              <Minus className='size-3.5 stroke-[1.8]' />
            </button>
            <span className='font-heading text-base font-semibold text-black select-none'>
              {quantity}
            </span>
            <button
              type='button'
              aria-label='Increase quantity'
              onClick={increaseQuantity}
              disabled={quantity >= maxQuantity}
              className='flex size-6 items-center justify-center text-muted-foreground transition-colors hover:text-black disabled:opacity-40 cursor-pointer'
            >
              <Plus className='size-3.5 stroke-[1.8]' />
            </button>
          </div>

          <button
            type='button'
            onClick={handleAddToCart}
            disabled={isAlreadyInCart}
            className='inline-flex h-12 items-center justify-center gap-3 bg-black px-7 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-none'
          >
            {isAlreadyInCart ? 'Added to cart' : 'Add to cart'}
            {isAlreadyInCart ? (
              <Check className='size-4 stroke-[1.8]' />
            ) : (
              <ShoppingBag className='size-4 stroke-[1.8]' />
            )}
          </button>

          <button
            type='button'
            onClick={handleToggleWishlist}
            disabled={wishlistPending}
            className={cn(
              'grid h-12 w-full place-items-center border text-black transition-colors sm:w-12 cursor-pointer rounded-none',
              isWishlisted
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-black/15 hover:border-black'
            )}
          >
            <Heart
              className={cn(
                'size-5 stroke-[1.8]',
                isWishlisted && 'fill-gold'
              )}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
