'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useToastStore } from '@/stores/hooks/use-toast'

const authErrors: Record<string, string> = {
  google_sign_in: 'Google sign-in was cancelled or could not finish. Please try again.',
  service_unavailable: 'The sign-in service is unavailable. Please try again.',
}

// Legacy redirects feed the same renderer as direct API-handler notifications.
export function QueryParamToast() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToastStore((state) => state.addToast)
  const lastMessage = useRef<string | null>(null)

  useEffect(() => {
    const error = searchParams.get('error')
    const message = searchParams.get('message')
    const text = error || message
    if (!text) { lastMessage.current = null; return }
    const key = `${pathname}:${error ? 'error' : 'message'}:${text}`
    if (lastMessage.current === key) return
    lastMessage.current = key
    toast(error ? authErrors[error] || error : text, error ? 'failure' : 'success')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('error')
    params.delete('message')
    router.replace(params.size ? `${pathname}?${params}` : pathname, { scroll: false })
  }, [pathname, router, searchParams, toast])

  return null
}
