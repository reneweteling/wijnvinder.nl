FROM node:22-slim

WORKDIR /app

RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
RUN pnpm i --frozen-lockfile

COPY . .
RUN pnpm generate
RUN pnpm run build

EXPOSE 3000

ENV NODE_ENV="production"
ENV PORT="3000"

CMD ["pnpm", "--filter", "web", "start"]
