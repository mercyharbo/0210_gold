'use client'

import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { NIGERIA_STATES } from '@/lib/data/nigeria-states'
import type { CheckoutDetails } from '@/lib/validations/checkout-details'

import { CheckoutTextField } from './checkout-text-field'

export function CheckoutShippingForm() {
  const { control, setValue } = useFormContext<CheckoutDetails>()
  const selectedState = useWatch({ control, name: 'state' })
  // The bundled dataset calls these entries “cities”; they are local government areas.
  const localAreas = NIGERIA_STATES.find((entry) => entry.state === selectedState)?.cities ?? []

  return (
    <div className='flex flex-col gap-10'>
      <section aria-labelledby='checkout-contact-heading' className='flex flex-col gap-6'>
        <h2 id='checkout-contact-heading' className='text-xl font-medium'>Contact information</h2>

        <FieldGroup className='grid gap-5 sm:grid-cols-2'>
          <CheckoutTextField name='recipient_name' label='Full name' autoComplete='shipping name' />
          <CheckoutTextField name='email' label='Email address' type='email' autoComplete='email' />
          <CheckoutTextField name='phone' label='Phone number' type='tel' autoComplete='shipping tel' />
        </FieldGroup>
      </section>

      <section aria-labelledby='checkout-delivery-heading' className='flex flex-col gap-6 border-t border-gray-200 pt-8'>
        <h2 id='checkout-delivery-heading' className='text-xl font-medium'>Delivery address</h2>

        <FieldGroup className='gap-5'>
          <Field className='gap-2'>
            <FieldLabel htmlFor='checkout-country'>Country</FieldLabel>
            <Input id='checkout-country' value='Nigeria' readOnly autoComplete='shipping country-name' className='h-12 rounded-none border-gray-200 bg-gray-50' />
          </Field>

          <CheckoutTextField name='address_line_1' label='Street address' autoComplete='shipping address-line1' />

          <div className='grid min-w-0 gap-5 sm:grid-cols-2'>
            <Controller
              control={control}
              name='state'
              render={({ field, fieldState }) => (
                <Field className='gap-2' data-invalid={Boolean(fieldState.error)}>
                  <FieldLabel htmlFor='checkout-state'>State / FCT</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={(state) => {
                      field.onChange(state)
                      setValue('local_area', '', { shouldDirty: true })
                    }}
                  >
                    <SelectTrigger
                      id='checkout-state'
                      ref={field.ref}
                      onBlur={field.onBlur}
                      aria-invalid={Boolean(fieldState.error)}
                      aria-describedby={fieldState.error ? 'checkout-state-error' : undefined}
                      className='h-12 w-full rounded-none border-gray-200 bg-gray-50 data-[size=default]:h-12'
                    >
                      <SelectValue placeholder='Choose a state' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {NIGERIA_STATES.map((entry) => (
                          <SelectItem key={entry.state} value={entry.state}>
                            {entry.state}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError id='checkout-state-error' errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={control}
              name='local_area'
              render={({ field, fieldState }) => (
                <Field className='gap-2' data-invalid={Boolean(fieldState.error)}>
                  <FieldLabel htmlFor='checkout-local-area'>Local government area</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={!selectedState}>
                    <SelectTrigger
                      id='checkout-local-area'
                      ref={field.ref}
                      onBlur={field.onBlur}
                      aria-invalid={Boolean(fieldState.error)}
                      aria-describedby={fieldState.error ? 'checkout-local-area-error' : undefined}
                      className='h-12 w-full rounded-none border-gray-200 bg-gray-50 data-[size=default]:h-12'
                    >
                      <SelectValue placeholder='Choose a local area' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {localAreas.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError id='checkout-local-area-error' errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>

          <CheckoutTextField name='locality' label='Town / neighbourhood (optional)' autoComplete='shipping address-level3' />
        </FieldGroup>
      </section>
    </div>
  )
}
