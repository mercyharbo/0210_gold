'use client'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminCatalogRecord } from '@/hooks/use-admin-endpoint'
import type { CatalogKind } from '@/types/catalog'
import { CatalogFeedback } from '../feedback'
import { CatalogRecordEditor } from './record-editor'

export function CatalogEditorLoader({ kind, id }: { kind: CatalogKind; id?: string }) {
  const { data, error, isLoading } = useAdminCatalogRecord(kind, id)
  if (error) return <CatalogFeedback message={error.message} error />
  if (id && (isLoading || !data?.data)) return <Skeleton className="h-96 w-full" />
  return <CatalogRecordEditor key={id ?? 'new'} kind={kind} record={data?.data} />
}
