'use client'
import { FieldGroup } from '@/components/ui/field'
import { useAdminCategories } from '@/hooks/use-admin-endpoint'
import { categoryTypeOptions } from '@/lib/categories/category-options'
import { productColorOptions, productSizeOptions, productKaratOptions } from '@/lib/products/product-options'
import { CatalogFeedback } from '../feedback'
import { EditorCheck, EditorField } from './editor-field'

const options = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value.replaceAll('_', ' ') }))
export function ProductFields() {
  const categories = useAdminCategories()
  return (
    <FieldGroup>
      <CatalogFeedback message={categories.error?.message} error />
      <EditorField name="name" label="Product name" />
      <EditorField name="slug" label="URL slug" />
      <EditorField
        name="category_id"
        label="Category"
        options={[
          { value: '', label: 'Select a category' },
          ...(categories.data?.data ?? []).map((category) => ({ value: category.id, label: category.name })),
        ]}
      />
      <EditorField name="description" label="Description" multiline />
      <div className="grid gap-5 sm:grid-cols-2">
        <EditorField name="status" label="Status" options={options(['draft', 'active', 'archived'])} />
        <EditorField name="stock" label="Stock shared across all options" type="number" />
        <EditorField
          name="pricing_type"
          label="Price presentation"
          options={options(['fixed', 'starting_from'])}
        />
        <EditorField name="price" label="Fixed / starting price (NGN)" />
        <EditorField name="gold_weight_grams" label="Gold weight (grams)" />
        <EditorField name="making_charge" label="Making charge for gold-rate pricing (NGN)" />
      </div>
      <EditorCheck name="is_gold_karat_priced" label="Calculate price using manual gold rates" />
      <EditorField
        name="gold_karats"
        label={`Karats, separated by commas (${productKaratOptions.join(', ')})`}
      />
      <EditorField name="sizes" label={`Sizes, separated by commas (${productSizeOptions.join(', ')})`} />
      <EditorField name="colors" label={`Colors, separated by commas (${productColorOptions.join(', ')})`} />
      <EditorField
        name="label"
        label="Product label"
        options={options(['', 'best seller', 'new in', 'featured'])}
      />
      <EditorField name="details" label="Details (one per line)" multiline />
      <EditorField name="note" label="Additional note" multiline />
    </FieldGroup>
  )
}
export function CategoryFields() {
  return (
    <FieldGroup>
      <EditorField name="name" label="Category name" />
      <EditorField name="slug" label="URL slug" />
      <EditorField name="category_type" label="Category type" options={options(categoryTypeOptions)} />
      <EditorField name="description" label="Description" multiline />
      <EditorCheck name="is_active" label="Active category" />
      <EditorCheck name="is_featured" label="Show as a featured collection" />
      <EditorField name="sort_order" label="Sort order" type="number" />
      <EditorField name="featured_sort_order" label="Featured sort order" type="number" />
    </FieldGroup>
  )
}
export function BannerFields() {
  return (
    <FieldGroup>
      <EditorField name="title" label="Banner title" />
      <EditorField name="description" label="Description" multiline />
      <EditorField name="route" label="Website path (for example /shop)" />
      <EditorField name="sort_order" label="Sort order" type="number" />
      <EditorCheck name="is_active" label="Active banner" />
    </FieldGroup>
  )
}
