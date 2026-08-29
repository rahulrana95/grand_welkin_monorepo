import type { NextConfig } from "next";

/**
 * WelkinBliss web app config. See docs/welkinbliss/04-frontend-framework-and-deploy.md.
 */
const nextConfig: NextConfig = {
  // Self-contained server for small, portable Docker images (own-cloud SSR).
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,

  // Transpile the workspace design-system package.
  transpilePackages: ["@welkinbliss/ui"],

  images: {
    formats: ["image/avif", "image/webp"],
    // Real property imagery is served from the brand CDN (placeholder for now).
    remotePatterns: [{ protocol: "https", hostname: "cdn.welkinbliss.com" }],
  },

  // Partial Prerendering (static shell + streamed dynamic islands) — requires a
  // canary/16 build. Enable when on that channel:
  // experimental: { ppr: "incremental" },

  // Multi-instance ISR needs a shared cache handler (Redis/S3) so all pods agree
  // after revalidation — wire in production:
  // cacheHandler: process.env.NODE_ENV === "production" ? require.resolve("./cache-handler.cjs") : undefined,
  // cacheMaxMemorySize: 0,
};

export default nextConfig;
