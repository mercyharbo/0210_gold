import type { ProductPricingType } from '@/types/product'

export type ProductCategory = string

export type Product = {
  id: string
  slug: string
  name: string
  category: ProductCategory
  categorySlug: string | null
  colors: string[]
  createdAt: string
  details: string[]
  description: string
  imageAlt: string
  imageSrc: string
  imageUrls: string[]
  label: string | null
  price: number | null
  pricingType: ProductPricingType
  sizes: string[]
  stock?: number
  goldWeightGrams?: number | null
  goldKarats?: string[]
  makingCharge?: number | null
}

const priceFormatter = new Intl.NumberFormat('en-NG', {
  maximumFractionDigits: 0,
})

export function formatNaira(price: number) {
  return `\u20a6${priceFormatter.format(price)}`
}

export function formatProductPrice(product: Product, computedPrice?: number | null) {
  const activePrice = computedPrice ?? product.price

  if (product.pricingType === 'price_on_request' || activePrice === null || activePrice === undefined) {
    return 'Price on Request'
  }

  const priceStr = formatNaira(activePrice)

  return product.pricingType === 'starting_from' ? `From ${priceStr}` : priceStr
}


export function getProductLabelClassName(label: string) {
  const normalizedLabel = label.toLowerCase()

  if (normalizedLabel === 'new in') {
    return 'bg-destructive text-white'
  }

  if (normalizedLabel === 'best seller') {
    return 'bg-gold text-white'
  }

  return 'bg-black text-white'
}
