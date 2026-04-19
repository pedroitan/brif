/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@brif/ui', '@brif/db'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3001', '127.0.0.1:3001', '127.0.0.1:*', 'localhost:*'],
    },
  },
};

export default nextConfig;
