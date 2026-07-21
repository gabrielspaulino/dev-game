import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use Node.js runtime by default for all server-side routes
  // Edge runtime must be opted into explicitly per route
  experimental: {
    typedRoutes: false,
  },
  // Disallow importing server-only modules in client components
  // (enforced via `server-only` package in those modules)
  serverExternalPackages: ["pino", "pino-pretty"],
};

export default nextConfig;
