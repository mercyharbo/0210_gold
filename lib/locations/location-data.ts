import type {
  CityOption,
  CountryOption,
  StateOption,
} from '@/types/location'

type CountriesNowState = {
  name: string
  state_code?: string | null
}

type CountriesNowCountry = {
  name: string
  iso2?: string
  iso3?: string
  states?: CountriesNowState[]
}

type CountriesNowStatesResponse = {
  error: boolean
  msg: string
  data: CountriesNowCountry[]
}

type CountriesNowCitiesResponse = {
  error: boolean
  msg: string
  data: string[]
}

const COUNTRIES_NOW_BASE_URL = 'https://countriesnow.space/api/v0.1'

let countriesCache: CountriesNowCountry[] | null = null

function toOption(value: string) {
  return {
    label: value,
    value,
  }
}

async function getCountriesWithStates() {
  if (countriesCache) {
    return countriesCache
  }

  const response = await fetch(`${COUNTRIES_NOW_BASE_URL}/countries/states`, {
    next: { revalidate: 60 * 60 * 24 },
  })

  if (!response.ok) {
    throw new Error('Unable to load countries.')
  }

  const payload = (await response.json()) as CountriesNowStatesResponse

  if (payload.error || !Array.isArray(payload.data)) {
    throw new Error(payload.msg || 'Unable to load countries.')
  }

  countriesCache = payload.data

  return countriesCache
}

export async function getCountries(): Promise<CountryOption[]> {
  const countries = await getCountriesWithStates()

  return countries
    .map((country) => toOption(country.name))
    .sort((first, second) => first.label.localeCompare(second.label))
}

export async function getStates(country: string | null): Promise<StateOption[]> {
  if (!country) {
    return []
  }

  const countries = await getCountriesWithStates()
  const matchedCountry = countries.find((item) => item.name === country)

  return (
    matchedCountry?.states
      ?.map((state) => toOption(state.name))
      .sort((first, second) => first.label.localeCompare(second.label)) ?? []
  )
}

export async function getCities(
  country: string | null,
  state: string | null,
): Promise<CityOption[]> {
  if (!country || !state) {
    return []
  }

  const response = await fetch(
    `${COUNTRIES_NOW_BASE_URL}/countries/state/cities`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ country, state }),
      next: { revalidate: 60 * 60 * 24 },
    },
  )

  if (!response.ok) {
    throw new Error('Unable to load cities.')
  }

  const payload = (await response.json()) as CountriesNowCitiesResponse

  if (payload.error || !Array.isArray(payload.data)) {
    throw new Error(payload.msg || 'Unable to load cities.')
  }

  return payload.data
    .map((city) => toOption(city))
    .sort((first, second) => first.label.localeCompare(second.label))
}
