'use client'

import { X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const TOAST_TIMEOUT_MS = 5000

type ToastState = {
  id: string
  type: 'error' | 'message'
  text: string
}

export function QueryParamToast() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [toast, setToast] = useState<ToastState | null>(null)

  const nextToast = useMemo(() => {
    const error = searchParams.get('error')
    const message = searchParams.get('message')
    const text = error || message

    if (!text) {
      return null
    }

    return {
      id: `${error ? 'error' : 'message'}:${text}`,
      type: error ? 'error' : 'message',
      text,
    } satisfies ToastState
  }, [searchParams])

  useEffect(() => {
    if (!nextToast) {
      return
    }

    window.setTimeout(() => {
      setToast(nextToast)
    }, 0)

    const params = new URLSearchParams(searchParams.toString())
    params.delete('error')
    params.delete('message')
    const query = params.toString()

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    })
  }, [nextToast, pathname, router, searchParams])

  useEffect(() => {
    if (!toast) {
      return
    }

    const timeout = window.setTimeout(() => {
      setToast(null)
    }, TOAST_TIMEOUT_MS)

    return () => window.clearTimeout(timeout)
  }, [toast])

  if (!toast) {
    return null
  }

  const isError = toast.type === 'error'

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed left-1/2 top-4 z-50 w-[min(calc(100vw-2rem),32rem)] -translate-x-1/2"
    >
      <div
        className={cn(
          'pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg',
          isError
            ? 'border-red-300 bg-red-50 text-red-900'
            : 'border-green-300 bg-green-50 text-green-900',
        )}
      >
        <p className="min-w-0 flex-1 leading-6">{toast.text}</p>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className={cn(
            'shrink-0',
            isError
              ? 'text-red-800 hover:bg-red-100 hover:text-red-950'
              : 'text-green-800 hover:bg-green-100 hover:text-green-950',
          )}
          onClick={() => setToast(null)}
        >
          <X className="size-4" />
          <span className="sr-only">Dismiss notification</span>
        </Button>
      </div>
    </div>
  )
}
