import type { NextConfig } from "next";

/**
 * WelkinBliss web app config. See docs/welkinbliss/04-frontend-framework-and-deploy.md.
 */
const nextConfig: NextConfig = {
  // Self-contained server for small, portable Docker images (own-cloud SSR).
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,

  // Transpile workspace packages consumed as TS source.
  transpilePackages: ["@welkinbliss/ui", "@welkinbliss/availability", "@welkinbliss/db"],

  images: {
    formats: ["image/avif", "image/webp"],
    // Real property imagery: brand CDN + Supabase Storage public objects.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.welkinbliss.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },

  // Baseline security headers (applied to every route).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
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
