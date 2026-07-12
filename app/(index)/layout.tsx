import { IndexFooter } from "@/components/index/footer";
import { IndexHeader } from "@/components/index/header";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Suspense } from "react";

export default async function IndexLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <Suspense fallback={null}>
        <IndexHeader isLoggedIn={!!user} />
      </Suspense>
      <main className="flex-1">{children}</main>
      <IndexFooter />
    </div>
  );
}
