-- pg_trgm extension and trigram GIN indexes for fuzzy ILIKE search.
-- ZenStack/Prisma cannot declare GIN index types in the schema, so these are
-- maintained here. CONCURRENTLY is omitted because a migration runs inside a
-- transaction; on a fresh database the tables are empty so the lock is trivial.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS canonical_wine_name_trgm_idx
  ON canonical_wine USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS canonical_wine_search_name_trgm_idx
  ON canonical_wine USING gin ("searchName" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS canonical_wine_grape_trgm_idx
  ON canonical_wine USING gin (grape gin_trgm_ops);

CREATE INDEX IF NOT EXISTS producer_name_trgm_idx
  ON producer USING gin (name gin_trgm_ops);
