import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { ProductsClient } from '@/components/admin/products-client'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export default async function AdminProductsPage() {
  const supabase = createSupabaseAdminClient()

  const { data: productsData } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })

  const products = (productsData || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    stock: p.stock,
    status: p.status,
    category_name: p.categories?.name,
    image_src: p.image_src || (p.image_urls?.[0] ?? '/images/placeholder.jpg'),
    created_at: p.created_at,
    making_charge: p.making_charge,
    is_gold_karat_priced: p.is_gold_karat_priced,
    gold_weight_grams: p.gold_weight_grams,
    gold_karats: p.gold_karats,
    pricing_type: p.pricing_type,
  }))

  return (
    <div className='flex flex-col gap-6 bg-white text-black'>
      <AdminPageHeader
        title='Products Management'
        description='Manage jewelry, luxury fashion items, categories, and inventory stock.'
      />

      <ProductsClient products={products} />
    </div>
  )
}
