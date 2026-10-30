'use client'
import { useForm } from 'react-hook-form'
import { useSWRConfig } from 'swr'
import { affectedCatalogKey } from '@/lib/catalog/cache'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { useCatalogRates } from '@/hooks/use-catalog-endpoint'
import { useApiRequest } from '@/hooks/use-api-request'
import { ApiError } from '@/lib/api/client'
import { CatalogFeedback } from '../feedback'

const karats = ['18k', '22k', '24k'] as const
type Values = Record<(typeof karats)[number], string>
export function GoldRatesForm() {
  const { mutate } = useSWRConfig()
  const query = useCatalogRates()
  const mutation = useApiRequest()
  const form = useForm<Values>({
    values: Object.fromEntries(
      karats.map((karat) => [
        karat,
        String(query.data?.data?.find((rate) => rate.karat === karat)?.rate ?? ''),
      ]),
    ) as Values,
  })
  const submit = form.handleSubmit(async (values) => {
    form.clearErrors('root')
    for (const karat of karats)
      if (values[karat] && (!Number.isFinite(Number(values[karat])) || Number(values[karat]) <= 0)) {
        form.setError(karat, { message: 'Enter a rate above zero or leave blank.' }, { shouldFocus: true })
        return
      }
    const rates = Object.fromEntries(
      karats.filter((karat) => values[karat].trim()).map((karat) => [karat, values[karat]]),
    )
    try {
      await mutation.execute('put', '/admin/gold-rates', { rates })
    } catch (failure) {
      if (failure instanceof ApiError)
        for (const [field, messages] of Object.entries(failure.fieldErrors ?? {})) {
          const karat = field.split('.')[1]
          if (karats.includes(karat as (typeof karats)[number]))
            form.setError(
              karat as (typeof karats)[number],
              { message: messages.join(' ') },
              { shouldFocus: true },
            )
        }
      return
    }
    form.setError('root.success', { message: 'Gold rates saved.' })
    try {
      await mutate((key) => affectedCatalogKey(key, 'gold-rates'))
    } catch {
      /* Keep confirmed write separate from refresh. */
    }
  })
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5 rounded-md border bg-white p-5 sm:p-8">
      <h2 className="text-xl font-medium">Manual gold rates</h2>
      <p className="text-sm text-gray-600">
        NGN per gram. Blank rates are unavailable; no external pricing service is used.
      </p>
      <FieldGroup>
        {karats.map((karat) => (
          <Field key={karat} data-invalid={!!form.formState.errors[karat]}>
            <FieldLabel htmlFor={`rate-${karat}`}>{karat} per gram (NGN)</FieldLabel>
            <Input
              id={`rate-${karat}`}
              inputMode="decimal"
              {...form.register(karat)}
              aria-invalid={!!form.formState.errors[karat]}
            />
            <FieldError>{form.formState.errors[karat]?.message}</FieldError>
            {query.data?.data?.find((rate) => rate.karat === karat)?.updated_at && (
              <p className="text-xs text-gray-600">
                Updated{' '}
                {new Date(query.data.data.find((rate) => rate.karat === karat)!.updated_at).toLocaleString()}
              </p>
            )}
          </Field>
        ))}
      </FieldGroup>
      <CatalogFeedback message={query.error?.message || mutation.error?.message} error />
      <CatalogFeedback message={form.formState.errors.root?.success?.message} />
      <Button disabled={mutation.loading || query.isLoading || !query.data?.data}>Save gold rates</Button>
    </form>
  )
}
