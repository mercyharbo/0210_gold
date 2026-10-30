import { CatalogEditorLoader } from '@/components/catalog/admin/editor-loader'
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <CatalogEditorLoader kind="categories" id={(await params).id} />
}
