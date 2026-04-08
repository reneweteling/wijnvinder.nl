FROM node:22-slim

WORKDIR /app

RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY apps/web/lib/db/schema.zmodel ./apps/web/lib/db/schema.zmodel
RUN pnpm i --frozen-lockfile

COPY . .

# Build-time env vars (safe dummy values for static generation)
ARG BETTER_AUTH_SECRET=build-time-placeholder
ARG BETTER_AUTH_BASE_URL=https://wijnvinder.nl
ARG DATABASE_URL=postgres://placeholder:placeholder@localhost:5432/placeholder
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV BETTER_AUTH_BASE_URL=$BETTER_AUTH_BASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN pnpm run build

EXPOSE 3000

ENV NODE_ENV="production"
ENV PORT="3000"

CMD ["pnpm", "--filter", "web", "start"]
