import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['some-package'],
  productionBrowserSourceMaps: false,
  experimental: {
    // 请求体经 proxy.ts 时的缓冲上限，默认 10MB；图片/文件上传需要更大
    proxyClientMaxBodySize: '50mb',
  },
};

export default nextConfig;
