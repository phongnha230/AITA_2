import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: fileURLToPath(new URL('.', import.meta.url)),
  async redirects() {
    return [
      // 1. Alias /lecture -> /lecturer
      {
        source: '/lecture',
        destination: '/lecturer/dashboard',
        permanent: false,
      },
      {
        source: '/lecture/:path*',
        destination: '/lecturer/:path*',
        permanent: false,
      },
      // 2. Backward compatibility for legacy lecturer paths without prefix:
      {
        source: '/dashboard',
        destination: '/lecturer/dashboard',
        permanent: false,
      },
      {
        source: '/courses',
        destination: '/lecturer/courses',
        permanent: false,
      },
      {
        source: '/courses/:id',
        destination: '/lecturer/courses/:id',
        permanent: false,
      },
      {
        source: '/exam-bank',
        destination: '/lecturer/exam-bank',
        permanent: false,
      },
      {
        source: '/exam-bank/:path*',
        destination: '/lecturer/exam-bank/:path*',
        permanent: false,
      },
      {
        source: '/live-proctoring',
        destination: '/lecturer/live-proctoring',
        permanent: false,
      },
      {
        source: '/live-proctoring/:path*',
        destination: '/lecturer/live-proctoring/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
