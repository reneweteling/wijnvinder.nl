FROM node:22-slim

WORKDIR /app

RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY apps/web/lib/db/schema.zmodel ./apps/web/lib/db/schema.zmodel
RUN pnpm i --frozen-lockfile

COPY . .
RUN pnpm run build

EXPOSE 3000

ENV NODE_ENV="production"
ENV PORT="3000"

CMD ["pnpm", "--filter", "web", "start"]
