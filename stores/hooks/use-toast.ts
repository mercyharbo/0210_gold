import { create } from 'zustand'

export type Toast = {
  id: string
  type: 'success' | 'error' | 'info'
  text: string
}

type ToastState = {
  toasts: Toast[]
  addToast: (text: string, type?: 'success' | 'error' | 'info') => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (text, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9)
    set((state) => ({
      toasts: [...state.toasts, { id, type, text }],
    }))
    // Auto-remove after 4 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, 4000)
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))

export function useToast() {
  const store = useToastStore()
  return {
    toasts: store.toasts,
    toast: store.addToast,
    dismiss: store.removeToast,
  }
}
