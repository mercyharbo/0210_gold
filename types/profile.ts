export type CustomerProfile = {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  email: string | null
  preferences: string[]
  created_at: string
  updated_at: string
}

export type ProfileUpdateInput = {
  firstName: string
  lastName: string
  phone?: string
  preferenceCategoryIds?: string[]
}
