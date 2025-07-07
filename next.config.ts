import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Custom loader untuk bypass semua external domains
    loader: 'custom',
    loaderFile: './utils/image-loader.ts',
    
    // Tetap keep remotePatterns untuk optimization domains tertentu
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'coin-images.coingecko.com',
        port: '',
        pathname: '/**',
       },
    ],
  },
};
export default nextConfig;
