'use server'

import { revalidatePath } from 'next/cache'

import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'

export type AdminNotification = {
  id: string
  title: string
  message: string
  type: 'order' | 'review' | 'low_stock' | 'system'
  link?: string | null
  is_read: boolean
  created_at: string
}

export async function getAdminNotificationsAction(): Promise<{
  notifications: AdminNotification[]
  unreadCount: number
}> {
  await requireAdmin()
  const supabase = createSupabaseAdminClient()

  try {
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .in('type', ['order', 'review', 'low_stock', 'system'])
      .order('created_at', { ascending: false })
      .limit(30)

    if (error) {
      return { notifications: [], unreadCount: 0 }
    }

    const notifications: AdminNotification[] = (data || []).map((item) => ({
      id: item.id,
      title: item.title,
      message: item.message,
      type: item.type as AdminNotification['type'],
      link: item.link || null,
      is_read: Boolean(item.is_read),
      created_at: item.created_at,
    }))

    const unreadCount = notifications.filter((n) => !n.is_read).length

    return { notifications, unreadCount }
  } catch {
    return { notifications: [], unreadCount: 0 }
  }
}

export async function markNotificationAsReadAction(id: string) {
  await requireAdmin()
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from('admin_notifications')
    .update({ is_read: true })
    .eq('id', id)

  if (error) {
    return { success: false }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function markAllNotificationsAsReadAction() {
  await requireAdmin()
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from('admin_notifications')
    .update({ is_read: true })
    .eq('is_read', false)

  if (error) {
    return { success: false }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function deleteNotificationAction(id: string) {
  await requireAdmin()
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from('admin_notifications')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function createAdminNotificationAction(payload: {
  title: string
  message: string
  type: AdminNotification['type']
  link?: string
}) {
  const supabase = createSupabaseAdminClient()

  try {
    const { error } = await supabase.from('admin_notifications').insert({
      title: payload.title,
      message: payload.message,
      type: payload.type,
      link: payload.link || null,
      is_read: false,
    })

    if (error) return { success: false }
    return { success: true }
  } catch {
    return { success: false }
  }
}
