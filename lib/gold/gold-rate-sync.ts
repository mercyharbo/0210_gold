import { DEFAULT_GOLD_RATES, type GoldRates } from '@/lib/products/gold-pricing'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export type StoreGoldRatesData = {
  rates: GoldRates
  lastUpdated: string | null
  source: 'live_api' | 'database' | 'default_fallback'
}

export async function getStoreGoldRates(): Promise<StoreGoldRatesData> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('store_settings')
      .select('gold_rate_18k, gold_rate_22k, gold_rate_24k, last_gold_rate_update')
      .maybeSingle()

    if (error || !data) {
      return {
        rates: DEFAULT_GOLD_RATES,
        lastUpdated: null,
        source: 'default_fallback',
      }
    }

    return {
      rates: {
        '18k': Number(data.gold_rate_18k) || DEFAULT_GOLD_RATES['18k'],
        '22k': Number(data.gold_rate_22k) || DEFAULT_GOLD_RATES['22k'],
        '24k': Number(data.gold_rate_24k) || DEFAULT_GOLD_RATES['24k'],
      },
      lastUpdated: data.last_gold_rate_update || null,
      source: 'database',
    }
  } catch {
    return {
      rates: DEFAULT_GOLD_RATES,
      lastUpdated: null,
      source: 'default_fallback',
    }
  }
}

export async function syncGoldRatesFromAPI(): Promise<{
  success: boolean
  message: string
  rates?: GoldRates
}> {
  const apiKey = process.env.GOLDAPI_API_KEY

  if (!apiKey) {
    return {
      success: false,
      message: 'GOLDAPI_API_KEY environment variable is not configured.',
    }
  }

  try {
    const response = await fetch('https://www.goldapi.io/api/XAU/NGN', {
      method: 'GET',
      headers: {
        'x-access-token': apiKey,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        message: `GoldAPI request failed (${response.status}): ${errorText}`,
      }
    }

    const data = await response.json()

    // GoldAPI returns price_gram_24k, price_gram_22k, price_gram_18k directly
    let rate24k = Number(data.price_gram_24k)
    let rate22k = Number(data.price_gram_22k)
    let rate18k = Number(data.price_gram_18k)

    // Fallback calculation from spot price if per-gram fields are absent
    if (!rate24k && data.price) {
      const ozPriceNGN = Number(data.price)
      rate24k = Math.round(ozPriceNGN / 31.1034768)
      rate22k = Math.round(rate24k * (22 / 24))
      rate18k = Math.round(rate24k * (18 / 24))
    }

    if (!rate24k || rate24k <= 0) {
      return {
        success: false,
        message: 'Invalid or missing gold prices in API response.',
      }
    }

    const newRates: GoldRates = {
      '18k': Math.round(rate18k),
      '22k': Math.round(rate22k),
      '24k': Math.round(rate24k),
    }

    const supabase = await createSupabaseServerClient()
    const { error: updateError } = await supabase
      .from('store_settings')
      .update({
        gold_rate_18k: newRates['18k'],
        gold_rate_22k: newRates['22k'],
        gold_rate_24k: newRates['24k'],
        last_gold_rate_update: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', '00000000-0000-0000-0000-000000000001')

    if (updateError) {
      return {
        success: false,
        message: `Failed to update database: ${updateError.message}`,
      }
    }

    return {
      success: true,
      message: 'Gold rates synced successfully from GoldAPI.io.',
      rates: newRates,
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to sync gold rates: ${err?.message || 'Network error'}`,
    }
  }
}
