import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/saas',
  async headers() {
    return [
      {
        source: '/events/:eventId/register',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://ia-avecnous.fr https://www.ia-avecnous.fr",
          },
        ],
      },
    ];
  },
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
