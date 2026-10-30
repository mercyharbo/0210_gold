import { z } from 'zod'
import type { CatalogBanner, CatalogCategory, CatalogKind, CatalogProduct } from '@/types/catalog'

export const catalogDraftSchema = z.object({
  name: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  category_id: z.string(),
  category_type: z.string(),
  pricing_type: z.string(),
  price: z.string(),
  stock: z.string(),
  status: z.string(),
  label: z.string(),
  details: z.string(),
  sizes: z.string(),
  colors: z.string(),
  gold_karats: z.string(),
  gold_weight_grams: z.string(),
  making_charge: z.string(),
  note: z.string(),
  route: z.string(),
  sort_order: z.string(),
  featured_sort_order: z.string(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  is_gold_karat_priced: z.boolean(),
  images: z.array(
    z.object({
      media_id: z.string().uuid(),
      alt: z.string().min(1, 'Enter image alt text.'),
      url: z.string(),
    }),
  ),
})
export type CatalogDraft = z.infer<typeof catalogDraftSchema>
export function editorSchema(kind: CatalogKind) {
  return catalogDraftSchema.superRefine((draft, context) => {
    const invalid = (field: keyof CatalogDraft, message: string) =>
      context.addIssue({ code: 'custom', path: [field], message })
    const required =
      kind === 'banners' ? (['title', 'description', 'route'] as const) : (['name', 'slug'] as const)
    for (const field of required) if (!draft[field].trim()) invalid(field, 'This field is required.')
    if (kind !== 'banners' && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug))
      invalid('slug', 'Use lowercase words separated by hyphens.')
    if (kind === 'products') {
      if (!draft.category_id) invalid('category_id', 'Choose a category.')
      if (!draft.description.trim()) invalid('description', 'Enter the product description.')
      if (!/^\d+$/.test(draft.stock)) invalid('stock', 'Enter a nonnegative whole stock count.')
      if (draft.pricing_type !== 'price_on_request') {
        if (!draft.is_gold_karat_priced && !(Number(draft.price) > 0))
          invalid('price', 'Enter a price above zero.')
        if (draft.is_gold_karat_priced && !(Number(draft.gold_weight_grams) > 0))
          invalid('gold_weight_grams', 'Enter gold weight above zero.')
        if (draft.is_gold_karat_priced && !draft.gold_karats.trim())
          invalid('gold_karats', 'Choose at least one karat.')
      }
      if (draft.status === 'active' && !draft.images.length)
        invalid('images', 'Active products require an image.')
    }
    if (kind === 'banners' && !draft.images.length) invalid('images', 'Upload a banner image.')
    if (kind === 'categories' && draft.is_featured) {
      if (!draft.description.trim()) invalid('description', 'Featured collections require a description.')
      if (!draft.images.length) invalid('images', 'Featured collections require an image.')
    }
  })
}
export type CatalogRecord = CatalogProduct | CatalogCategory | CatalogBanner
export const defaultDraft: CatalogDraft = {
  name: '',
  title: '',
  slug: '',
  description: '',
  category_id: '',
  category_type: 'Gold',
  pricing_type: 'fixed',
  price: '',
  stock: '0',
  status: 'draft',
  label: '',
  details: '',
  sizes: '',
  colors: '',
  gold_karats: '',
  gold_weight_grams: '',
  making_charge: '0',
  note: '',
  route: '/shop',
  sort_order: '0',
  featured_sort_order: '0',
  is_active: true,
  is_featured: false,
  is_gold_karat_priced: false,
  images: [],
}
export function draftFromRecord(record?: CatalogRecord): CatalogDraft {
  if (!record) return { ...defaultDraft }
  const draft = { ...defaultDraft, images: record.images.map((image) => ({ ...image })) }
  for (const key of Object.keys(defaultDraft) as (keyof CatalogDraft)[]) {
    if (key === 'images' || !(key in record)) continue
    const value: unknown = record[key as keyof CatalogRecord]
    if (typeof value === 'boolean') Object.assign(draft, { [key]: value })
    else
      Object.assign(draft, {
        [key]: Array.isArray(value)
          ? value.join(key === 'details' ? '\n' : ', ')
          : value == null
            ? ''
            : String(value),
      })
  }
  return draft
}
const list = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
export function catalogPayload(kind: CatalogKind, draft: CatalogDraft) {
  const images = draft.images.map(({ media_id, alt }) => ({ media_id, alt }))
  if (kind === 'categories')
    return {
      name: draft.name,
      slug: draft.slug,
      description: draft.description || null,
      category_type: draft.category_type,
      is_active: draft.is_active,
      is_featured: draft.is_featured,
      sort_order: Number(draft.sort_order),
      featured_sort_order: Number(draft.featured_sort_order),
      images,
    }
  if (kind === 'banners')
    return {
      title: draft.title,
      description: draft.description,
      route: draft.route,
      is_active: draft.is_active,
      sort_order: Number(draft.sort_order),
      images,
    }
  return {
    name: draft.name,
    slug: draft.slug,
    description: draft.description,
    category_id: draft.category_id,
    pricing_type: draft.pricing_type,
    price: draft.price || null,
    stock: Number(draft.stock),
    status: draft.status,
    label: draft.label || null,
    details: draft.details
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean),
    sizes: list(draft.sizes),
    colors: list(draft.colors),
    gold_karats: list(draft.gold_karats),
    gold_weight_grams: draft.gold_weight_grams || null,
    making_charge: draft.making_charge || '0',
    is_gold_karat_priced: draft.is_gold_karat_priced,
    note: draft.note || null,
    images,
  }
}
