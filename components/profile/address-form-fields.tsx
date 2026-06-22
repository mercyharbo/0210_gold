import { LocationSelectFields } from '@/components/profile/location-select-fields'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { CustomerAddress } from '@/types/address'

const fieldInputClassName = 'h-11'

type AddressFormFieldsProps = {
  address?: CustomerAddress
}

export function AddressFormFields({ address }: AddressFormFieldsProps) {
  return (
    <FieldGroup className='grid gap-4 md:grid-cols-2'>
      <Field>
        <FieldLabel htmlFor={address ? `label-${address.id}` : 'label'}>
          Label
        </FieldLabel>
        <Input
          id={address ? `label-${address.id}` : 'label'}
          name='label'
          defaultValue={address?.label ?? ''}
          placeholder='Home, office, Lagos default'
          className={fieldInputClassName}
        />
      </Field>

      <Field>
        <FieldLabel
          htmlFor={address ? `recipientName-${address.id}` : 'recipientName'}
        >
          Recipient name
        </FieldLabel>
        <Input
          id={address ? `recipientName-${address.id}` : 'recipientName'}
          name='recipientName'
          defaultValue={address?.recipient_name ?? ''}
          className={fieldInputClassName}
          required
        />
      </Field>

      <Field className='md:col-span-2'>
        <FieldLabel htmlFor={address ? `phone-${address.id}` : 'addressPhone'}>
          Phone
        </FieldLabel>
        <Input
          id={address ? `phone-${address.id}` : 'addressPhone'}
          name='phone'
          type='tel'
          defaultValue={address?.phone ?? ''}
          className={fieldInputClassName}
          required
        />
      </Field>

      <Field className='md:col-span-2'>
        <FieldLabel
          htmlFor={address ? `addressLine1-${address.id}` : 'addressLine1'}
        >
          Address line 1
        </FieldLabel>
        <Input
          id={address ? `addressLine1-${address.id}` : 'addressLine1'}
          name='addressLine1'
          defaultValue={address?.address_line_1 ?? ''}
          className={fieldInputClassName}
          required
        />
      </Field>

      <Field className='md:col-span-2'>
        <FieldLabel
          htmlFor={address ? `addressLine2-${address.id}` : 'addressLine2'}
        >
          Address line 2
        </FieldLabel>
        <Input
          id={address ? `addressLine2-${address.id}` : 'addressLine2'}
          name='addressLine2'
          defaultValue={address?.address_line_2 ?? ''}
          className={fieldInputClassName}
        />
      </Field>

      <LocationSelectFields
        countryId={address ? `country-${address.id}` : 'country'}
        stateId={address ? `state-${address.id}` : 'state'}
        cityId={address ? `city-${address.id}` : 'city'}
        defaultCountry={address?.country ?? 'Nigeria'}
        defaultState={address?.state ?? ''}
        defaultCity={address?.city ?? ''}
      />

      <Field>
        <FieldLabel
          htmlFor={address ? `postalCode-${address.id}` : 'postalCode'}
        >
          Postal code
        </FieldLabel>
        <Input
          id={address ? `postalCode-${address.id}` : 'postalCode'}
          name='postalCode'
          defaultValue={address?.postal_code ?? ''}
          className={fieldInputClassName}
        />
      </Field>

      <Field className='md:col-span-2'>
        <FieldLabel
          htmlFor={address ? `deliveryNotes-${address.id}` : 'deliveryNotes'}
        >
          Delivery notes
        </FieldLabel>
        <Textarea
          id={address ? `deliveryNotes-${address.id}` : 'deliveryNotes'}
          name='deliveryNotes'
          defaultValue={address?.delivery_notes ?? ''}
          rows={3}
        />
      </Field>

      <Field className='md:col-span-2'>
        <label className='flex items-center gap-3 text-sm font-medium leading-snug'>
          <Checkbox name='isDefault' defaultChecked={address?.is_default} />
          Use as default delivery address
        </label>
      </Field>
    </FieldGroup>
  )
}
