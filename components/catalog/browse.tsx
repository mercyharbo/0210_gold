'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import { Skeleton } from '@/components/ui/skeleton'
import { useCatalogProducts } from '@/hooks/use-catalog-endpoint'
import type { CatalogCategory, CatalogPage } from '@/types/catalog'
import { CatalogFeedback } from './feedback'
import { CatalogProductCard } from './product-card'

export type BrowseQuery = { q: string; category: string; sort: string; page: string }
export function CatalogBrowse({
  initial,
  categories,
  query,
}: {
  initial: CatalogPage
  categories: CatalogCategory[]
  query: BrowseQuery
}) {
  const router = useRouter()
  const form = useForm({ defaultValues: query, values: query })
  const params = new URLSearchParams(query)
  const { data, error, isLoading, isValidating } = useCatalogProducts(params.toString(), initial)
  const page = data?.data ?? initial
  function navigate(values: BrowseQuery) {
    router.push(`/shop?${new URLSearchParams(values)}`)
  }
  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 lg:px-12">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">The collection</h1>
        <p className="text-sm text-gray-600">Fine jewellery and considered style, selected by FM LUXE.</p>
      </div>
      <form
        onSubmit={form.handleSubmit((values) => navigate({ ...values, page: '1' }))}
        className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Filter products"
      >
        <Field>
          <FieldLabel htmlFor="catalog-search">Search</FieldLabel>
          <Input id="catalog-search" {...form.register('q')} placeholder="Find a piece" />
        </Field>
        <Field>
          <FieldLabel htmlFor="catalog-category">Collection</FieldLabel>
          <select
            id="catalog-category"
            {...form.register('category')}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">All collections</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
        <Field>
          <FieldLabel htmlFor="catalog-sort">Sort</FieldLabel>
          <select
            id="catalog-sort"
            {...form.register('sort')}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="name">Name</option>
          </select>
        </Field>
        <Button disabled={isValidating}>Apply filters</Button>
      </form>
      <CatalogFeedback message={error?.message} error />
      {isLoading && !data?.data ? (
        <Skeleton className="h-64 w-full" />
      ) : page.items.length ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {page.items.map((product) => (
            <CatalogProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-start gap-4 border py-12 px-6">
          <h2 className="text-xl font-medium">No pieces to show yet</h2>
          <p className="text-sm text-gray-600">Try another search or visit again as our collection grows.</p>
          <Link href="/shop" className="text-sm underline underline-offset-4">
            View all collections
          </Link>
        </div>
      )}
      <nav aria-label="Product pages" className="flex items-center justify-between gap-4 text-sm">
        <Button
          variant="outline"
          disabled={page.page <= 1}
          onClick={() => navigate({ ...query, page: String(page.page - 1) })}
        >
          Previous
        </Button>
        <span>
          {page.total} pieces · Page {page.page}
        </span>
        <Button
          variant="outline"
          disabled={page.page * page.page_size >= page.total}
          onClick={() => navigate({ ...query, page: String(page.page + 1) })}
        >
          Next
        </Button>
      </nav>
    </section>
  )
}
