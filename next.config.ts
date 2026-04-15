import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client'],
  turbopack: {
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'ngrok-skip-browser-warning', value: 'true' },
        ],
      },
    ]
  }
};

export default nextConfig;
