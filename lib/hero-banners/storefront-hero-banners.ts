import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { HeroBanner } from '@/types/hero-banner'

export async function getStorefrontHeroBanners() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('hero_banners')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .returns<HeroBanner[]>()

  if (error) {
    console.error('Storefront hero banners read failed:', {
      code: error.code,
      message: error.message,
    })
    return []
  }

  return data ?? []
}
