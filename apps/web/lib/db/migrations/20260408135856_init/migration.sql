-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "idToken" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wine_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "wineTypes" TEXT[],
    "grapes" TEXT[],
    "flavors" TEXT[],
    "countries" TEXT[],
    "priceMin" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "priceMax" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wine_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vivino_rating" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "vivinoUsername" TEXT,
    "wineName" TEXT NOT NULL,
    "vintage" INTEGER,
    "rating" DOUBLE PRECISION NOT NULL,
    "grape" TEXT,
    "country" TEXT,
    "region" TEXT,
    "wineType" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vivino_rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producer" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "region" TEXT,
    "description" TEXT,
    "website" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "logoUrl" TEXT,
    "description" TEXT,
    "referralParam" TEXT,
    "referralEnabled" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canonical_wine" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "producerId" TEXT,
    "grape" TEXT,
    "grapes" TEXT[],
    "country" TEXT,
    "region" TEXT,
    "wineType" TEXT,
    "vintage" INTEGER,
    "vivinoScore" DOUBLE PRECISION,
    "vivinoScoreCount" INTEGER,
    "vivinoUrl" TEXT,
    "searchName" TEXT NOT NULL,
    "imageUrl" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canonical_wine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_listing" (
    "id" TEXT NOT NULL,
    "canonicalWineId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "originalPrice" DOUBLE PRECISION,
    "url" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT,
    "rawName" TEXT NOT NULL,
    "rawProducer" TEXT,
    "rating" DOUBLE PRECISION,
    "description" TEXT,
    "lastScrapedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_wine" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wineId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "favorite_wine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scrape_job" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "listingsFound" INTEGER NOT NULL DEFAULT 0,
    "listingsMatched" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scrape_job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "wine_profile_userId_key" ON "wine_profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "producer_slug_key" ON "producer"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "producer_name_key" ON "producer"("name");

-- CreateIndex
CREATE INDEX "producer_name_idx" ON "producer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "shop_slug_key" ON "shop"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "canonical_wine_slug_key" ON "canonical_wine"("slug");

-- CreateIndex
CREATE INDEX "canonical_wine_searchName_idx" ON "canonical_wine"("searchName");

-- CreateIndex
CREATE INDEX "canonical_wine_wineType_idx" ON "canonical_wine"("wineType");

-- CreateIndex
CREATE INDEX "canonical_wine_country_idx" ON "canonical_wine"("country");

-- CreateIndex
CREATE INDEX "canonical_wine_vivinoScore_idx" ON "canonical_wine"("vivinoScore");

-- CreateIndex
CREATE INDEX "canonical_wine_producerId_idx" ON "canonical_wine"("producerId");

-- CreateIndex
CREATE INDEX "shop_listing_shopId_idx" ON "shop_listing"("shopId");

-- CreateIndex
CREATE INDEX "shop_listing_price_idx" ON "shop_listing"("price");

-- CreateIndex
CREATE UNIQUE INDEX "shop_listing_shopId_url_key" ON "shop_listing"("shopId", "url");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_wine_userId_wineId_key" ON "favorite_wine"("userId", "wineId");

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wine_profile" ADD CONSTRAINT "wine_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canonical_wine" ADD CONSTRAINT "canonical_wine_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "producer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_listing" ADD CONSTRAINT "shop_listing_canonicalWineId_fkey" FOREIGN KEY ("canonicalWineId") REFERENCES "canonical_wine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_listing" ADD CONSTRAINT "shop_listing_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_wine" ADD CONSTRAINT "favorite_wine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_wine" ADD CONSTRAINT "favorite_wine_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "canonical_wine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scrape_job" ADD CONSTRAINT "scrape_job_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
