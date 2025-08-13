/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow ngrok domain for OAuth callback development
  allowedDevOrigins: [
    'set-akita-deadly.ngrok-free.app'
  ],
  // Enhanced headers for OAuth flows
  async headers() {
    return [
      {
        source: '/callback/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, max-age=0, must-revalidate'
          }
        ]
      }
    ]
  },
  images: {
    domains: [
      'localhost',
      		'prolychat.vercel.app',
      'scontent.cdninstagram.com',
      'graph.instagram.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.cdninstagram.com'
      },
      {
        protocol: 'https',
        hostname: '*.fbcdn.net'
      },
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com'
      }
    ],
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
