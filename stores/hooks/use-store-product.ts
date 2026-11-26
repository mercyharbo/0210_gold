'use client'

import { useShallow } from 'zustand/react/shallow'

import { useCatalogSelection } from '@/stores/catalog-ui'

export function useStoreProduct() {
  return useCatalogSelection(useShallow((state) => ({
    productId: state.productId,
    size: state.size,
    color: state.color,
    karat: state.karat,
    select: state.select,
    reset: state.reset,
  })))
}
