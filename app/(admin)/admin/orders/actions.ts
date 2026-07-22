'use server'

import { revalidatePath } from 'next/cache'

import { requireUser } from '@/lib/auth/session'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server'

export async function updateOrderStatusAction(
  orderId: string,
  status: string,
  paymentStatus: string
) {
  const user = await requireUser('/login?error=Sign in to continue.')
  if (!user) {
    throw new Error('Unauthorized: Authentication required.')
  }

  const supabase = await createSupabaseServerClient()

  // Verify user role is admin or super_admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (process.env.NODE_ENV !== 'development' && (!profile || !['admin', 'super_admin'].includes(profile.role))) {
    throw new Error('Unauthorized: Admin access required.')
  }

  const { error } = await supabase
    .from('orders')
    .update({
      status,
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (error) {
    console.error('Failed to update order status:', error)
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
  const user = await requireUser('/login?error=Sign in to continue.')
  if (!user) {
    throw new Error('Unauthorized: Authentication required.')
  }

  const supabase = createSupabaseAdminClient()

  const payload: Record<string, any> = {
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
