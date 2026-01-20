import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",

  // Disable image optimization for self-hosting (optional: can use external service)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
