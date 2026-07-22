'use server'

import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/lib/auth/session'
import { defaultStoreSettings, type StoreSettingsRecord } from '@/lib/settings/types'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function getStoreSettingsAction(): Promise<StoreSettingsRecord> {
  const supabase = createSupabaseAdminClient()

  try {
    const { data } = await supabase
      .from('store_settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (data) {
      return {
        id: data.id,
        store_name: data.store_name || defaultStoreSettings.store_name,
        support_email: data.support_email || defaultStoreSettings.support_email,
        support_phone: data.support_phone || defaultStoreSettings.support_phone,
        store_address: data.store_address || defaultStoreSettings.store_address,
        business_hours: data.business_hours || defaultStoreSettings.business_hours,
        primary_currency: data.primary_currency || defaultStoreSettings.primary_currency,
        gbp_rate: Number(data.gbp_rate ?? defaultStoreSettings.gbp_rate),
        usd_rate: Number(data.usd_rate ?? defaultStoreSettings.usd_rate),
        local_shipping_fee: Number(data.local_shipping_fee ?? defaultStoreSettings.local_shipping_fee),
        uk_shipping_rate_per_kg: Number(data.uk_shipping_rate_per_kg ?? defaultStoreSettings.uk_shipping_rate_per_kg),
        free_shipping_threshold: Number(data.free_shipping_threshold ?? defaultStoreSettings.free_shipping_threshold),
        paystack_mode: data.paystack_mode || defaultStoreSettings.paystack_mode,
        order_email_notifications: Boolean(data.order_email_notifications ?? true),
        request_email_notifications: Boolean(data.request_email_notifications ?? true),
        low_stock_alerts: Boolean(data.low_stock_alerts ?? true),
        session_expiry_days: Number(data.session_expiry_days ?? 7),
        mfa_required: Boolean(data.mfa_required ?? false),
      }
    }
  } catch (error) {
    console.warn('Could not fetch store settings:', error)
  }

  return defaultStoreSettings
}

export async function updateStoreSettingsAction(settings: Partial<StoreSettingsRecord>) {
  await requireAdmin()
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from('store_settings')
    .upsert({
      id: settings.id || defaultStoreSettings.id,
      ...settings,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Failed to update store settings:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/settings')
  revalidatePath('/')
  return { success: true }
}
