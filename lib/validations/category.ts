import { z } from 'zod'

import { categoryTypeOptions } from '@/lib/categories/category-options'

function optionalNullableText(value: unknown) {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()

  return trimmed ? trimmed : null
}

function parseBoolean(value: unknown) {
  return value === 'on' || value === 'true' || value === true
}

function parseInteger(value: unknown) {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()

  return trimmed ? Number(trimmed) : 0
}

export const categoryFormSchema = z
  .object({
    name: z.string().trim().min(1, 'enter the category title.'),
    slug: z
      .string()
      .trim()
      .min(1, 'enter the category slug.')
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'use a lowercase slug with words separated by hyphens.',
      ),
    categoryType: z.enum(categoryTypeOptions),
    description: z.preprocess(optionalNullableText, z.string().nullable()),
    imageSrc: z.preprocess(optionalNullableText, z.string().nullable()),
    imageAlt: z.preprocess(optionalNullableText, z.string().nullable()),
    isActive: z.preprocess(parseBoolean, z.boolean()),
    isFeatured: z.preprocess(parseBoolean, z.boolean()),
    sortOrder: z.preprocess(
      parseInteger,
      z.number().int('enter a whole sort order.').min(0, 'sort order cannot be negative.'),
    ),
    featuredSortOrder: z.preprocess(
      parseInteger,
      z.number().int('enter a whole featured sort order.').min(0, 'featured sort order cannot be negative.'),
    ),
  })
  .superRefine((category, context) => {
    if (category.isFeatured && !category.description) {
      context.addIssue({
        code: 'custom',
        path: ['description'],
        message: 'enter a description for featured category cards.',
      })
    }

    if (category.isFeatured && !category.imageSrc) {
      context.addIssue({
        code: 'custom',
        path: ['imageSrc'],
        message: 'upload an image for featured category cards.',
      })
    }

    if (category.imageSrc && !category.imageAlt) {
      context.addIssue({
        code: 'custom',
        path: ['imageAlt'],
        message: 'enter image alt text for the category image.',
      })
    }
  })
