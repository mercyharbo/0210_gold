import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { PasswordInput } from '@/components/auth/password-input'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { SignupPayload } from '@/types/authentication'

export function SignupFields({ register, errors, busy }: {
  register: UseFormRegister<SignupPayload>
  errors: FieldErrors<SignupPayload>
  busy: boolean
}) {
  return (
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor='signup-name'>Name</FieldLabel>
              <Input
                id='signup-name'
                autoComplete='name'
                placeholder='Your full name'
                readOnly={busy}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'signup-name-error' : undefined}
                {...register('name')}
              />
              <FieldError id='signup-name-error' errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor='signup-email'>Email address</FieldLabel>
              <Input
                id='signup-email'
                type='email'
                autoComplete='email'
                placeholder='you@example.com'
                readOnly={busy}
                aria-invalid={!!errors.email}
                aria-describedby={
                  errors.email ? 'signup-email-error' : undefined
                }
                {...register('email')}
              />
              <FieldError id='signup-email-error' errors={[errors.email]} />
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor='signup-password'>Password</FieldLabel>
              <PasswordInput
                id='signup-password'
                autoComplete='new-password'
                placeholder='Create a password'
                disabled={busy}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password
                    ? 'signup-password-help signup-password-error'
                    : 'signup-password-help'
                }
                {...register('password')}
              />
              <FieldDescription id='signup-password-help'>
                Use 8–128 characters, including uppercase and lowercase letters,
                a number and a special character.
              </FieldDescription>
              <FieldError
                id='signup-password-error'
                errors={[errors.password]}
              />
            </Field>
          </FieldGroup>
  )
}
