/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // อันเก่า (สำหรับ Server จริง)
      {
        protocol: 'http',
        hostname: '122.155.211.233',
        port: '8090',
        pathname: '/api/files/**',
      },
      // อันใหม่ (สำหรับรันที่เครื่องตัวเอง - localhost)
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8090',
        pathname: '/api/files/**',
      },
    ],
  },
};

module.exports = nextConfig;