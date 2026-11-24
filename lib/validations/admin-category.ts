import { z } from 'zod'
import type { CatalogCategory } from '@/types/catalog'

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter a category name.').max(150),
  slug: z.string().max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase words separated by hyphens.'),
  category_type: z.enum(['Fashion', 'Gold', 'Accessories', 'Bags', 'Footwear', 'Modest Wear']),
  description: z.string().max(5000),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  sort_order: z.number().int().nonnegative(),
  featured_sort_order: z.number().int().nonnegative(),
  images: z.array(z.object({
    media_id: z.string().uuid(),
    alt: z.string().trim().min(1, 'Describe the image.').max(300),
    url: z.string().url(),
  })).max(1),
}).superRefine((values, context) => {
  if (!values.is_featured) return
  if (!values.description.trim()) context.addIssue({ code: 'custom', path: ['description'], message: 'Featured collections require a description.' })
  if (!values.images.length) context.addIssue({ code: 'custom', path: ['images'], message: 'Featured collections require an image.' })
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>

export function categoryFormValues(category?: CatalogCategory): CategoryFormValues {
  return {
    name: category?.name ?? '', slug: category?.slug ?? '',
    category_type: category?.category_type ?? 'Gold', description: category?.description ?? '',
    is_active: category?.is_active ?? true, is_featured: category?.is_featured ?? false,
    sort_order: category?.sort_order ?? 0, featured_sort_order: category?.featured_sort_order ?? 0,
    images: category?.images.map(({ media_id, alt, url }) => ({ media_id, alt, url })) ?? [],
  }
}
