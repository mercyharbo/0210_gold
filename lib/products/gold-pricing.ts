import type { Product } from '@/components/index/shop/shop-data'

export type GoldKarat = '18k' | '22k' | '24k'

export type GoldRates = {
  '18k': number
  '22k': number
  '24k': number
}

export const DEFAULT_GOLD_RATES: GoldRates = {
  '18k': 133700,
  '22k': 163400,
  '24k': 178300,
}

export function normalizeKaratKey(karat: string): GoldKarat | null {
  const normalized = karat.toLowerCase().trim()
  if (normalized === '18k' || normalized === '18kt' || normalized === '18 karat' || normalized === '750') {
    return '18k'
  }
  if (normalized === '22k' || normalized === '22kt' || normalized === '22 karat' || normalized === '916') {
    return '22k'
  }
  if (normalized === '24k' || normalized === '24kt' || normalized === '24 karat' || normalized === '999') {
    return '24k'
  }
  return null
}

export function calculateGoldKaratUnitPrice(
  weightGrams: number,
  karat: string,
  rates: GoldRates = DEFAULT_GOLD_RATES,
  makingCharge = 0,
): number {
  const key = normalizeKaratKey(karat)
  if (!key || !rates[key]) {
    return 0
  }
  const perGramRate = rates[key]
  const rawPrice = weightGrams * perGramRate + (makingCharge || 0)
  return Math.round(rawPrice)
}

export function getProductKaratPrices(
  product: Product,
  rates: GoldRates = DEFAULT_GOLD_RATES,
): Record<GoldKarat, number | null> {
  const result: Record<GoldKarat, number | null> = {
    '18k': null,
    '22k': null,
    '24k': null,
  }

  if (!product.goldWeightGrams || product.goldWeightGrams <= 0) {
    return result
  }

  const karats = product.goldKarats && product.goldKarats.length > 0
    ? product.goldKarats
    : ['18k', '22k', '24k']

  for (const karat of karats) {
    const key = normalizeKaratKey(karat)
    if (key) {
      result[key] = calculateGoldKaratUnitPrice(
        product.goldWeightGrams,
        key,
        rates,
        product.makingCharge ?? 0,
      )
    }
  }

  return result
}

export function getEffectiveProductPrice(
  product: Product,
  selectedKarat?: string | null,
  rates: GoldRates = DEFAULT_GOLD_RATES,
): number | null {
  // If a specific karat is selected by the user and the product has gold weight
  if (selectedKarat && product.goldWeightGrams && product.goldWeightGrams > 0) {
    const calculated = calculateGoldKaratUnitPrice(
      product.goldWeightGrams,
      selectedKarat,
      rates,
      product.makingCharge ?? 0,
    )
    if (calculated > 0) return calculated
  }

  // Only calculate dynamic per-gram market pricing if explicitly enabled for this product
  if (product.isGoldKaratPriced && product.goldWeightGrams && product.goldWeightGrams > 0) {
    const karats = product.goldKarats && product.goldKarats.length > 0
      ? product.goldKarats
      : ['18k', '22k', '24k']
    const firstKarat = karats[0]
    if (firstKarat) {
      const calculated = calculateGoldKaratUnitPrice(
        product.goldWeightGrams,
        firstKarat,
        rates,
        product.makingCharge ?? 0,
      )
      if (calculated > 0) return calculated
    }
  }

  // Default to exact admin-set product.price
  return product.price
}
