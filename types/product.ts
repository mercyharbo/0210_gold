export type ProductStatus = 'draft' | 'active' | 'archived'

export type ProductPricingType = 'fixed' | 'starting_from' | 'price_on_request'

export type Product = {
  id: string
  name: string
  slug: string
  category_id: string
  pricing_type: ProductPricingType
  price: number | null
  stock: number
  status: ProductStatus
  description: string
  image_src: string
  image_urls?: string[]
  image_alt: string
  label: string | null
  sizes: string[]
  colors: string[]
  details: string[]
  gold_weight_grams?: number | null
  gold_karats?: string[]
  making_charge?: number | null
  note?: string | null
  is_gold_karat_priced?: boolean
  created_at: string
  updated_at: string
}

export type AdminProductListItem = Product & {
  category: {
    name: string
    slug: string
  } | null
}

export type CreateProductInput = {
  name: string
  slug: string
  categoryId: string
  pricingType: ProductPricingType
  price: number | null
  stock: number
  status: ProductStatus
  description: string
  imageSrc: string
  imageUrls: string[]
  imageAlt: string
  label: string | null
  sizes: string[]
  colors: string[]
  details: string[]
  goldWeightGrams?: number | null
  goldKarats?: string[]
  makingCharge?: number | null
  note?: string | null
  isGoldKaratPriced?: boolean
}

export type UpdateProductInput = CreateProductInput

