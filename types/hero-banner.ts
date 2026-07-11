export type HeroBanner = {
  id: string
  title: string
  description: string
  image_src: string
  route: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type AdminHeroBanner = HeroBanner
