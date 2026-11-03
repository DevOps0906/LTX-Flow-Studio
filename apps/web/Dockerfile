# 웹(Next.js 16) — 디자인·UI 확인용 이미지
FROM node:26-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM deps AS build
# 브라우저가 호출하는 워커 주소(빌드 시점에 번들에 포함됨)
ARG NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL NEXT_TELEMETRY_DISABLED=1
COPY apps/web apps/web
RUN pnpm --filter @ltx/web build

FROM build AS run
ENV NODE_ENV=production
USER node
EXPOSE 3000
# 컨테이너 안에서는 0.0.0.0, 호스트 공개는 compose가 127.0.0.1로만 제한
CMD ["pnpm", "--filter", "@ltx/web", "exec", "next", "start", "--hostname", "0.0.0.0", "--port", "3000"]
