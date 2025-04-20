import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.watchOptions = {
      poll: 300,
      aggregateTimeout: 300,
    };
    return config;
  },
  // SWCを使用し、Babel設定を無視する
  // swcMinify: true, // Next.js 13以降はデフォルトで有効なため不要
  experimental: {
    forceSwcTransforms: true,
  },
};

export default nextConfig;
