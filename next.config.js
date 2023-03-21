/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  fontLoaders: false,
  experimental: { appDir: true }
}

module.exports = nextConfig
