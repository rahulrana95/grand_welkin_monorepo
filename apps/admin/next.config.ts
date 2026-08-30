import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@welkinbliss/ui", "@welkinbliss/db", "@welkinbliss/images"],
  // `sharp` is a native module — keep it external to the server bundle.
  serverExternalPackages: ["sharp"],
  experimental: {
    // Photo uploads post raw image bytes through a Server Action.
    serverActions: { bodySizeLimit: "15mb" },
  },
};

export default nextConfig;
