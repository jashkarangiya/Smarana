-- AlterTable
ALTER TABLE "ReviewEvent" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'web';
ALTER TABLE "ReviewEvent" ADD COLUMN "timeSpentMs" INTEGER;
ALTER TABLE "ReviewEvent" ADD COLUMN "clientEventId" TEXT;

-- Backfill source for existing rows
UPDATE "ReviewEvent"
SET "source" = 'web'
WHERE "source" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ReviewEvent_userId_clientEventId_key" ON "ReviewEvent"("userId", "clientEventId");
