/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  async rewrites() {
    return [
      {
        source: '/geojson/:path*',
        destination: '/geojson/:path*',
      },
    ]
  },
}

module.exports = nextConfig