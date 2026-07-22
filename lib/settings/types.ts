export type StoreSettingsRecord = {
  id: string
  store_name: string
  support_email: string
  support_phone: string
  store_address: string
  business_hours: string
  primary_currency: string
  gbp_rate: number
  usd_rate: number
  local_shipping_fee: number
  uk_shipping_rate_per_kg: number
  free_shipping_threshold: number
  paystack_mode: string
  order_email_notifications: boolean
  request_email_notifications: boolean
  low_stock_alerts: boolean
  session_expiry_days: number
  mfa_required: boolean
}

export const defaultStoreSettings: StoreSettingsRecord = {
  id: '00000000-0000-0000-0000-000000000001',
  store_name: 'FM Luxe Jewelry & Personal Shopping',
  support_email: 'support@fmluxe.com',
  support_phone: '+234 800 000 0000',
  store_address: 'Victoria Island, Lagos, Nigeria',
  business_hours: 'Mon - Sat: 9:00 AM - 6:00 PM',
  primary_currency: 'NGN',
  gbp_rate: 2200,
  usd_rate: 1600,
  local_shipping_fee: 5000,
  uk_shipping_rate_per_kg: 15000,
  free_shipping_threshold: 10000000,
  paystack_mode: 'sandbox',
  order_email_notifications: true,
  request_email_notifications: true,
  low_stock_alerts: true,
  session_expiry_days: 7,
  mfa_required: false,
}
