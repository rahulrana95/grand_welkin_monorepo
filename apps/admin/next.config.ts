import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@welkinbliss/ui", "@welkinbliss/db"],
};

export default nextConfig;
