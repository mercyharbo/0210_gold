'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus } from 'lucide-react'

import { formatNaira } from '@/components/index/shop/shop-data'
import { Button } from '@/components/ui/button'
import { useCart, type CartItem } from '@/stores/hooks/use-cart'
import { useToast } from '@/stores/hooks/use-toast'

export function CartProductRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart()
  const { toast } = useToast()
  const { product, selectedSize, selectedColor, selectedKarat } = item

  const unitPrice = item.unitPrice ?? product.price ?? 0
  const selectedOptions = [selectedKarat, selectedColor, selectedSize].filter(Boolean).join(' / ')

  function handleChangeQuantity(quantity: number) {
    updateQuantity(product.id, quantity, selectedSize, selectedColor, selectedKarat)
  }

  function handleRemoveCartProduct() {
    removeItem(product.id, selectedSize, selectedColor, selectedKarat)
    toast('Product removed from your bag.', 'success')
  }

  return (
    <li className='grid min-w-0 grid-cols-2 gap-5 py-6 md:grid-cols-4 md:items-center'>
      <div className='col-span-2 flex min-w-0 gap-4'>
        <Link href={`/products/${product.slug}`} className='relative h-32 w-24 shrink-0 bg-gray-100 sm:h-40 sm:w-32'>
          {product.imageSrc && (
            <Image
              src={product.imageSrc}
              alt={product.imageAlt || product.name}
              fill
              sizes='128px'
              className='object-cover'
            />
          )}
        </Link>

        <div className='flex min-w-0 flex-col items-start justify-between gap-4'>
          <div className='flex flex-col gap-2'>
            <Link href={`/products/${product.slug}`} className='break-words text-sm font-medium hover:text-[#e10600]'>
              {product.name}
            </Link>

            {selectedOptions && <p className='text-xs text-gray-600'>{selectedOptions}</p>}
            <p className='text-sm text-gray-600'>{formatNaira(unitPrice)}</p>
          </div>

          <Button
            type='button'
            variant='link'
            onClick={handleRemoveCartProduct}
            aria-label={`Remove ${product.name} from your bag`}
            className='h-auto p-0 text-xs text-gray-600 underline underline-offset-4 hover:text-[#e10600]'
          >
            Remove
          </Button>
        </div>
      </div>

      <div className='flex w-fit items-center border border-gray-300 md:justify-self-center'>
        <Button
          type='button'
          variant='ghost'
          disabled={item.quantity <= 1}
          onClick={() => handleChangeQuantity(item.quantity - 1)}
          aria-label={`Decrease ${product.name} quantity`}
          className='size-11 rounded-none hover:bg-gray-100'
        >
          <Minus />
        </Button>

        <span aria-live='polite' aria-label={`Quantity: ${item.quantity}`} className='min-w-8 text-center text-sm'>
          {item.quantity}
        </span>

        <Button
          type='button'
          variant='ghost'
          onClick={() => handleChangeQuantity(item.quantity + 1)}
          aria-label={`Increase ${product.name} quantity`}
          className='size-11 rounded-none hover:bg-gray-100'
        >
          <Plus />
        </Button>
      </div>

      <p className='justify-self-end text-sm font-medium'>{formatNaira(unitPrice * item.quantity)}</p>
    </li>
  )
}
