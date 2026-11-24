'use client'

import type { Ref } from 'react'
import { Search } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAdminCategories } from '@/hooks/use-admin-endpoint'
import { useAdminProductsUi, type ProductListFilters } from '@/stores/admin-products-ui'
import { productLabelOptions } from '@/lib/products/product-options'

function ProductFilterSelect({ name, label, options }: {
  name: Exclude<keyof ProductListFilters, 'search' | 'page'>; label: string; options: { value: string; label: string }[]
}) {
  const value = useAdminProductsUi((state) => state[name])
  const setFilter = useAdminProductsUi((state) => state.setFilter)
  return (
    <Select value={value || '__all__'} onValueChange={(selected) => setFilter(name, selected === '__all__' ? '' : selected)}>
      <SelectTrigger size='md' className='w-full rounded-md' aria-label={label}><SelectValue /></SelectTrigger>
      <SelectContent><SelectGroup>
        {name !== 'sort' && <SelectItem value='__all__'>{name === 'availability' ? 'Any stock status' : `All ${label.toLowerCase()}`}</SelectItem>}
        {options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
      </SelectGroup></SelectContent>
    </Select>
  )
}

export function ProductFilters({ searchRef }: { searchRef: Ref<HTMLInputElement> }) {
  const { search, setFilter, reset } = useAdminProductsUi(useShallow(({ search, setFilter, reset }) => ({ search, setFilter, reset })))
  const categories = useAdminCategories()
  return (
    <div className='flex flex-col gap-4'>
      <div className='relative w-full sm:max-w-xs'>
        <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500' aria-hidden='true' />
        <Input ref={searchRef} aria-label='Search products' placeholder='Search products...' value={search}
          onChange={(event) => setFilter('search', event.target.value)} className='h-10 rounded-md bg-white pl-9' />
      </div>
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
        <ProductFilterSelect name='category' label='Categories' options={(categories.data?.data ?? []).map((category) => ({ value: category.slug, label: category.name }))} />
        <ProductFilterSelect name='status' label='Statuses' options={['draft', 'active', 'archived'].map((value) => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1) }))} />
        <ProductFilterSelect name='label' label='Labels' options={productLabelOptions.map((value) => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1) }))} />
        <ProductFilterSelect name='availability' label='Availability' options={[{ value: 'true', label: 'In stock' }, { value: 'false', label: 'Out of stock' }]} />
        <ProductFilterSelect name='sort' label='Sort products' options={[
          { value: 'newest', label: 'Newest first' }, { value: 'oldest', label: 'Oldest first' },
          { value: 'name', label: 'Name: A to Z' }, { value: 'name_desc', label: 'Name: Z to A' },
          { value: 'price_asc', label: 'Price: low to high' }, { value: 'price_desc', label: 'Price: high to low' },
          { value: 'stock_asc', label: 'Stock: low to high' }, { value: 'stock_desc', label: 'Stock: high to low' },
          { value: 'updated_desc', label: 'Recently updated' },
        ]} />
        <Button type='button' variant='outline' className='h-10 rounded-md' onClick={reset}>Reset filters</Button>
      </div>
      {categories.error && <p role='alert' className='text-sm text-red-700'>{categories.error.message}</p>}
    </div>
  )
}
