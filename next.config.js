/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ ส่วนที่เพิ่มใหม่: เพื่อแก้ Warning "Cross origin request detected"
  experimental: {
    allowedDevOrigins: [
      "localhost:3000",
      "192.168.1.57:3000", // IP เครื่องคุณที่ใช้เปิดเว็บ
    ],
  },

  // ✅ ส่วนเดิม: การตั้งค่ารูปภาพ (เก็บไว้เหมือนเดิม)
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '122.155.211.233',
        port: '8090',
        pathname: '/api/files/**',
      },
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