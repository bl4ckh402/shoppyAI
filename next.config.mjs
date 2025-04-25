/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  images: {
    unoptimized: true,
  },
  // Ensure URLs are handled correctly in development
  assetPrefix: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : undefined,
  // Disable HTTPS in development
  server: {
    https: false
  }
};

export default nextConfig;
