import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "true" && !process.env.VERCEL;

const nextConfig: NextConfig = {
  /** Hides the floating Next.js dev badge (N in a circle) in development. */
  devIndicators: false,
  /** Static export only when explicitly requested, not on Vercel */
  ...(isStaticExport ? { output: "export" as const } : {}),
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

