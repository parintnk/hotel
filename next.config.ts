import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // มี package-lock.json หลงอยู่ที่ ~/ ทำให้ Next เดา root ผิด — ล็อคไว้ที่โปรเจกต์นี้
  turbopack: { root: __dirname },
};

export default nextConfig;
