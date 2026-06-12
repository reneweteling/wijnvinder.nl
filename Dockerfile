FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

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

# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so they
# must be present here. SENTRY_AUTH_TOKEN lets the build upload source maps.
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_GOOGLE_GTM_ID
ARG SENTRY_AUTH_TOKEN
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_GOOGLE_GTM_ID=$NEXT_PUBLIC_GOOGLE_GTM_ID
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN

RUN pnpm run build

EXPOSE 3000

ENV NODE_ENV="production"
ENV PORT="3000"

CMD ["pnpm", "--filter", "web", "start"]
