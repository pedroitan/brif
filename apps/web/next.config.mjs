/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@brif/ui', '@brif/db'],
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb', // para upload de áudio
    },
  },
};

export default nextConfig;
