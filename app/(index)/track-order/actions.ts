'use server'

import { createSupabaseAdminClient } from '@/lib/supabase/server'

export type TrackedOrderItem = {
  id: string
  product_name: string
  quantity: number
  price: number
  selected_color: string | null
  selected_size: string | null
}

export type TrackedOrder = {
  id: string
  order_number: number
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  shipping_city: string
  shipping_state: string
  subtotal_amount: number
  delivery_amount: number
  total_amount: number
  payment_status: string
  status: string
  created_at: string
  items: TrackedOrderItem[]
}

export type TrackOrderResult = {
  success: boolean
  error?: string
  order?: TrackedOrder
}

export async function trackOrderAction(
  orderReference: string,
  contactInfo: string
): Promise<TrackOrderResult> {
  const ref = orderReference?.trim()
  const contact = contactInfo?.trim().toLowerCase()

  if (!ref || !contact) {
    return {
      success: false,
      error: 'Please enter both your order reference and contact email or phone.',
    }
  }

  const adminSupabase = createSupabaseAdminClient()

  // Extract numeric order number if present (e.g., "FML-5482" -> 5482, "#1001" -> 1001)
  const numericMatch = ref.match(/\d+/)
  const orderNumber = numericMatch ? parseInt(numericMatch[0], 10) : null

  // Check UUID format
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ref)

  let query = adminSupabase.from('orders').select('*')

  if (isUuid) {
    query = query.eq('id', ref)
  } else if (orderNumber !== null && !isNaN(orderNumber)) {
    query = query.eq('order_number', orderNumber)
  } else {
    return {
      success: false,
      error: 'Invalid order reference format. Please enter your order number (e.g. 1001 or FML-1001).',
    }
  }

  const { data: matchedOrders, error: orderErr } = await query

  if (orderErr || !matchedOrders || matchedOrders.length === 0) {
    return {
      success: false,
      error: 'No order found matching the provided order reference.',
    }
  }

  // Verify contact info (email or phone)
  const matchedOrder = matchedOrders.find((ord) => {
    const emailMatch = ord.customer_email?.trim().toLowerCase() === contact
    const phoneMatch =
      ord.customer_phone?.trim().replace(/[\s\-\+]/g, '') === contact.replace(/[\s\-\+]/g, '')
    return emailMatch || phoneMatch
  })

  if (!matchedOrder) {
    return {
      success: false,
      error: 'Order number found, but email/phone does not match the customer details on file.',
    }
  }

  // Fetch order items
  const { data: itemsData } = await adminSupabase
    .from('order_items')
    .select('*')
    .eq('order_id', matchedOrder.id)

  const items: TrackedOrderItem[] = (itemsData || []).map((i) => ({
    id: i.id,
    product_name: i.product_name,
    quantity: i.quantity,
    price: Number(i.price),
    selected_color: i.selected_color,
    selected_size: i.selected_size,
  }))

  const trackedOrder: TrackedOrder = {
    id: matchedOrder.id,
    order_number: matchedOrder.order_number,
    customer_name: matchedOrder.customer_name,
    customer_email: matchedOrder.customer_email,
    customer_phone: matchedOrder.customer_phone,
    shipping_address: matchedOrder.shipping_address,
    shipping_city: matchedOrder.shipping_city,
    shipping_state: matchedOrder.shipping_state,
    subtotal_amount: Number(matchedOrder.subtotal_amount),
    delivery_amount: Number(matchedOrder.delivery_amount),
    total_amount: Number(matchedOrder.total_amount),
    payment_status: matchedOrder.payment_status,
    status: matchedOrder.status,
    created_at: matchedOrder.created_at,
    items,
  }

  return {
    success: true,
    order: trackedOrder,
  }
}
