/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/student/dashboard',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
