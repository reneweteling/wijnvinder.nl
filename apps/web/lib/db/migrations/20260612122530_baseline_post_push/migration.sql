-- AlterTable
ALTER TABLE "shop" ADD COLUMN     "affiliateLinkTemplate" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "weeklyDealsOptIn" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "outbound_click" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "listingId" TEXT,
    "canonicalWineId" TEXT,
    "source" TEXT,
    "referer" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outbound_click_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "originalPrice" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "outbound_click_shopId_createdAt_idx" ON "outbound_click"("shopId", "createdAt");

-- CreateIndex
CREATE INDEX "outbound_click_listingId_idx" ON "outbound_click"("listingId");

-- CreateIndex
CREATE INDEX "outbound_click_canonicalWineId_createdAt_idx" ON "outbound_click"("canonicalWineId", "createdAt");

-- CreateIndex
CREATE INDEX "price_history_listingId_recordedAt_idx" ON "price_history"("listingId", "recordedAt");

-- CreateIndex
CREATE INDEX "shop_listing_canonicalWineId_available_price_idx" ON "shop_listing"("canonicalWineId", "available", "price");

-- AddForeignKey
ALTER TABLE "outbound_click" ADD CONSTRAINT "outbound_click_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbound_click" ADD CONSTRAINT "outbound_click_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "shop_listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "shop_listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
