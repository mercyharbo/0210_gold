import { IndexFooter } from "@/components/index/footer";
import { IndexHeader } from "@/components/index/header";

export default function IndexLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <IndexHeader />
      <main className="flex-1">{children}</main>
      <IndexFooter />
    </div>
  );
}
