'use client'

import { useState } from 'react'

import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import {
  useCities,
  useCountries,
  useStates,
} from '@/hooks/use-location-options'

type LocationSelectFieldsProps = {
  countryId: string
  stateId: string
  cityId: string
  defaultCountry?: string
  defaultState?: string
  defaultCity?: string
}

const selectTriggerClassName = 'w-full'

export function LocationSelectFields({
  countryId,
  stateId,
  cityId,
  defaultCountry = 'Nigeria',
  defaultState = '',
  defaultCity = '',
}: LocationSelectFieldsProps) {
  const [country, setCountry] = useState(defaultCountry)
  const [state, setState] = useState(defaultState)
  const [city, setCity] = useState(defaultCity)
  const countriesQuery = useCountries()
  const statesQuery = useStates(country)
  const citiesQuery = useCities(country, state)
  const error =
    countriesQuery.error ?? statesQuery.error ?? citiesQuery.error ?? null

  return (
    <>
      <Field>
        <FieldLabel htmlFor={countryId}>Country</FieldLabel>
        <Select
          name='country'
          value={country}
          onValueChange={(value) => {
            setCountry(value)
            setState('')
            setCity('')
          }}
          disabled={countriesQuery.loading || countriesQuery.countries.length === 0}
          required
        >
          <SelectTrigger
            id={countryId}
            size='lg'
            className={selectTriggerClassName}
          >
            <SelectValue placeholder='Select country' />
            {countriesQuery.loading ? (
              <Spinner className='ml-auto size-3.5' />
            ) : null}
          </SelectTrigger>
          <SelectContent>
            {countriesQuery.countries.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor={stateId}>State</FieldLabel>
        <Select
          name='state'
          value={state}
          onValueChange={(value) => {
            setState(value)
            setCity('')
          }}
          disabled={statesQuery.loading || statesQuery.states.length === 0}
          required
        >
          <SelectTrigger
            id={stateId}
            size='lg'
            className={selectTriggerClassName}
          >
            <SelectValue placeholder='Select state' />
            {statesQuery.loading ? (
              <Spinner className='ml-auto size-3.5' />
            ) : null}
          </SelectTrigger>
          <SelectContent>
            {statesQuery.states.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor={cityId}>City</FieldLabel>
        <Select
          name='city'
          value={city}
          onValueChange={setCity}
          disabled={!state || citiesQuery.loading || citiesQuery.cities.length === 0}
          required
        >
          <SelectTrigger
            id={cityId}
            size='lg'
            className={selectTriggerClassName}
          >
            <SelectValue placeholder='Select city' />
            {citiesQuery.loading ? (
              <Spinner className='ml-auto size-3.5' />
            ) : null}
          </SelectTrigger>
          <SelectContent>
            {citiesQuery.cities.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {error ? (
        <p className='md:col-span-2 text-sm font-medium text-red-600'>
          {error.message}
        </p>
      ) : null}
    </>
  )
}
