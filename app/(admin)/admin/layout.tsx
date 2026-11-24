import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"


export default function RootAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
