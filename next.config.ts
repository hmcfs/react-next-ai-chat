import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['some-package'],
  productionBrowserSourceMaps: false,
};

export default nextConfig;
