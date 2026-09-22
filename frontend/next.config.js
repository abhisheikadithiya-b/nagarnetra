/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true
  },
  async rewrites() {
    return [
      {
        source: '/v1/:path*',
        destination: 'http://127.0.0.1:8000/v1/:path*'
      },
      {
        source: '/healthz',
        destination: 'http://127.0.0.1:8000/healthz'
      },
      {
        source: '/docs',
        destination: 'http://127.0.0.1:8000/docs'
      },
      {
        source: '/openapi.json',
        destination: 'http://127.0.0.1:8000/openapi.json'
      }
    ];
  }
};

module.exports = nextConfig;
