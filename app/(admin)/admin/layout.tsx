import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { requireAdmin } from "@/lib/auth/session"
import { getAuthProvider } from '@/lib/auth/provider'
import { requireCatalogAdmin } from '@/lib/auth/catalog-admin'
import { CatalogAdminShell } from '@/components/catalog/admin/shell'


export default async function RootAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (getAuthProvider() === 'neon') {
    await requireCatalogAdmin()
    return <CatalogAdminShell>{children}</CatalogAdminShell>
  }
  await requireAdmin()

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="flex flex-col">
        <AdminHeader />
        <main className="flex-1 bg-background p-6 md:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
