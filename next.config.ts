import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/saas',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.mlg-consulting.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.iplocate.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
