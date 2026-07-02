export type Category = {
  id: string
  parent_id: string | null
  name: string
  slug: string
  description: string | null
  image_src: string | null
  image_alt: string | null
  category_type: string
  is_featured: boolean
  featured_sort_order: number
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type AdminCategory = Category & {
  product_count: number
}

export type CategoryOption = {
  id: string
  name: string
  slug: string
}

export type FeaturedCategory = Pick<
  Category,
  | 'id'
  | 'name'
  | 'slug'
  | 'description'
  | 'image_src'
  | 'image_alt'
  | 'category_type'
>
