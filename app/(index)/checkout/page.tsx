import {
  ensureCustomerProfile,
  getCustomerAddresses,
} from '@/lib/profile/customer-profile'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { CustomerAddress } from '@/types/address'
import type { CustomerProfile } from '@/types/profile'
import { CheckoutForm } from './checkout-form'

export default async function CheckoutPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let initialProfile: CustomerProfile | null = null
  let initialAddresses: CustomerAddress[] = []

  if (user) {
    try {
      initialProfile = await ensureCustomerProfile(user)
      initialAddresses = await getCustomerAddresses(user.id)
    } catch (e) {
      console.error('Failed to load user profile in checkout:', e)
    }
  }

  return (
    <CheckoutForm
      initialProfile={initialProfile}
      initialAddresses={initialAddresses}
    />
  )
}
