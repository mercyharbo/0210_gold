export type CustomerAddress = {
  id: string
  user_id: string
  label: string | null
  recipient_name: string | null
  phone: string | null
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  state: string | null
  country: string
  postal_code: string | null
  delivery_notes: string | null
  is_default: boolean
  created_at: string
  updated_at: string
}

export type AddressFormInput = {
  label?: string
  recipientName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  country: string
  postalCode?: string
  deliveryNotes?: string
  isDefault: boolean
}
