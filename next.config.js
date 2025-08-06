/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is now stable in Next.js 13+, no need for experimental flag
  eslint: {
    // Only show errors during build, ignore warnings for deployment
    ignoreDuringBuilds: false,
  },
  // Disable strict mode for faster builds
  reactStrictMode: false,
}

module.exports = nextConfig
