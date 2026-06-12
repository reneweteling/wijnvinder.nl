-- DropIndex
DROP INDEX "canonical_wine_grape_trgm_idx";

-- DropIndex
DROP INDEX "canonical_wine_name_trgm_idx";

-- DropIndex
DROP INDEX "canonical_wine_search_name_trgm_idx";

-- DropIndex
DROP INDEX "producer_name_trgm_idx";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';
