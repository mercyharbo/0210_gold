import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { FeaturedCategory } from '@/types/category'

export async function getFeaturedCategories() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('categories')
    .select(
      'id, name, slug, description, image_src, image_alt, category_type',
    )
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('featured_sort_order', { ascending: true })
    .order('sort_order', { ascending: true })
    .returns<FeaturedCategory[]>()

  if (error) {
    console.error('featured categories read failed:', {
      code: error.code,
      message: error.message,
    })

    return []
  }

  return (data ?? []).filter(
    (category) =>
      category.description && category.image_src && category.image_alt,
  )
}
