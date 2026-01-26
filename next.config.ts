import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client'],
  turbopack: {
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  }
};

export default nextConfig;
