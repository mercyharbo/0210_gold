import type { Metadata } from "next";
import { Bodoni_Moda, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500"],
});

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://0210-gold.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "0210 Gold | Premium Gold Jewellery and Personal Shopping",
    template: "%s | 0210 Gold",
  },
  description:
    "Shop premium gold jewellery, luxury fashion accessories, and request-based personal shopping pieces from 0210 Gold.",
  applicationName: "0210 Gold",
  authors: [{ name: "0210 Gold" }],
  creator: "0210 Gold",
  publisher: "0210 Gold",
  keywords: [
    "0210 Gold",
    "gold jewellery",
    "premium jewellery",
    "luxury accessories",
    "personal shopper",
    "gold necklaces",
    "gold rings",
    "gold earrings",
    "gold bracelets",
    "Nigeria jewellery",
    "UK jewellery",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "0210 Gold",
    title: "0210 Gold | Premium Gold Jewellery and Personal Shopping",
    description:
      "Premium gold jewellery, luxury fashion accessories, and personal shopping requests for timeless styling.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "0210 Gold premium jewellery and personal shopping",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "0210 Gold | Premium Gold Jewellery and Personal Shopping",
    description:
      "Premium gold jewellery, luxury fashion accessories, and personal shopping requests for timeless styling.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        bodoniModa.variable,
        geistMono.variable,
        "font-sans"
      )}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
