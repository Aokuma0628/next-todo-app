import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (isServer) {
      console.log('🔍 ビルド時環境変数チェック:')
      console.log('DATABASE_URL存在:', !!process.env.DATABASE_URL)
      console.log('DATABASE_URL先頭:', process.env.DATABASE_URL?.substring(0, 30))
      console.log('NODE_ENV:', process.env.NODE_ENV)
    }
    return config
  },
}

export default nextConfig;
