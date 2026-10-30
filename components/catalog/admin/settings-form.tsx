'use client'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { useCatalogSettings } from '@/hooks/use-catalog-endpoint'
import { useApiRequest } from '@/hooks/use-api-request'
import { ApiError } from '@/lib/api/client'
import type { CatalogSettings } from '@/types/catalog'
import { CatalogFeedback } from '../feedback'
import { GoldRatesForm } from './gold-rates-form'

const fields: { name: keyof CatalogSettings; label: string; numeric?: boolean }[] = [
  { name: 'store_name', label: 'Store name' },
  { name: 'support_email', label: 'Support email' },
  { name: 'support_phone', label: 'Support phone' },
  { name: 'store_address', label: 'Store address' },
  { name: 'business_hours', label: 'Business hours' },
  { name: 'usd_rate', label: 'NGN per USD', numeric: true },
  { name: 'gbp_rate', label: 'NGN per GBP', numeric: true },
  { name: 'local_shipping_fee', label: 'Local shipping fee (NGN)', numeric: true },
  { name: 'uk_shipping_rate_per_kg', label: 'UK shipping rate per kg (NGN)', numeric: true },
  { name: 'free_shipping_threshold', label: 'Free shipping threshold (NGN)', numeric: true },
]
export function CatalogSettingsForm() {
  const query = useCatalogSettings()
  const { execute, loading, error } = useApiRequest()
  const cleanup = useApiRequest<{ deleted: number }>()
  const form = useForm<Record<string, string>>({
    values: query.data?.data
      ? Object.fromEntries(Object.entries(query.data.data).map(([key, value]) => [key, String(value)]))
      : undefined,
  })
  const submit = form.handleSubmit(async (values) => {
    form.clearErrors('root')
    try {
      await execute('put', '/admin/settings', { ...values, primary_currency: 'NGN' })
    } catch (failure) {
      if (failure instanceof ApiError) {
        let focus = true
        for (const [field, messages] of Object.entries(failure.fieldErrors ?? {})) {
          form.setError(field, { message: messages.join(' ') }, { shouldFocus: focus })
          focus = false
        }
      }
      return
    }
    form.setError('root.success', { message: 'Store settings saved.' })
    try {
      await query.mutate()
    } catch {
      /* Read error remains visible; do not repeat write. */
    }
  })
  async function clean() {
    try {
      await cleanup.execute('post', '/admin/media/cleanup', {})
    } catch {
      /* Hook exposes failure. */
    }
  }
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <h1 className="text-2xl font-semibold">Store settings</h1>
      <CatalogFeedback message={query.error?.message} error />
      <form
        onSubmit={submit}
        noValidate
        className="flex flex-col gap-5 rounded-md border bg-white p-5 sm:p-8"
      >
        <FieldGroup>
          {fields.map(({ name, label, numeric }) => (
            <Field key={name} data-invalid={!!form.formState.errors[name]}>
              <FieldLabel htmlFor={name}>{label}</FieldLabel>
              <Input
                id={name}
                {...form.register(name)}
                inputMode={numeric ? 'decimal' : undefined}
                aria-invalid={!!form.formState.errors[name]}
              />
              <FieldError>{form.formState.errors[name]?.message}</FieldError>
            </Field>
          ))}
        </FieldGroup>
        <CatalogFeedback message={error?.message} error />
        <CatalogFeedback message={form.formState.errors.root?.success?.message} />
        <Button disabled={loading || query.isLoading || !query.data?.data}>Save settings</Button>
      </form>
      <GoldRatesForm />
      <section className="flex flex-col items-start gap-4 rounded-md border bg-white p-5">
        <h2 className="text-lg font-medium">Media cleanup</h2>
        <p className="text-sm text-gray-600">
          Remove unreferenced uploads older than 24 hours. Published images are preserved.
        </p>
        <Button variant="outline" disabled={cleanup.loading} onClick={clean}>
          Clean unused images
        </Button>
        <CatalogFeedback message={cleanup.error?.message} error />
        {cleanup.response?.data && (
          <CatalogFeedback message={`${cleanup.response.data.deleted} unused images removed.`} />
        )}
      </section>
      <CatalogFeedback message="Payment providers, notification delivery, MFA, and session controls will be available in later phases." />
    </div>
  )
}
