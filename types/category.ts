export type Category = {
  id: string
  parent_id: string | null
  name: string
  slug: string
  description: string | null
  image_src: string | null
  image_alt: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type CategoryOption = {
  id: string
  name: string
  slug: string
}
