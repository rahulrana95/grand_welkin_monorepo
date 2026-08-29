# WelkinBliss web — standalone SSR image (small, portable; docs 04 §4).
# Build from the repo root:  docker build -f apps/web/Dockerfile -t welkinbliss-web .

FROM node:22-bookworm-slim AS builder
WORKDIR /repo
RUN corepack enable
# Manifests first for cached installs
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY libs/ui/package.json libs/ui/
RUN pnpm install --frozen-lockfile
# Sources (generated @acme/proto-ts is produced upstream by Bazel/Buf in CI)
COPY . .
RUN pnpm --filter @welkinbliss/web build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
# `standalone` traces every needed file
COPY --from=builder /repo/apps/web/.next/standalone ./
COPY --from=builder /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /repo/apps/web/public ./apps/web/public
USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
