import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

export type ToastType = 'success' | 'warning' | 'failure' | 'info'
export type Toast = { id: string; type: ToastType; text: string; open: boolean }

type ToastState = {
  toasts: Toast[]
  queue: Toast[]
  addToast: (text: string, type?: ToastType | 'error') => string
  removeToast: (id: string) => void
  reset: () => void
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  queue: [],
  addToast: (text, type = 'success') => {
    const toast: Toast = { id: crypto.randomUUID(), type: type === 'error' ? 'failure' : type, text, open: true }
    set((state) => state.toasts.length < 3
      ? { toasts: [...state.toasts, toast] }
      : { queue: [...state.queue, toast] })
    return toast.id
  },
  removeToast: (id) => {
    if (!get().toasts.some((toast) => toast.id === id && toast.open)) return
    set((state) => ({ toasts: state.toasts.map((toast) => toast.id === id ? { ...toast, open: false } : toast) }))
    // Keep the item mounted for its exit transition, including reduced-motion dismissal.
    setTimeout(() => set((state) => {
      const toasts = state.toasts.filter((toast) => toast.id !== id)
      const available = 3 - toasts.length
      return { toasts: [...toasts, ...state.queue.slice(0, available)], queue: state.queue.slice(available) }
    }), 200)
  },
  reset: () => set({ toasts: [], queue: [] }),
}))

export function useToast() {
  return useToastStore(useShallow((state) => ({
    toasts: state.toasts,
    toast: state.addToast,
    dismiss: state.removeToast,
  })))
}
