import { create } from 'zustand'

type CatalogBrowseUi = {
  filtersOpen: boolean
  setFiltersOpen: (open: boolean) => void
  reset: () => void
}

export const useCatalogBrowseUi = create<CatalogBrowseUi>((set) => ({
  filtersOpen: false,
  setFiltersOpen: (filtersOpen) => set({ filtersOpen }),
  reset: () => set({ filtersOpen: false }),
}))
