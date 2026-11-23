'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useSWRConfig } from 'swr'
import { affectedCatalogKey } from '@/lib/catalog/cache'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminCatalogRecords } from '@/hooks/use-admin-endpoint'
import { useApiRequest } from '@/hooks/use-api-request'
import type { CatalogKind } from '@/types/catalog'
import type { CatalogRecord } from '@/lib/catalog/editor'
import { CatalogFeedback } from '../feedback'

export function CatalogRecordList({ kind }: { kind: CatalogKind }) {
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<CatalogRecord | null>(null)
  const { mutate } = useSWRConfig()
  
  const { data, error, isLoading } = useAdminCatalogRecords(kind, page)
  const mutation = useApiRequest()
  const [refreshMessage, setRefreshMessage] = useState('')
  const rows = Array.isArray(data?.data) ? data.data : (data?.data?.items ?? [])
  const total = Array.isArray(data?.data) ? rows.length : (data?.data?.total ?? 0)
  const target = kind === 'banners' ? 'hero-banners' : kind
  async function destroy() {
    if (!deleteTarget) return
    try {
      await mutation.execute('delete', `/admin/${kind}/${deleteTarget.id}`)
    } catch {
      return
    }
    setDeleteTarget(null)
    try {
      await mutate((key) => affectedCatalogKey(key, kind))
    } catch {
      setRefreshMessage('Deleted successfully. Refresh the list to see the latest records.')
    }
  }
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">
          {kind === 'products' ? 'Products' : kind === 'categories' ? 'Categories' : 'Hero banners'}
        </h1>
        <Button asChild>
          <Link href={`/admin/${target}/new`}>
            Create {kind === 'categories' ? 'category' : kind === 'products' ? 'product' : 'banner'}
          </Link>
        </Button>
      </div>
      <CatalogFeedback message={error?.message || mutation.error?.message} error />
      <CatalogFeedback message={refreshMessage} />
      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : rows.length ? (
        <div className="overflow-x-auto rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="whitespace-normal break-words">
                    {'name' in record ? record.name : record.title}
                  </TableCell>
                  <TableCell>
                    {'status' in record ? record.status : record.is_active ? 'Active' : 'Inactive'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/${target}/${record.id}`}>Edit</Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setDeleteTarget(record)}>
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <CatalogFeedback message="No records yet. Create your first item to get started." />
      )}
      {kind === 'products' && (
        <div className="flex items-center justify-between gap-3 text-sm">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span>
            {total} products · Page {page}
          </span>
          <Button variant="outline" disabled={page * 24 >= total} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !mutation.loading) setDeleteTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this record?</DialogTitle>
            <DialogDescription>
              This removes the catalog record. Categories still used by products cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <CatalogFeedback message={mutation.error?.message} error />
          <DialogFooter>
            <Button variant="outline" disabled={mutation.loading} onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button disabled={mutation.loading} onClick={() => void destroy()}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
