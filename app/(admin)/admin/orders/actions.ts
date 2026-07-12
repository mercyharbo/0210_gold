'use server'

import { revalidatePath } from 'next/cache'

import { requireUser } from '@/lib/auth/session'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function updateOrderStatusAction(
  orderId: string,
  status: string,
  paymentStatus: string
) {
  const user = await requireUser('/login?error=Sign in to continue.')
  const supabase = await createSupabaseServerClient()

  // Verify user role is admin or super_admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
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
}
