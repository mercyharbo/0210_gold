import { z } from 'zod'

export const profileUpdateSchema = z.object({
  firstName: z.string().trim().min(1, 'Enter your first name.'),
  lastName: z.string().trim().min(1, 'Enter your last name.'),
  phone: z.string().trim().optional(),
  preferenceCategoryIds: z.array(z.uuid()).default([]),
})

export const addressSchema = z.object({
  label: z.string().trim().optional(),
  recipientName: z.string().trim().min(1, 'Enter the recipient name.'),
  phone: z.string().trim().min(1, 'Enter a delivery phone number.'),
  addressLine1: z.string().trim().min(1, 'Enter the street address.'),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(1, 'Enter the city.'),
  state: z.string().trim().min(1, 'Enter the state.'),
  country: z.string().trim().min(1, 'Enter the country.').default('Nigeria'),
  postalCode: z.string().trim().optional(),
  deliveryNotes: z.string().trim().optional(),
  isDefault: z.boolean().default(false),
})

export function getCheckboxValue(value: FormDataEntryValue | null) {
  return value === 'on' || value === 'true'
}
