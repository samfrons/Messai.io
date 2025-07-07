/** @type {import('next').NextConfig} */
const nextConfig = {
  // Literature-specific Next.js configuration
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  
  // Literature-focused optimizations
  env: {
    LITERATURE_MODE: 'true',
    DEFAULT_PORT: '3004'
  },
  
  // CSP for literature system
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com https://unpkg.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              font-src 'self' https://fonts.gstatic.com;
              img-src 'self' data: blob: https:;
              connect-src 'self' https://openrouter.ai https://api.openrouter.ai;
              frame-src 'self';
              media-src 'self';
            `.replace(/\\s{2,}/g, ' ').trim()
          }
        ]
      }
    ]
  },

  // Webpack optimizations for literature features
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Literature-specific optimizations
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@literature': './components/literature',
        '@ai': './scripts/literature'
      }
    }

    // Bundle analyzer for literature builds
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './analyze/literature-bundle.html',
          openAnalyzer: false
        })
      )
    }

    return config
  },

  // Literature-specific redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/literature',
        permanent: false
      },
      {
        source: '/papers',
        destination: '/literature',
        permanent: false
      }
    ]
  },

  // Literature API rewrites
  async rewrites() {
    return [
      {
        source: '/api/literature/:path*',
        destination: '/api/literature/:path*'
      },
      {
        source: '/api/papers/:path*', 
        destination: '/api/papers/:path*'
      }
    ]
  }
}

module.exports = nextConfig