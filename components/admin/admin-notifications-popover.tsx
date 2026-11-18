'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import {
  deleteNotificationAction, getAdminNotificationsAction,
  markAllNotificationsAsReadAction, markNotificationAsReadAction,
  type AdminNotification,
} from '@/lib/notifications/actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type Props = {
  initialNotifications?: AdminNotification[]
  initialUnreadCount?: number
}

/** Legacy server-action transport stays in place until the separate API integration. */
export function AdminNotificationsPopover({ initialNotifications = [], initialUnreadCount = 0 }: Props) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  async function refresh() {
    const result = await getAdminNotificationsAction()
    setNotifications(result.notifications)
    setUnreadCount(result.unreadCount)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      void getAdminNotificationsAction().then((result) => {
        setNotifications(result.notifications)
        setUnreadCount(result.unreadCount)
      }).catch(() => setError('Unable to refresh notifications.'))
    }, 25000)
    return () => clearInterval(timer)
  }, [])

  function update(action: () => Promise<unknown>) {
    setError(null)
    startTransition(async () => {
      try {
        const result = await action()
        if (typeof result === 'object' && result !== null && 'success' in result && result.success === false) {
          throw new Error('The change was rejected.')
        }
      } catch {
        setError('The notification change could not be saved. Try again.')
        return
      }
      try {
        await refresh()
      } catch {
        setError('Saved, but notifications could not refresh. Reopen this panel.')
      }
    })
  }

  return (
    <Popover open={open} onOpenChange={(next) => {
      setOpen(next)
      if (next) void refresh().catch(() => setError('Unable to refresh notifications.'))
    }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications: ${unreadCount} unread`}>
          <Bell />
          {unreadCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-gold px-1 text-xs text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 max-w-full p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <h2 className="font-heading text-base font-semibold">Notifications</h2>
          <Button variant="ghost" size="sm" disabled={pending || unreadCount === 0} onClick={() => update(markAllNotificationsAsReadAction)}>
            <CheckCheck data-icon="inline-start" /> Read all
          </Button>
        </div>
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        <div className="flex max-h-96 flex-col divide-y divide-border overflow-y-auto">
          {notifications.length ? notifications.map((item) => (
            <article key={item.id} className="flex min-w-0 flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold">{item.title}</h3>
                {!item.is_read && <span className="text-xs text-gold">Unread</span>}
              </div>
              <p className="break-words text-sm text-muted-foreground">{item.message}</p>
              <div className="flex flex-wrap items-center gap-2">
                {item.link && <Button asChild variant="link" size="sm"><Link href={item.link} onClick={() => setOpen(false)}>View details</Link></Button>}
                {!item.is_read && <Button variant="ghost" size="sm" disabled={pending} onClick={() => update(() => markNotificationAsReadAction(item.id))}>Mark read</Button>}
                <Button variant="ghost" size="icon" disabled={pending} aria-label={`Delete notification: ${item.title}`} onClick={() => update(() => deleteNotificationAction(item.id))}><Trash2 /></Button>
              </div>
            </article>
          )) : <p className="p-6 text-sm text-muted-foreground">No store notifications.</p>}
        </div>
      </PopoverContent>
    </Popover>
  )
}
