import type { User } from '@supabase/supabase-js'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { CustomerAddress } from '@/types/address'
import type { CustomerProfile, ProfileUpdateInput } from '@/types/profile'

type ProfileRow = CustomerProfile
type AddressRow = CustomerAddress

export class CustomerProfileSetupError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CustomerProfileSetupError'
  }
}

function cleanOptional(value?: string) {
  const cleaned = value?.trim()
  return cleaned ? cleaned : null
}

function isMissingSupabaseRelation(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? ''

  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    message.includes('could not find the table') ||
    message.includes('relation') && message.includes('does not exist')
  )
}

function handleProfileReadError(error: { code?: string; message?: string }) {
  console.error('Customer profile read failed:', {
    code: error.code,
    message: error.message,
  })

  if (isMissingSupabaseRelation(error)) {
    throw new CustomerProfileSetupError(
      'Customer profile tables are not set up yet.',
    )
  }

  throw new Error('Unable to load customer profile.')
}

function handleAddressReadError(error: { code?: string; message?: string }) {
  console.error('Customer addresses read failed:', {
    code: error.code,
    message: error.message,
  })

  if (isMissingSupabaseRelation(error)) {
    throw new CustomerProfileSetupError(
      'Customer address tables are not set up yet.',
    )
  }

  throw new Error('Unable to load delivery addresses.')
}

function getUserMetadataString(user: User, key: string) {
  const value = user.user_metadata[key]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export async function ensureCustomerProfile(user: User) {
  const supabase = await createSupabaseServerClient()

  const { data: existingProfile, error: selectError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>()

  if (selectError) {
    handleProfileReadError(selectError)
  }

  if (existingProfile) {
    return existingProfile
  }

  const fullName = getUserMetadataString(user, 'full_name')
  const [fallbackFirstName, ...fallbackLastNameParts] = fullName?.split(' ') ?? []

  const { data: createdProfile, error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      first_name: getUserMetadataString(user, 'first_name') ?? fallbackFirstName ?? null,
      last_name:
        getUserMetadataString(user, 'last_name') ??
        (fallbackLastNameParts.join(' ') || null),
      phone: getUserMetadataString(user, 'phone'),
      email: user.email ?? null,
    })
    .select('*')
    .single<ProfileRow>()

  if (insertError) {
    console.error('Customer profile create failed:', {
      code: insertError.code,
      message: insertError.message,
    })

    if (isMissingSupabaseRelation(insertError)) {
      throw new CustomerProfileSetupError(
        'Customer profile tables are not set up yet.',
      )
    }

    throw new Error('Unable to create customer profile.')
  }

  return createdProfile
}

export async function getCustomerAddresses(userId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })
    .returns<AddressRow[]>()

  if (error) {
    handleAddressReadError(error)
  }

  return data ?? []
}

export async function updateCustomerProfile(
  user: User,
  input: ProfileUpdateInput,
) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    first_name: input.firstName,
    last_name: input.lastName,
    phone: cleanOptional(input.phone),
    email: user.email ?? null,
  })

  if (error) {
    throw new Error('Unable to update customer profile.')
  }
}

export async function clearDefaultAddress(userId: string) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('addresses')
    .update({ is_default: false })
    .eq('user_id', userId)
    .eq('is_default', true)

  if (error) {
    throw new Error('Unable to update default address.')
  }
}

export async function createCustomerAddress(
  userId: string,
  input: Omit<CustomerAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
) {
  const supabase = await createSupabaseServerClient()

  if (input.is_default) {
    await clearDefaultAddress(userId)
  }

  const { error } = await supabase.from('addresses').insert({
    user_id: userId,
    ...input,
  })

  if (error) {
    throw new Error('Unable to create delivery address.')
  }
}

export async function updateCustomerAddress(
  userId: string,
  addressId: string,
  input: Omit<CustomerAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
) {
  const supabase = await createSupabaseServerClient()

  if (input.is_default) {
    await clearDefaultAddress(userId)
  }

  const { error } = await supabase
    .from('addresses')
    .update(input)
    .eq('id', addressId)
    .eq('user_id', userId)

  if (error) {
    throw new Error('Unable to update delivery address.')
  }
}

export async function deleteCustomerAddress(userId: string, addressId: string) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', addressId)
    .eq('user_id', userId)

  if (error) {
    throw new Error('Unable to delete delivery address.')
  }
}

export async function setDefaultCustomerAddress(userId: string, addressId: string) {
  const supabase = await createSupabaseServerClient()

  await clearDefaultAddress(userId)

  const { error } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', addressId)
    .eq('user_id', userId)

  if (error) {
    throw new Error('Unable to set default delivery address.')
  }
}
