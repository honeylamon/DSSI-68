/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '122.155.211.233', // IP ของ PocketBase
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1', // <-- นี่คือบรรทัดที่ผมเพิ่มให้
      },
      {
        protocol: 'https'         ,
        hostname: 'placehold.co', // รูป Banner
      },
    ],
  },
};

module.exports = nextConfig;

