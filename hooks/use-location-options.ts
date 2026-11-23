'use client'

import { useApiRead } from './use-api-read'
import type { CityOption, CountryOption, StateOption } from '@/types/location'

export function useCountries() {
  const { data, error, isLoading } = useApiRead<CountryOption[]>('/api/countries')
  return { countries: data?.data ?? [], loading: isLoading, error }
}

export function useStates(country?: string) {
  const endpoint = country ? `/api/states?country=${encodeURIComponent(country)}` : null
  const { data, error, isLoading } = useApiRead<StateOption[]>(endpoint)
  return { states: data?.data ?? [], loading: Boolean(endpoint) && isLoading, error }
}

export function useCities(country?: string, state?: string) {
  const endpoint = country && state
    ? `/api/cities?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}` : null
  const { data, error, isLoading } = useApiRead<CityOption[]>(endpoint)
  return { cities: data?.data ?? [], loading: Boolean(endpoint) && isLoading, error }
}
