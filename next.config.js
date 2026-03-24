/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    forceSwcTransforms: false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'placehold.co' },
    ],
  },
}

module.exports = nextConfig
