import { z } from 'zod'

import {
  productColorOptions,
  productLabelOptions,
  productSizeOptions,
} from '@/lib/products/product-options'

const productStatuses = ['draft', 'active', 'archived'] as const
const productPricingTypes = ['fixed', 'starting_from', 'price_on_request'] as const

function optionalText(value: unknown) {
  if (value === 'none') {
    return undefined
  }

  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function parseInteger(value: unknown) {
  if (typeof value !== 'string') {
    return value
  }

  const cleaned = value.replace(/,/g, '').trim()

  return cleaned ? Number(cleaned) : undefined
}

function parseList(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (typeof value !== 'string') {
    return []
  }

  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export const createProductSchema = z
  .object({
    name: z.string().trim().min(1, 'enter the product name.'),
    slug: z
      .string()
      .trim()
      .min(1, 'enter the product slug.')
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'use a lowercase slug with words separated by hyphens.',
      ),
    categoryId: z.uuid('select a product category.'),
    pricingType: z.enum(productPricingTypes),
    price: z.preprocess(
      parseInteger,
      z.number().int('enter a whole naira amount.').positive('enter a price above zero.').optional(),
    ),
    stock: z.preprocess(
      parseInteger,
      z.number().int('enter a whole stock count.').min(0, 'stock cannot be negative.'),
    ),
    status: z.enum(productStatuses),
    description: z.string().trim().min(1, 'enter the product description.'),
    imageSrc: z
      .string()
      .trim()
      .min(1, 'upload a product image.')
      .refine(
        (value) => value.startsWith('/') || /^https?:\/\//.test(value),
        'upload a product image.',
      ),
    imageAlt: z.string().trim().min(1, 'enter image alt text.'),
    label: z.preprocess(
      optionalText,
      z.enum(productLabelOptions).optional(),
    ),
    sizes: z.preprocess(
      parseList,
      z.array(z.enum(productSizeOptions)).default([]),
    ),
    colors: z.preprocess(
      parseList,
      z.array(z.enum(productColorOptions)).default([]),
    ),
    details: z.preprocess(parseList, z.array(z.string()).default([])),
  })
  .transform((product) => ({
    ...product,
    label: product.label ?? null,
    price: product.pricingType === 'price_on_request' ? null : product.price ?? null,
  }))
  .superRefine((product, context) => {
    if (product.pricingType !== 'price_on_request' && product.price === null) {
      context.addIssue({
        code: 'custom',
        path: ['price'],
        message: 'enter a price for fixed or starting-from pricing.',
      })
    }
  })
