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
        <div className='relative w-full'>
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
            </SelectTrigger>
            <SelectContent>
              {countriesQuery.countries.map((option, idx) => (
                <SelectItem key={`${option.value}-${idx}`} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {countriesQuery.loading ? (
            <div className='absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none'>
              <Spinner className='size-3.5 text-muted-foreground' />
            </div>
          ) : null}
        </div>
      </Field>

      <Field>
        <FieldLabel htmlFor={stateId}>State</FieldLabel>
        <div className='relative w-full'>
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
            </SelectTrigger>
            <SelectContent>
              {statesQuery.states.map((option, idx) => (
                <SelectItem key={`${option.value}-${idx}`} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {statesQuery.loading ? (
            <div className='absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none'>
              <Spinner className='size-3.5 text-muted-foreground' />
            </div>
          ) : null}
        </div>
      </Field>

      <Field>
        <FieldLabel htmlFor={cityId}>City</FieldLabel>
        <div className='relative w-full'>
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
            </SelectTrigger>
            <SelectContent>
              {citiesQuery.cities.map((option, idx) => (
                <SelectItem key={`${option.value}-${idx}`} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {citiesQuery.loading ? (
            <div className='absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none'>
              <Spinner className='size-3.5 text-muted-foreground' />
            </div>
          ) : null}
        </div>
      </Field>

      {error ? (
        <p className='md:col-span-2 text-sm font-medium text-red-600'>
          {error.message}
        </p>
      ) : null}
    </>
  )
}
