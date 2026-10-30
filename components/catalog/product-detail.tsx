'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCatalogPrice } from '@/hooks/use-catalog-endpoint'
import { useCatalogSelection } from '@/stores/catalog-ui'
import type { CatalogProduct } from '@/types/catalog'
import { CatalogPriceLabel } from './price'
import { CatalogFeedback } from './feedback'

export function CatalogProductDetail({ product }: { product: CatalogProduct }) {
  const [imageIndex, setImageIndex] = useState(0)
  const selectedKarat = useCatalogSelection((state) => state.karat)
  const selectedSize = useCatalogSelection((state) => state.size)
  const selectedColor = useCatalogSelection((state) => state.color)
  const select = useCatalogSelection((state) => state.select)
  const reset = useCatalogSelection((state) => state.reset)
  useEffect(() => {
    select({ productId: product.id, karat: null, size: null, color: null })
    return reset
  }, [product.id, select, reset])
  const { data, error, isValidating } = useCatalogPrice(product.slug, selectedKarat)
  const image = product.images[imageIndex] ?? product.images[0]
  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 lg:px-12">
      <Link href="/shop" className="text-sm underline underline-offset-4">
        Back to shop
      </Link>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-4">
          {image && (
            <div className="relative aspect-square bg-gray-100">
              <Image
                src={image.url}
                alt={image.alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {product.images.map((item, index) => (
              <button
                key={item.media_id}
                type="button"
                onClick={() => setImageIndex(index)}
                aria-label={`View image ${index + 1}`}
                aria-pressed={imageIndex === index}
                className="relative size-16 overflow-hidden rounded border focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <Image src={item.url} alt={item.alt} fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div className="flex min-w-0 flex-col items-start gap-6">
          <p className="text-sm text-gray-600">{product.category.name}</p>
          <h1 className="max-w-full break-words text-3xl font-semibold sm:text-4xl">{product.name}</h1>
          <p className="text-xl" aria-live="polite">
            <CatalogPriceLabel
              price={data?.data ?? product.display_price}
              starting={product.pricing_type === 'starting_from'}
            />
          </p>
          {isValidating && <p className="text-xs text-gray-600">Updating price…</p>}
          <CatalogFeedback message={error?.message} error />
          <p className="whitespace-pre-line text-sm leading-7 text-gray-700">{product.description}</p>
          {(
            [
              ['Size', product.sizes ?? [], selectedSize, 'size'],
              ['Color', product.colors ?? [], selectedColor, 'color'],
              ['Karat', product.gold_karats ?? [], selectedKarat, 'karat'],
            ] as const
          ).map(([label, options, selected, key]) =>
            options.length ? (
              <fieldset key={key} className="flex flex-col gap-3">
                <legend className="py-2 text-sm font-medium">{label}</legend>
                <div className="flex flex-wrap gap-2">
                  {options.map((value) => (
                    <Button
                      key={value}
                      variant={selected === value ? 'default' : 'outline'}
                      type="button"
                      aria-pressed={selected === value}
                      onClick={() => select({ [key]: value })}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </fieldset>
            ) : null,
          )}
          {product.gold_weight_grams && <p className="text-sm">Weight: {product.gold_weight_grams} g</p>}
          {product.note && <p className="text-sm text-gray-600">{product.note}</p>}
          <p className="text-sm">{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</p>
          <CatalogFeedback message="Online checkout and saved items are temporarily unavailable while we complete the store upgrade." />
          {!!product.details?.length && (
            <ul className="flex list-inside list-disc flex-col gap-2 text-sm">
              {product.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
