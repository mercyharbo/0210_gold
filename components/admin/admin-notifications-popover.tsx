'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  ChevronRight,
  Clock,
  Package,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react'

import {
  deleteNotificationAction,
  getAdminNotificationsAction,
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
  type AdminNotification,
} from '@/lib/notifications/actions'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type AdminNotificationsPopoverProps = {
  initialNotifications?: AdminNotification[]
  initialUnreadCount?: number
}

function formatRelativeTime(dateString: string): string {
  try {
    const now = Date.now()
    const past = new Date(dateString).getTime()
    const diffInSec = Math.floor((now - past) / 1000)

    if (diffInSec < 60) return 'Just now'
    if (diffInSec < 3600) return `${Math.floor(diffInSec / 60)}m ago`
    if (diffInSec < 86400) return `${Math.floor(diffInSec / 3600)}h ago`
    return `${Math.floor(diffInSec / 86400)}d ago`
  } catch {
    return 'Recently'
  }
}

function getNotificationIcon(type: AdminNotification['type']) {
  switch (type) {
    case 'order':
      return <ShoppingBag className='size-4 text-emerald-600' />
    case 'personal_shopper':
      return <Sparkles className='size-4 text-gold' />
    case 'review':
      return <Star className='size-4 text-amber-500 fill-amber-500/20' />
    case 'low_stock':
      return <AlertTriangle className='size-4 text-rose-500' />
    default:
      return <Bell className='size-4 text-blue-500' />
  }
}

export function AdminNotificationsPopover({
  initialNotifications = [],
  initialUnreadCount = 0,
}: AdminNotificationsPopoverProps) {
  const [notifications, setNotifications] = useState<AdminNotification[]>(initialNotifications)
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount)
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const fetchLatestNotifications = async () => {
    try {
      const res = await getAdminNotificationsAction()
      setNotifications(res.notifications)
      setUnreadCount(res.unreadCount)
    } catch (e) {
      console.warn('Error fetching notifications:', e)
    }
  }

  // Poll for new notifications every 25 seconds
  useEffect(() => {
    fetchLatestNotifications()
    const interval = setInterval(fetchLatestNotifications, 25000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))

    startTransition(async () => {
      await markNotificationAsReadAction(id)
    })
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)

    startTransition(async () => {
      await markAllNotificationsAsReadAction()
    })
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    e.preventDefault()

    const target = notifications.find((n) => n.id === id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    if (target && !target.is_read) {
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }

    startTransition(async () => {
      await deleteNotificationAction(id)
    })
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='relative h-9 w-9 text-gold hover:bg-gold/10 hover:text-gold cursor-pointer'
          aria-label='Notifications'
        >
          <Bell className='size-4' />
          {unreadCount > 0 && (
            <span className='absolute -top-0.5 -right-0.5 grid min-w-4 h-4 px-1 place-items-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-background animate-in zoom-in duration-150'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align='end'
        sideOffset={8}
        className='w-80 sm:w-96 p-0 rounded-none border border-gold/30 shadow-xl bg-card font-sans'
      >
        {/* Header */}
        <div className='flex items-center justify-between px-4 py-3 border-b border-border bg-neutral-50/80'>
          <div className='flex items-center gap-2'>
            <h3 className='font-heading text-sm font-bold text-foreground'>Notifications</h3>
            {unreadCount > 0 && (
              <span className='bg-gold/15 text-gold font-bold text-xs px-2 py-0.5 rounded-full'>
                {unreadCount} new
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isPending}
              className='inline-flex items-center gap-1 text-2xs font-semibold text-gold hover:text-gold/80 transition-colors cursor-pointer'
            >
              <CheckCheck className='size-3.5' />
              Mark all as read
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className='max-h-88 overflow-y-auto divide-y divide-border/60'>
          {notifications.length === 0 ? (
            <div className='py-12 px-4 text-center space-y-2'>
              <div className='size-10 rounded-full bg-muted/60 grid place-items-center mx-auto text-muted-foreground'>
                <Bell className='size-5 stroke-[1.5]' />
              </div>
              <p className='text-xs font-semibold text-foreground'>All caught up!</p>
              <p className='text-2xs text-muted-foreground max-w-xs mx-auto'>
                No new store activity or alerts at this moment.
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const isUnread = !item.is_read

              return (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item.id)}
                  className={`group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-neutral-50 ${
                    isUnread ? 'bg-gold/5' : 'bg-transparent'
                  }`}
                >
                  {/* Icon */}
                  <div className='grid size-8 shrink-0 place-items-center rounded-md bg-muted/70 border border-border/40 mt-0.5'>
                    {getNotificationIcon(item.type)}
                  </div>

                  {/* Content */}
                  <div className='min-w-0 flex-1 space-y-1'>
                    <div className='flex items-start justify-between gap-2'>
                      <p className={`text-xs font-semibold leading-snug ${isUnread ? 'text-foreground font-bold' : 'text-neutral-700'}`}>
                        {item.title}
                      </p>
                      <span className='text-3xs text-muted-foreground whitespace-nowrap shrink-0'>
                        {formatRelativeTime(item.created_at)}
                      </span>
                    </div>

                    <p className='text-xs text-muted-foreground leading-relaxed line-clamp-2'>
                      {item.message}
                    </p>

                    {item.link && (
                      <Link
                        href={item.link}
                        onClick={() => setIsOpen(false)}
                        className='inline-flex items-center gap-1 text-2xs font-semibold text-gold hover:underline pt-0.5'
                      >
                        View details
                        <ChevronRight className='size-3' />
                      </Link>
                    )}
                  </div>

                  {/* Micro Actions */}
                  <div className='flex flex-col items-end gap-1.5 shrink-0 pl-1'>
                    {isUnread && (
                      <span className='size-2 rounded-full bg-gold ring-2 ring-gold/20' />
                    )}
                    <button
                      onClick={(e) => handleDelete(e, item.id)}
                      title='Delete notification'
                      className='opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 transition-opacity p-0.5 cursor-pointer'
                    >
                      <Trash2 className='size-3.5' />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className='border-t border-border p-2 bg-neutral-50 text-center'>
            <button
              onClick={handleMarkAllAsRead}
              className='text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-1'
            >
              Clear unread count
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
