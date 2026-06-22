'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireUser } from '@/lib/auth/session'
import {
  createCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
  updateCustomerAddress,
  updateCustomerProfile,
} from '@/lib/profile/customer-profile'
import {
  addressSchema,
  getCheckboxValue,
  parsePreferences,
  profileUpdateSchema,
} from '@/lib/validations/profile'

function optionalText(value?: string) {
  const cleaned = value?.trim()
  return cleaned ? cleaned : null
}

function redirectWithError(message: string): never {
  redirect(`/profile?error=${encodeURIComponent(message)}`)
}

function redirectWithMessage(message: string): never {
  redirect(`/profile?message=${encodeURIComponent(message)}`)
}

export async function updateProfileDetails(formData: FormData) {
  const user = await requireUser('/login?error=Sign in to continue.')

  const parsed = profileUpdateSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    phone: formData.get('phone'),
    preferences: parsePreferences(formData.get('preferences')),
  })

  if (!parsed.success) {
    redirectWithError(parsed.error.issues[0]?.message ?? 'Check your profile details.')
  }

  await updateCustomerProfile(user, parsed.data)
  revalidatePath('/profile')
  redirectWithMessage('Profile updated successfully.')
}

export async function createAddress(formData: FormData) {
  const user = await requireUser('/login?error=Sign in to continue.')

  const parsed = addressSchema.safeParse({
    label: formData.get('label'),
    recipientName: formData.get('recipientName'),
    phone: formData.get('phone'),
    addressLine1: formData.get('addressLine1'),
    addressLine2: formData.get('addressLine2'),
    city: formData.get('city'),
    state: formData.get('state'),
    country: formData.get('country') || 'Nigeria',
    postalCode: formData.get('postalCode'),
    deliveryNotes: formData.get('deliveryNotes'),
    isDefault: getCheckboxValue(formData.get('isDefault')),
  })

  if (!parsed.success) {
    redirectWithError(parsed.error.issues[0]?.message ?? 'Check the address details.')
  }

  await createCustomerAddress(user.id, {
    label: optionalText(parsed.data.label),
    recipient_name: parsed.data.recipientName,
    phone: parsed.data.phone,
    address_line_1: parsed.data.addressLine1,
    address_line_2: optionalText(parsed.data.addressLine2),
    city: parsed.data.city,
    state: parsed.data.state,
    country: parsed.data.country,
    postal_code: optionalText(parsed.data.postalCode),
    delivery_notes: optionalText(parsed.data.deliveryNotes),
    is_default: parsed.data.isDefault,
  })

  revalidatePath('/profile')
  redirectWithMessage('Address added successfully.')
}

export async function updateAddress(addressId: string, formData: FormData) {
  const user = await requireUser('/login?error=Sign in to continue.')

  const parsed = addressSchema.safeParse({
    label: formData.get('label'),
    recipientName: formData.get('recipientName'),
    phone: formData.get('phone'),
    addressLine1: formData.get('addressLine1'),
    addressLine2: formData.get('addressLine2'),
    city: formData.get('city'),
    state: formData.get('state'),
    country: formData.get('country') || 'Nigeria',
    postalCode: formData.get('postalCode'),
    deliveryNotes: formData.get('deliveryNotes'),
    isDefault: getCheckboxValue(formData.get('isDefault')),
  })

  if (!parsed.success) {
    redirectWithError(parsed.error.issues[0]?.message ?? 'Check the address details.')
  }

  await updateCustomerAddress(user.id, addressId, {
    label: optionalText(parsed.data.label),
    recipient_name: parsed.data.recipientName,
    phone: parsed.data.phone,
    address_line_1: parsed.data.addressLine1,
    address_line_2: optionalText(parsed.data.addressLine2),
    city: parsed.data.city,
    state: parsed.data.state,
    country: parsed.data.country,
    postal_code: optionalText(parsed.data.postalCode),
    delivery_notes: optionalText(parsed.data.deliveryNotes),
    is_default: parsed.data.isDefault,
  })

  revalidatePath('/profile')
  redirectWithMessage('Address updated successfully.')
}

export async function deleteAddress(addressId: string) {
  const user = await requireUser('/login?error=Sign in to continue.')

  await deleteCustomerAddress(user.id, addressId)
  revalidatePath('/profile')
  redirectWithMessage('Address deleted successfully.')
}

export async function setDefaultAddress(addressId: string) {
  const user = await requireUser('/login?error=Sign in to continue.')

  await setDefaultCustomerAddress(user.id, addressId)
  revalidatePath('/profile')
  redirectWithMessage('Default address updated.')
}
