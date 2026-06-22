import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Category, CategoryOption } from '@/types/category'

type ProfileCategoryPreferenceRow = {
  profile_id: string
  category_id: string
  created_at: string
}

function isMissingSupabaseRelation(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? ''

  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    message.includes('could not find the table') ||
    (message.includes('relation') && message.includes('does not exist'))
  )
}

export async function getActiveCategories(): Promise<CategoryOption[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
    .returns<Pick<Category, 'id' | 'name' | 'slug'>[]>()

  if (error) {
    console.error('Active categories read failed:', {
      code: error.code,
      message: error.message,
    })

    if (isMissingSupabaseRelation(error)) {
      return []
    }

    return []
  }

  return data ?? []
}

export async function getProfileCategoryPreferences(profileId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('profile_category_preferences')
    .select('profile_id, category_id, created_at')
    .eq('profile_id', profileId)
    .returns<ProfileCategoryPreferenceRow[]>()

  if (error) {
    console.error('Profile category preferences read failed:', {
      code: error.code,
      message: error.message,
    })

    if (isMissingSupabaseRelation(error)) {
      return []
    }

    return []
  }

  return data?.map((preference) => preference.category_id) ?? []
}

export async function updateProfileCategoryPreferences(
  profileId: string,
  categoryIds: string[],
) {
  const supabase = await createSupabaseServerClient()
  const uniqueCategoryIds = [...new Set(categoryIds)]

  const { error: deleteError } = await supabase
    .from('profile_category_preferences')
    .delete()
    .eq('profile_id', profileId)

  if (deleteError) {
    throw new Error('Unable to update category preferences.')
  }

  if (uniqueCategoryIds.length === 0) {
    return
  }

  const { error: insertError } = await supabase
    .from('profile_category_preferences')
    .insert(
      uniqueCategoryIds.map((categoryId) => ({
        profile_id: profileId,
        category_id: categoryId,
      })),
    )

  if (insertError) {
    throw new Error('Unable to update category preferences.')
  }
}
