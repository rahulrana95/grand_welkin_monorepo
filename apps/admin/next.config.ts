import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No `output: "standalone"` — it's for Docker/self-host, and on Vercel it makes
  // page routes 404 (middleware deploys, page functions don't). The admin has no
  // Docker image, so plain Vercel output is correct.
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
