/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@brif/ui', '@brif/db'],
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb', // para upload de áudio
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000', '127.0.0.1:*', 'localhost:*'],
    },
  },
};

export default nextConfig;
