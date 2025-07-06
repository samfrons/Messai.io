/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  async headers() {
    // Only apply strict CSP in production
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com",
                "style-src 'self' 'unsafe-inline' https://accounts.google.com",
                "img-src 'self' data: https: blob:",
                "font-src 'self' data:",
                "connect-src 'self' https://accounts.google.com https://www.googleapis.com https://securetoken.googleapis.com https://raw.githack.com https://*.githack.com",
                "frame-src 'self' https://accounts.google.com",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self' https://accounts.google.com",
                "frame-ancestors 'none'",
                "upgrade-insecure-requests"
              ].join('; ')
            },
            {
              key: 'X-Frame-Options',
              value: 'SAMEORIGIN'
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin'
            },
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=()'
            }
          ]
        }
      ]
    }
    
    // In development, use a more permissive CSP
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src *; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';"
          }
        ]
      }
    ]
  },
  
  // Allow images from Google and other OAuth providers
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      }
    ],
  },
  
  // Suppress hydration warnings in development
  reactStrictMode: true,
  
  // Webpack configuration for Three.js
  webpack: (config, { isServer }) => {
    // Handle canvas for server-side
    if (isServer) {
      config.externals = [...(config.externals || []), { canvas: 'canvas' }]
    }
    
    // Fix for Three.js examples
    config.resolve.alias = {
      ...config.resolve.alias,
      'three/examples/jsm': path.join(__dirname, 'node_modules/three/examples/jsm'),
    }
    
    return config
  },
  
  // Transpile Three.js packages
  transpilePackages: ['three'],
}

module.exports = nextConfig