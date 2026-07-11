import type { NextConfig } from "next";

function getSupabaseHostname() {
  if (!process.env.SUPABASE_URL) {
    return undefined;
  }

  try {
    return new URL(process.env.SUPABASE_URL).hostname;
  } catch {
    return undefined;
  }
}

const supabaseHostname = getSupabaseHostname();

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
          },
        ]
      : [],
  },
};

export default nextConfig;
