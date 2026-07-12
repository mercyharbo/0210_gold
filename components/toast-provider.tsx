'use client'

import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useToastStore } from '@/stores/hooks/use-toast'

export function ToastProvider() {
  const toasts = useToastStore((state) => state.toasts)
  const removeToast = useToastStore((state) => state.removeToast)

  if (toasts.length === 0) return null

  return (
    <div
      aria-live='polite'
      className='pointer-events-none fixed left-1/2 top-4 z-50 flex flex-col gap-2 w-[min(calc(100vw-2rem),32rem)] -translate-x-1/2'
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error'

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-top-4',
              isError
                ? 'border-red-300 bg-red-50 text-red-900'
                : 'border-green-300 bg-green-50 text-green-900'
            )}
          >
            <p className='min-w-0 flex-1 leading-6'>{toast.text}</p>
            <Button
              type='button'
              variant='ghost'
              size='icon-xs'
              className={cn(
                'shrink-0',
                isError
                  ? 'text-red-800 hover:bg-red-100 hover:text-red-950'
                  : 'text-green-800 hover:bg-green-100 hover:text-green-950'
              )}
              onClick={() => removeToast(toast.id)}
            >
              <X className='size-4' />
              <span className='sr-only'>Dismiss notification</span>
            </Button>
          </div>
        )
      })}
    </div>
  )
}
