/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@messai/core', '@messai/ui'],
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig