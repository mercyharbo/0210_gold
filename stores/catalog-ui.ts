import { create } from 'zustand'

type Selection = { productId: string | null; size: string | null; color: string | null; karat: string | null }
const empty: Selection = { productId: null, size: null, color: null, karat: null }
export const useCatalogSelection = create<
  Selection & {
    select: (values: Partial<Selection>) => void
    reset: () => void
  }
>((set) => ({ ...empty, select: (values) => set(values), reset: () => set(empty) }))
