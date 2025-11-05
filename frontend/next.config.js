/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export' disabled for development/testing with dynamic routes
  // Enable only for production static build if needed
  // output: 'export',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
