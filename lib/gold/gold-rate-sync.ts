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
