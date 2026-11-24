'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { useSWRConfig } from 'swr'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAdminCategories } from '@/hooks/use-admin-endpoint'
import { useApiRequest } from '@/hooks/use-api-request'
import { affectedCatalogKey } from '@/lib/catalog/cache'
import { useToast } from '@/stores/hooks/use-toast'
import type { CatalogCategory } from '@/types/catalog'

export function CategoriesClient() {
  const { data, error, isLoading } = useAdminCategories()
  const { cache, mutate } = useSWRConfig()
  const { toast } = useToast()
  const request = useApiRequest()
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<CatalogCategory | null>(null)
  const query = search.trim().toLowerCase()
  const rows = (data?.data ?? []).filter((category) =>
    !query || category.name.toLowerCase().includes(query) || category.slug.includes(query))

  async function destroy() {
    if (!deleting || request.loading) return
    try {
      const response = await request.execute('delete', `/admin/categories/${deleting.id}`)
      setDeleting(null)
      toast(response.message || 'Category deleted successfully.', 'success')
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : 'Unable to delete the category.', 'failure')
      return
    }
    try {
      await mutate((key) => affectedCatalogKey(key, 'categories'))
      if (cache.get('/api/admin/categories')?.error) throw new Error('Refresh failed')
    } catch {
      toast('Category deleted, but refreshing failed. Refresh the list.', 'warning')
    }
  }

  return (
    <section className='flex flex-col gap-6'>
      <AdminPageHeader title='Categories management' description='Organize store taxonomy, product collections, and homepage featured edits.' />
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <Input aria-label='Search categories' placeholder='Search categories by name or slug…' value={search} onChange={(event) => setSearch(event.target.value)} className='max-w-md' />
        <Button asChild className='bg-black text-white hover:bg-gold'><Link href='/admin/categories/new'><Plus className='size-4' />Add category</Link></Button>
      </div>
      {error && <p role='alert' className='text-sm text-red-700'>{error.message}</p>}
      {isLoading ? <p role='status'>Loading…</p> : data && (
        <Card className='border-0 bg-gray-50 shadow-none'>
          <CardHeader>
            <CardTitle>Product categories</CardTitle>
            <CardDescription>Displaying {rows.length} categories</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Category</TableHead><TableHead>Type</TableHead><TableHead>Sort order</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {!rows.length && <TableRow><TableCell colSpan={5} className='py-8 text-center'>No categories found.</TableCell></TableRow>}
                {rows.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        {category.images[0] && <Image src={category.images[0].url} alt={category.images[0].alt} width={40} height={40} className='size-10 rounded-md object-cover' />}
                        <div className='flex flex-col gap-1'>
                          <Link href={`/admin/categories/${category.id}`} className='font-medium hover:text-gold hover:underline'>{category.name}</Link>
                          <span className='text-xs text-gray-600'>{category.slug}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{category.category_type}</TableCell>
                    <TableCell>{category.sort_order}</TableCell>
                    <TableCell>{category.is_active ? 'Active' : 'Inactive'}{category.is_featured ? ' · Featured' : ''}</TableCell>
                    <TableCell><div className='flex gap-2'>
                      <Button variant='outline' size='sm' asChild><Link href={`/admin/categories/${category.id}`}>Edit</Link></Button>
                      <Button variant='outline' size='sm' disabled={request.loading} onClick={() => setDeleting(category)}>Delete<span className='sr-only'> {category.name}</span></Button>
                    </div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      <Dialog open={!!deleting} onOpenChange={(open) => { if (!open && !request.loading) setDeleting(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete category?</DialogTitle><DialogDescription>Delete “{deleting?.name}”? Categories used by products cannot be deleted.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant='outline' disabled={request.loading} onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant='destructive' disabled={request.loading} onClick={() => void destroy()}>{request.loading ? 'Deleting…' : 'Delete category'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
