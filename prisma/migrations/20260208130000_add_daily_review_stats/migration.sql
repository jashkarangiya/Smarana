-- AlterTable
ALTER TABLE "User" ADD COLUMN "streakCurrent" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "streakLongest" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "streakLastDate" TEXT;

-- AlterTable
ALTER TABLE "ReviewEvent" ADD COLUMN "dateKey" TEXT;
ALTER TABLE "ReviewEvent" ADD COLUMN "timezone" TEXT;

-- Backfill ReviewEvent dateKey/timezone (UTC baseline)
UPDATE "ReviewEvent"
SET "dateKey" = TO_CHAR("reviewedAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD'),
    "timezone" = 'UTC'
WHERE "dateKey" IS NULL;

ALTER TABLE "ReviewEvent" ALTER COLUMN "dateKey" SET NOT NULL;
ALTER TABLE "ReviewEvent" ALTER COLUMN "timezone" SET NOT NULL;

-- CreateTable
CREATE TABLE "DailyReviewStat" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyReviewStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyReviewStat_userId_dateKey_key" ON "DailyReviewStat"("userId", "dateKey");
CREATE INDEX "DailyReviewStat_userId_dateKey_idx" ON "DailyReviewStat"("userId", "dateKey");

-- AddForeignKey
ALTER TABLE "DailyReviewStat" ADD CONSTRAINT "DailyReviewStat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill daily stats from ReviewLog (UTC)
INSERT INTO "DailyReviewStat" ("id", "userId", "dateKey", "timezone", "reviewCount", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), "userId", "day", 'UTC', "count", COALESCE("createdAt", CURRENT_TIMESTAMP), CURRENT_TIMESTAMP
FROM "ReviewLog"
ON CONFLICT ("userId", "dateKey") DO UPDATE
SET "reviewCount" = EXCLUDED."reviewCount",
    "updatedAt" = CURRENT_TIMESTAMP;

-- Backfill user streak cache from UserStats/ReviewLog
UPDATE "User" u
SET "streakCurrent" = COALESCE(s."currentStreak", 0),
    "streakLongest" = COALESCE(s."longestStreak", 0)
FROM "UserStats" s
WHERE s."userId" = u."id";

UPDATE "User" u
SET "streakLastDate" = sub."day"
FROM (
    SELECT "userId", MAX("day") AS "day"
    FROM "ReviewLog"
    GROUP BY "userId"
) sub
WHERE sub."userId" = u."id";
