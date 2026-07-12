'use server'

import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from '@/lib/supabase/server'
import type { CartItem } from '@/stores/hooks/use-cart'

export type OrderActionResult = {
  success: boolean
  error?: string
  orderId?: string
}

export async function createOrderAction(
  shippingDetails: {
    customerName: string
    customerEmail: string
    customerPhone: string
    shippingAddress: string
    shippingCity: string
    shippingState: string
  },
  cartItems: CartItem[],
  password?: string
): Promise<OrderActionResult> {
  // Validate cart is not empty
  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: 'Your cart is empty.' }
  }

  // Get current authenticated user if any (optional for guest checkout)
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  let userId = user?.id || null

  // If password is provided and user is not authenticated, register them
  if (password && !userId) {
    const [firstName, ...lastNameParts] = shippingDetails.customerName.trim().split(' ')
    const lastName = lastNameParts.join(' ') || ''

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: shippingDetails.customerEmail,
      password: password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: shippingDetails.customerPhone,
        },
      },
    })

    if (signUpError) {
      console.error('Account registration during checkout failed:', signUpError)
      return {
        success: false,
        error: `Account registration failed: ${signUpError.message}`,
      }
    }

    if (signUpData?.user) {
      userId = signUpData.user.id
    }
  }

  // Calculate amounts
  const subtotal = cartItems.reduce(
    (total, item) => total + (item.product.price ?? 0) * item.quantity,
    0
  )
  const isOsogbo =
    shippingDetails.shippingCity.trim().toLowerCase() === 'osogbo'
  const delivery = isOsogbo ? 2000 : 5000
  const total = subtotal + delivery

  // Create order via admin client to bypass RLS for guest insertions
  const adminSupabase = createSupabaseAdminClient()

  // Insert Order
  const { data: order, error: orderError } = await adminSupabase
    .from('orders')
    .insert({
      user_id: userId,
      customer_name: shippingDetails.customerName,
      customer_email: shippingDetails.customerEmail,
      customer_phone: shippingDetails.customerPhone,
      shipping_address: shippingDetails.shippingAddress,
      shipping_city: shippingDetails.shippingCity,
      shipping_state: shippingDetails.shippingState,
      subtotal_amount: subtotal,
      delivery_amount: delivery,
      total_amount: total,
      payment_status: 'pending',
      status: 'pending',
    })
    .select('id')
    .single()

  if (orderError || !order) {
    console.error('Order creation failed:', orderError)
    return { success: false, error: 'Failed to place order. Please try again.' }
  }

  // Insert Order Items
  const orderItemsData = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.product.id,
    product_name: item.product.name,
    quantity: item.quantity,
    price: item.product.price ?? 0,
    selected_color: item.selectedColor || null,
    selected_size: item.selectedSize || null,
  }))

  const { error: itemsError } = await adminSupabase
    .from('order_items')
    .insert(orderItemsData)

  if (itemsError) {
    console.error('Order items insertion failed:', itemsError)
    // Rollback order insertion
    await adminSupabase.from('orders').delete().eq('id', order.id)
    return {
      success: false,
      error: 'Failed to save order details. Please try again.',
    }
  }

  return { success: true, orderId: order.id }
}
