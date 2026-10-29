import { Suspense } from "react";
import { getStoreSettingsAction } from "@/app/(admin)/admin/settings/actions";
import { IndexFooter } from "@/components/index/footer";
import { IndexHeader } from "@/components/index/header";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthProvider } from '@/lib/auth/provider'
import { ShoppingUnavailable } from '@/components/auth/neon/shopping-unavailable'

export default async function IndexLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (getAuthProvider() === 'neon') return <ShoppingUnavailable />
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const settings = await getStoreSettingsAction()

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <Suspense fallback={null}>
        <IndexHeader isLoggedIn={!!user} />
      </Suspense>
      <main className="flex-1">{children}</main>
      <IndexFooter settings={settings} />
    </div>
  );
}

