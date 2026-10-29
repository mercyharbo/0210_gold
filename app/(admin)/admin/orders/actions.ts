'use server'

import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/lib/auth/session'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server'

export async function updateOrderStatusAction(
  orderId: string,
  status: string,
  paymentStatus: string
) {
  await requireAdmin()

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('orders')
    .update({
      status,
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (error) {
    throw new Error(error.message || 'Failed to update order.')
  }

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/track-order')
}

export async function bulkUpdateOrdersAction(
  orderIds: string[],
  updates: { status?: string; paymentStatus?: string }
) {
  await requireAdmin()

  const supabase = createSupabaseAdminClient()

  const payload: Record<string, string> = {
    updated_at: new Date().toISOString(),
  }

  if (updates.status) payload.status = updates.status
  if (updates.paymentStatus) payload.payment_status = updates.paymentStatus

  const { error } = await supabase
    .from('orders')
    .update(payload)
    .in('id', orderIds)

  if (error) {
    throw new Error(error.message || 'Failed to update selected orders.')
  }

  revalidatePath('/admin/orders')
  revalidatePath('/track-order')
}
