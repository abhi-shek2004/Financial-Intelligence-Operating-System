import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://127.0.0.1:8000/api/v1/:path*', // Proxy to Backend
      },
      {
        source: '/ws/stream',
        destination: 'http://127.0.0.1:8000/ws/stream', // Proxy WebSocket
      }
    ]
  },
};

export default nextConfig;
