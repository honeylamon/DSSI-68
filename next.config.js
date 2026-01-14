/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1', // IP ของ PocketBase
        port: '8090',          // Port ของ PocketBase
        pathname: '/api/files/**',
      },
      // เพิ่มบรรทัดนี้เผื่อไว้ ถ้าเผลอใช้ localhost แทน 127.0.0.1
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8090',
        pathname: '/api/files/**',
      },
    ],
  },
}

module.exports = nextConfig