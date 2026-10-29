'use client'

import useSWR from 'swr'

import { apiFetcher } from '@/lib/api/client'
import type {
  CityOption,
  CountryOption,
  StateOption,
} from '@/types/location'

async function locationFetcher<TOption>(endpoint: string) {
  const response = await apiFetcher<TOption[]>(endpoint)

  return response.data ?? []
}

export function useCountries() {
  const { data, error, isLoading } = useSWR(
    '/api/countries',
    locationFetcher<CountryOption>,
  )

  return {
    countries: data ?? [],
    loading: isLoading,
    error,
  }
}

export function useStates(country?: string) {
  const endpoint = country
    ? `/api/states?country=${encodeURIComponent(country)}`
    : null
  const { data, error, isLoading } = useSWR(
    endpoint,
    locationFetcher<StateOption>,
  )

  return {
    states: data ?? [],
    loading: Boolean(endpoint) && isLoading,
    error,
  }
}

export function useCities(country?: string, state?: string) {
  const endpoint =
    country && state
      ? `/api/cities?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}`
      : null
  const { data, error, isLoading } = useSWR(
    endpoint,
    locationFetcher<CityOption>,
  )

  return {
    cities: data ?? [],
    loading: Boolean(endpoint) && isLoading,
    error,
  }
}
