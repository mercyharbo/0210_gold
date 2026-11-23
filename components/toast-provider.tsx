'use client'

import { Toast as ToastPrimitive } from 'radix-ui'
import { CircleCheck, CircleX, Info, TriangleAlert, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useToastStore } from '@/stores/hooks/use-toast'

const variants = {
  success: { label: 'Success', Icon: CircleCheck, color: 'border-green-300 bg-green-50 text-green-900' },
  warning: { label: 'Warning', Icon: TriangleAlert, color: 'border-amber-300 bg-amber-50 text-amber-900' },
  failure: { label: 'Failure', Icon: CircleX, color: 'border-red-300 bg-red-50 text-red-900' },
  info: { label: 'Information', Icon: Info, color: 'border-blue-300 bg-blue-50 text-blue-900' },
}

export function ToastProvider() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.removeToast)
  return (
    <ToastPrimitive.Provider duration={5000} swipeDirection='up' label='Notification'>
      {toasts.map((toast) => {
        const { label, Icon, color } = variants[toast.type]
        return (
          <ToastPrimitive.Root
            key={toast.id} open={toast.open} onOpenChange={(open) => { if (!open) dismiss(toast.id) }}
            type={toast.type === 'failure' ? 'foreground' : 'background'} data-toast-variant={toast.type}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-md border px-4 py-3 text-sm shadow-lg outline-none',
              'data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2 data-[state=open]:duration-200',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:slide-out-to-top-2 data-[state=closed]:duration-150',
              'motion-reduce:animate-none! motion-reduce:transition-none', color,
            )}
          >
            <Icon className='size-5 shrink-0' aria-hidden='true' />
            <div className='min-w-0 flex-1'>
              <ToastPrimitive.Title className='sr-only'>{label}</ToastPrimitive.Title>
              <ToastPrimitive.Description className='break-words leading-6'>{toast.text}</ToastPrimitive.Description>
            </div>
            <ToastPrimitive.Close asChild>
              <Button type='button' variant='ghost' size='icon-xs' className='shrink-0 rounded-md text-current hover:bg-black/5 hover:text-current' aria-label='Dismiss notification'>
                <X className='size-4' aria-hidden='true' />
              </Button>
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        )
      })}
      <ToastPrimitive.Viewport aria-label='Notifications'
        className='pointer-events-none fixed left-1/2 top-4 z-100 flex w-full max-w-lg -translate-x-1/2 list-none flex-col gap-2 px-4 outline-none' />
    </ToastPrimitive.Provider>
  )
}
