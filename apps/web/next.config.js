/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@messai/core', '@messai/ui'],
  typescript: {
    ignoreBuildErrors: true, // TODO: Remove after fixing TypeScript issues
  },
  eslint: {
    ignoreDuringBuilds: true, // TODO: Remove after fixing ESLint issues
  },
  experimental: {
    optimizePackageImports: ['@react-three/fiber', '@react-three/drei', 'three'],
  },
  // Optimize font loading
  images: {
    remotePatterns: [],
  },
  // Add bundle analyzer in development
  webpack: (config, { dev, isServer }) => {
    // Optimize for Three.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
    }
    
    return config
  },
}

module.exports = nextConfig