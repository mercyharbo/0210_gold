'use client'

import { useShallow } from 'zustand/react/shallow'

import { useCatalogBrowseUi } from '@/stores/catalog-browse-ui'

export function useStoreCatalog() {
  return useCatalogBrowseUi(useShallow((state) => ({
    filtersOpen: state.filtersOpen,
    setFiltersOpen: state.setFiltersOpen,
    reset: state.reset,
  })))
}
