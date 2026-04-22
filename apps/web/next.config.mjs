import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@brif/ui', '@brif/db'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [],
    unoptimized: true,
  },
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
    outputFileTracingIncludes: {
      '/**/*': [
        '../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/**/*',
        '../../node_modules/.pnpm/@prisma+client@*/node_modules/@prisma/client/**/*',
        '../../node_modules/.pnpm/@ffmpeg-installer+*/node_modules/@ffmpeg-installer/**/*',
      ],
    },
    serverComponentsExternalPackages: [
      '@prisma/client',
      '.prisma/client',
      '@ffmpeg-installer/ffmpeg',
      'fluent-ffmpeg',
    ],
    serverActions: {
      bodySizeLimit: '100mb', // para upload de áudio
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000', '127.0.0.1:*', 'localhost:*'],
    },
  },
};

export default nextConfig;
