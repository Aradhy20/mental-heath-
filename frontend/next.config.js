/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.BACKEND_URL
          ? `${process.env.BACKEND_URL}/api/:path*`
          : 'http://localhost:5000/api/:path*',
      },
      {
        source: '/docs',
        destination: process.env.BACKEND_URL
          ? `${process.env.BACKEND_URL}/docs`
          : 'http://127.0.0.1:8000/docs',
      },
      {
        source: '/openapi.json',
        destination: process.env.BACKEND_URL
          ? `${process.env.BACKEND_URL}/openapi.json`
          : 'http://127.0.0.1:8000/openapi.json',
      }
    ]
  },
}

module.exports = nextConfig
