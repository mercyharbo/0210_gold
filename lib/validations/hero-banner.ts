import { z } from 'zod'

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

export const heroBannerFormSchema = z.object({
  title: z.string().trim().min(1, 'Enter the banner title.'),
  description: z.string().trim().min(1, 'Enter the banner description.'),
  imageSrc: z.string().trim().min(1, 'Upload a banner image.'),
  route: z.string().trim().min(1, 'Enter the website route.'),
  isActive: z.preprocess(parseBoolean, z.boolean()),
  sortOrder: z.preprocess(
    parseInteger,
    z.number().int('Enter a whole sort order.').min(0, 'Sort order cannot be negative.'),
  ),
})
