'use client'

import { create } from 'zustand'

import type { ApiResponse } from '@/hooks/use-api-request'

type ApiRequestStore = {
  loading: boolean
  error: string | null
  response: ApiResponse | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setResponse: (response: ApiResponse | null) => void
  reset: () => void
}

export const useApiRequestStore = create<ApiRequestStore>((set) => ({
  loading: false,
  error: null,
  response: null,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setResponse: (response) => set({ response }),
  reset: () => set({ loading: false, error: null, response: null }),
}))
