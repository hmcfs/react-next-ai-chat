import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ['some-package'],

  // 某些版本需要显式开启
  productionBrowserSourceMaps: false, // 开发模式默认开启，生产建议关闭
};

export default nextConfig;
