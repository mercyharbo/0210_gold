import { IndexFooter } from "@/components/index/footer";
import { IndexHeader } from "@/components/index/header";
import { Suspense } from "react";

export default function IndexLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <Suspense fallback={null}>
        <IndexHeader />
      </Suspense>
      <main className="flex-1">{children}</main>
      <IndexFooter />
    </div>
  );
}
