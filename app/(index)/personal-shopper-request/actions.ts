'use server'

import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from '@/lib/supabase/server'

export type PersonalShopperRequestPayload = {
  fullName: string
  phone: string
  email: string
  category: string
  budget?: string
  size?: string
  preferredStoresOrLinks?: string
  deliveryCity?: string
  message: string
}

export type PersonalShopperActionResult = {
  success: boolean
  error?: string
  requestId?: string
}

export async function submitPersonalShopperRequestAction(
  payload: PersonalShopperRequestPayload
): Promise<PersonalShopperActionResult> {
  if (!payload.fullName?.trim() || !payload.email?.trim() || !payload.phone?.trim()) {
    return { success: false, error: 'Full name, email, and phone number are required.' }
  }

  if (!payload.category?.trim() || !payload.message?.trim()) {
    return { success: false, error: 'Category and request details message are required.' }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const userId = user?.id || null

  const adminSupabase = createSupabaseAdminClient()

  const { data: request, error } = await adminSupabase
    .from('personal_shopper_requests')
    .insert({
      user_id: userId,
      full_name: payload.fullName.trim(),
      phone: payload.phone.trim(),
      email: payload.email.trim(),
      category: payload.category.trim(),
      budget: payload.budget?.trim() || null,
      size: payload.size?.trim() || null,
      preferred_stores_or_links: payload.preferredStoresOrLinks?.trim() || null,
      delivery_city: payload.deliveryCity?.trim() || null,
      message: payload.message.trim(),
      status: 'Pending',
    })
    .select('id')
    .single()

  if (error || !request) {
    console.error('Personal shopper request creation failed:', error)
    return { success: false, error: 'Failed to submit your request. Please try again.' }
  }

  return { success: true, requestId: request.id }
}
