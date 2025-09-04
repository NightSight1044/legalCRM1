/** @type {import('next').NextConfig} */
const nextConfig = {
  // produce a static export compatible with GitHub Pages
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig

