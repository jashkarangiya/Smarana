-- CreateEnum
CREATE TYPE "AvatarSource" AS ENUM ('GOOGLE', 'UPLOAD', 'NONE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarSource" "AvatarSource" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "avatarUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "blobImageUrl" TEXT,
ADD COLUMN     "blobPathname" TEXT,
ADD COLUMN     "googleImageUrl" TEXT;

-- CreateTable
CREATE TABLE "XpEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT,
    "kind" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "dateKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XpEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "XpEvent_userId_dateKey_idx" ON "XpEvent"("userId", "dateKey");

-- CreateIndex
CREATE UNIQUE INDEX "XpEvent_userId_kind_problemId_dateKey_key" ON "XpEvent"("userId", "kind", "problemId", "dateKey");

-- AddForeignKey
ALTER TABLE "XpEvent" ADD CONSTRAINT "XpEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XpEvent" ADD CONSTRAINT "XpEvent_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "RevisionProblem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
