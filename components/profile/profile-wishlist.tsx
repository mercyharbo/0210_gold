'use client'

import { Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { toggleWishlistItemAction } from '@/app/(index)/profile/actions'
import { formatNaira } from '@/components/index/shop/shop-data'
import type { Product } from '@/components/index/shop/shop-data'
import { useToast } from '@/stores/hooks/use-toast'

type WishlistItem = {
  wishlistId: string
  product: Product
}

type ProfileWishlistProps = {
  items: WishlistItem[]
}

export function ProfileWishlist({ items }: ProfileWishlistProps) {
  const [pendingId, setPendingId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleRemove = async (productId: string, productName: string) => {
    setPendingId(productId)
    try {
      await toggleWishlistItemAction(productId)
      toast(`"${productName}" removed from your wishlist.`, 'success')
    } catch (err: any) {
      toast(err.message || 'Failed to remove item.', 'error')
    } finally {
      setPendingId(null)
    }
  }

  if (items.length === 0) {
    return (
      <p className='text-sm text-muted-foreground col-span-2 py-4'>
        No saved items in your wishlist.
      </p>
    )
  }

  return (
    <div className='grid gap-5 sm:grid-cols-2'>
      {items.map(({ product }) => (
        <div
          key={product.id}
          className='relative group grid grid-cols-[96px_1fr] gap-4 ring-1 ring-black/10 p-3 transition-colors hover:ring-black bg-white'
        >
          {/* Link overlay */}
          <Link
            href={`/products/${product.slug}`}
            className='absolute inset-0 z-0'
          />

          <span className='relative aspect-square bg-muted z-10 pointer-events-none'>
            <Image
              src={product.imageSrc}
              alt={product.imageAlt}
              fill
              sizes='96px'
              className='object-cover'
            />
          </span>

          <span className='flex flex-col justify-center gap-1 z-10 pointer-events-none'>
            <span className='font-heading text-xl font-semibold truncate text-black'>
              {product.name}
            </span>
            <span className='text-sm font-semibold text-black'>
              {formatNaira(product.price ?? 0)}
            </span>
            <button
              type='button'
              disabled={pendingId !== null}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleRemove(product.id, product.name)
              }}
              className='pointer-events-auto flex w-fit items-center gap-1.5 mt-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-red-500 cursor-pointer disabled:opacity-50'
            >
              <Trash2 className='size-3.5' strokeWidth={1.8} />
              Remove
            </button>
          </span>
        </div>
      ))}
    </div>
  )
}
