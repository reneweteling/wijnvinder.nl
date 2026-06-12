-- CreateTable
CREATE TABLE "sommelier_question" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "ipHash" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sommelier_question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sommelier_question_userId_createdAt_idx" ON "sommelier_question"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "sommelier_question_ipHash_createdAt_idx" ON "sommelier_question"("ipHash", "createdAt");
