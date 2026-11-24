import { z } from 'zod'
import type { components } from '@/types/api-schema'
import type { CatalogProduct } from '@/types/catalog'
import { productColorOptions, productKaratOptions, productLabelOptions, productSizeOptions } from '@/lib/products/product-options'

const money = /^\d{1,14}(\.\d{1,2})?$/
const weight = /^\d{1,9}(\.\d{1,3})?$/
export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter a product name.').max(200),
  slug: z.string().max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase words separated by hyphens.'),
  description: z.string().trim().min(1, 'Enter a description.').max(20000),
  category_id: z.string().min(1, 'Choose a category.'),
  pricing_type: z.enum(['', 'fixed', 'starting_from']),
  price: z.string(),
  is_gold_karat_priced: z.boolean(),
  gold_weight_grams: z.string(),
  making_charge: z.string().regex(money, 'Enter a nonnegative NGN amount with up to 2 decimal places.'),
  stock: z.number().int('Enter a whole stock count.').nonnegative('Stock cannot be negative.'),
  status: z.enum(['draft', 'active', 'archived']),
  label: z.enum(['', ...productLabelOptions]),
  sizes: z.array(z.enum(productSizeOptions)),
  colors: z.array(z.enum(productColorOptions)),
  gold_karats: z.array(z.enum(productKaratOptions)).max(3),
  details: z.string(),
  note: z.string().max(5000),
  images: z.array(z.object({
    media_id: z.string().uuid(), url: z.string().url(),
    alt: z.string().trim().min(1, 'Describe this image.').max(300),
  })).max(8, 'Use at most 8 images.'),
}).superRefine((values, context) => {
  const invalid = (field: keyof typeof values, message: string) => context.addIssue({ code: 'custom', path: [field], message })
  if (!values.pricing_type) invalid('pricing_type', 'Choose supported price presentation before saving.')
  if (!values.is_gold_karat_priced && (!money.test(values.price) || Number(values.price) <= 0))
    invalid('price', 'Enter a positive NGN price with up to 2 decimal places.')
  if (values.is_gold_karat_priced) {
    if (!weight.test(values.gold_weight_grams) || Number(values.gold_weight_grams) <= 0)
      invalid('gold_weight_grams', 'Enter a positive weight with up to 3 decimal places.')
    if (!values.gold_karats.length) invalid('gold_karats', 'Choose at least one karat for gold-rate pricing.')
  } else if (values.gold_weight_grams && (!weight.test(values.gold_weight_grams) || Number(values.gold_weight_grams) <= 0)) {
    invalid('gold_weight_grams', 'Enter a positive weight or leave it blank.')
  }
  if (values.pricing_type === 'starting_from' && (!values.is_gold_karat_priced || values.gold_karats.length < 2))
    invalid('pricing_type', 'Starting from requires gold-rate pricing and at least two karats.')
  if (values.status === 'active' && !values.images.length) invalid('images', 'Published products require an image.')
  for (const name of ['sizes', 'colors', 'gold_karats'] as const)
    if (new Set(values[name]).size !== values[name].length) invalid(name, 'Choose each option only once.')
  const details = values.details.split('\n').map((line) => line.trim()).filter(Boolean)
  if (details.length > 30 || details.some((line) => line.length > 500)) invalid('details', 'Use up to 30 details, each no longer than 500 characters.')
})

export type ProductFormValues = z.infer<typeof productFormSchema>
export type ProductWrite = components['schemas']['ProductBody']

export function productFormValues(product?: CatalogProduct): ProductFormValues {
  return {
    name: product?.name ?? '', slug: product?.slug ?? '', description: product?.description ?? '',
    category_id: product?.category_id ?? '',
    pricing_type: product?.pricing_type === 'price_on_request' ? '' : product?.pricing_type ?? 'fixed',
    price: product?.price == null ? '' : String(product.price),
    is_gold_karat_priced: product?.is_gold_karat_priced ?? false,
    gold_weight_grams: product?.gold_weight_grams == null ? '' : String(product.gold_weight_grams),
    making_charge: String(product?.making_charge ?? '0'), stock: product?.stock ?? 0,
    status: product?.status ?? 'draft', label: product?.label ?? '',
    sizes: [...(product?.sizes ?? [])], colors: [...(product?.colors ?? [])], gold_karats: [...(product?.gold_karats ?? [])],
    details: product?.details?.join('\n') ?? '', note: product?.note ?? '',
    images: product?.images.map(({ media_id, url, alt }) => ({ media_id, url, alt })) ?? [],
  }
}

export function productPayload(values: ProductFormValues): ProductWrite {
  if (!values.pricing_type) throw new Error('Choose a price presentation.')
  return {
    ...values, pricing_type: values.pricing_type,
    price: values.is_gold_karat_priced ? null : values.price || null, gold_weight_grams: values.gold_weight_grams || null,
    note: values.note.trim() || null, label: values.label || null,
    details: values.details.split('\n').map((line) => line.trim()).filter(Boolean),
    images: values.images.map(({ media_id, alt }) => ({ media_id, alt })),
  }
}
