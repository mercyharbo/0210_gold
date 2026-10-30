import { NIGERIA_STATES } from '@/lib/data/nigeria-states'
import type { CityOption, CountryOption, StateOption } from '@/types/location'
const option = (value: string) => ({ value, label: value })
export async function getCountries(): Promise<CountryOption[]> {
  return [option('Nigeria')]
}
export async function getStates(country: string | null): Promise<StateOption[]> {
  return country === 'Nigeria'
    ? NIGERIA_STATES.map((item) => option(item.state)).sort((a, b) => a.label.localeCompare(b.label))
    : []
}
export async function getCities(country: string | null, state: string | null): Promise<CityOption[]> {
  if (country !== 'Nigeria') return []
  return (NIGERIA_STATES.find((item) => item.state === state)?.cities ?? [])
    .map(option)
    .sort((a, b) => a.label.localeCompare(b.label))
}
