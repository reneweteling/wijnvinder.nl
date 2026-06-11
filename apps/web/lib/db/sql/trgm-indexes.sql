-- pg_trgm extension and trigram GIN indexes for fuzzy search.
--
-- IMPORTANT: ZenStack/Prisma does not support GIN index types in the schema,
-- so `pnpm db:push` drops these indexes every time it runs.
-- You must re-run this file after every db:push that touches canonical_wine or producer.
--
-- Run with:
--   docker exec -i wijnvindernl-db-1 psql -U postgres -d wijn -f - < apps/web/lib/db/sql/trgm-indexes.sql

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX CONCURRENTLY IF NOT EXISTS canonical_wine_name_trgm_idx
  ON canonical_wine USING gin (name gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS canonical_wine_search_name_trgm_idx
  ON canonical_wine USING gin ("searchName" gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS canonical_wine_grape_trgm_idx
  ON canonical_wine USING gin (grape gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS producer_name_trgm_idx
  ON producer USING gin (name gin_trgm_ops);
