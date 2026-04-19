import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@brif/ui', '@brif/db'],
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
    outputFileTracingIncludes: {
      '/**/*': [
        '../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/**/*',
        '../../node_modules/.pnpm/@prisma+client@*/node_modules/@prisma/client/**/*',
      ],
    },
    serverComponentsExternalPackages: ['@prisma/client', '.prisma/client'],
    serverActions: {
      allowedOrigins: ['localhost:3001', '127.0.0.1:3001', '127.0.0.1:*', 'localhost:*'],
    },
  },
};

export default nextConfig;
