import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`, // Proxy to Backend
      },
      {
        source: '/ws/stream',
        destination: `${backendUrl}/ws/stream`, // Proxy WebSocket (Next.js automatically upgrades HTTP to WS)
      }
    ]
  },
};

export default nextConfig;
