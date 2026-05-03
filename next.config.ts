import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'coin-images.coingecko.com' },
      { protocol: 'https', hostname: 'logo.moralis.io' },
      { protocol: 'https', hostname: 'cdn.moralis.io' },
      { protocol: 'https', hostname: 'market-data-images.s3.us-east-1.amazonaws.com' },
      { protocol: 'https', hostname: '**.seadn.io' },
      { protocol: 'https', hostname: 'openseauserdata.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
  },
  experimental: {
    optimizePackageImports: [
      '@fortawesome/react-fontawesome',
      '@fortawesome/free-solid-svg-icons',
      '@fortawesome/free-regular-svg-icons',
      '@fortawesome/free-brands-svg-icons',
      'lucide-react',
      'recharts',
    ],
  },
};

export default nextConfig;
