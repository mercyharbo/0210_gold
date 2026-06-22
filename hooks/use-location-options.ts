'use client'

import useSWR from 'swr'

import { GET } from '@/hooks/use-api-request'
import type {
  CityOption,
  CountryOption,
  StateOption,
} from '@/types/location'

async function locationFetcher<TOption>(endpoint: string) {
  const response = await GET<TOption[]>(endpoint)

  if (!response.success) {
    throw new Error(response.error ?? 'Unable to load location options.')
  }

  return response.data ?? []
}

export function useCountries() {
  const { data, error, isLoading } = useSWR(
    '/countries',
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
    ? `/states?country=${encodeURIComponent(country)}`
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
      ? `/cities?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}`
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
