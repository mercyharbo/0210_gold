import { create } from 'zustand'

export const initialProductFilters = {
  search: '', category: '', status: '', label: '', availability: '', sort: 'newest', page: 1,
}
export type ProductListFilters = typeof initialProductFilters
type FilterName = Exclude<keyof ProductListFilters, 'page'>

export const useAdminProductsUi = create<ProductListFilters & {
  setFilter: (name: FilterName, value: string) => void
  setPage: (page: number) => void
  reset: () => void
}>((set) => ({
  ...initialProductFilters,
  setFilter: (name, value) => set({ [name]: value, page: 1 }),
  setPage: (page) => set({ page: Math.max(1, page) }),
  reset: () => set(initialProductFilters),
}))
