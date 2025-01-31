import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['coin-images.coingecko.com', 'logo.moralis.io', 'cdn.moralis.io', 'market-data-images.s3.us-east-1.amazonaws.com']
  }
};

export default nextConfig;
