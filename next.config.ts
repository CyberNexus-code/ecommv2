import type { NextConfig } from "next";
import { hostname } from "os";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hjtnoppffqxscqreuahe.supabase.co"
      }
    ]
  }
};



export default nextConfig;
