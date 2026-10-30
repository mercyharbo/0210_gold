'use client'
import { Skeleton } from '@/components/ui/skeleton'
import { useCatalogRead } from '@/hooks/use-catalog-endpoint'
import type { CatalogKind } from '@/types/catalog'
import type { CatalogRecord } from '@/lib/catalog/editor'
import { CatalogFeedback } from '../feedback'
import { CatalogRecordEditor } from './record-editor'

export function CatalogEditorLoader({ kind, id }: { kind: CatalogKind; id?: string }) {
  const { data, error, isLoading } = useCatalogRead<CatalogRecord>(id ? `/api/admin/${kind}/${id}` : null)
  if (error) return <CatalogFeedback message={error.message} error />
  if (id && (isLoading || !data?.data)) return <Skeleton className="h-96 w-full" />
  return <CatalogRecordEditor key={id ?? 'new'} kind={kind} record={data?.data} />
}
