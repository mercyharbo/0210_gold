import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import { cn } from "@/lib/utils";
import { QueryParamToast } from "@/components/query-param-toast";
import { ToastProvider } from "@/components/toast-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500"],
});

const melodrama = localFont({
  src: [
    {
      path: "./fonts/Melodrama-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Melodrama-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Melodrama-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Melodrama-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-melodrama",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.SITE_URL ?? "https://fm-luxe.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FM LUXE | Premium Gold Jewellery and Custom Requests",
    template: "%s | FM LUXE",
  },
  description:
    "Shop premium gold jewellery, luxury fashion accessories, and request-based pieces from FM LUXE.",
  applicationName: "FM LUXE",
  authors: [{ name: "FM LUXE" }],
  creator: "FM LUXE",
  publisher: "FM LUXE",
  keywords: [
    "FM LUXE",
    "gold jewellery",
    "premium jewellery",
    "luxury accessories",
    "custom requests",
    "shopping requests",
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
    siteName: "FM LUXE",
    title: "FM LUXE | Premium Gold Jewellery and Custom Requests",
    description:
      "Premium gold jewellery, luxury fashion accessories, and custom shopping requests for timeless styling.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FM LUXE premium jewellery and custom requests",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FM LUXE | Premium Gold Jewellery and Custom Requests",
    description:
      "Premium gold jewellery, luxury fashion accessories, and custom shopping requests for timeless styling.",
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
        melodrama.variable,
        geistMono.variable,
        "font-sans"
      )}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {children}
          <Suspense fallback={null}>
            <QueryParamToast />
          </Suspense>
          <ToastProvider />
        </TooltipProvider>
      </body>
    </html>
  );
}
