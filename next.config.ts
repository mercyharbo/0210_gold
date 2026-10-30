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
const storageHostname = process.env.AWS_ENDPOINT_URL_S3 ? new URL(process.env.AWS_ENDPOINT_URL_S3).hostname : undefined;

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    unoptimized: true,
    remotePatterns: [supabaseHostname, storageHostname].filter((host): host is string => !!host)
      .map((hostname) => ({ protocol: 'https' as const, hostname })),
  },
};

export default nextConfig;
