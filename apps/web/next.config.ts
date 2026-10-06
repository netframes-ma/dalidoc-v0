import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The odontogram engine ships as an ESM-only package that touches `document`
  // on mount; it is always rendered from client components (see
  // src/features/dental-chart/components/OdontogramView.tsx).
  transpilePackages: ["react-advanced-odontogram"],
};

export default nextConfig;
