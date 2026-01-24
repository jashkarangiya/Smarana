/*
  Warnings:

  - You are about to drop the column `date` on the `ReviewLog` table. All the data in the column will be lost.
  - You are about to drop the column `isProfilePublic` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `showLeetCodePublicly` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `showStreakPublicly` on the `User` table. All the data in the column will be lost.
  - Added the required column `day` to the `ReviewLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserStats" ADD COLUMN "leetcodeActivity" TEXT;

-- CreateTable
CREATE TABLE "ReviewEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "reviewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interval" INTEGER NOT NULL,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ReviewEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReviewEvent_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "RevisionProblem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReviewLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ReviewLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ReviewLog" ("count", "id", "userId", "xpEarned") SELECT "count", "id", "userId", "xpEarned" FROM "ReviewLog";
DROP TABLE "ReviewLog";
ALTER TABLE "new_ReviewLog" RENAME TO "ReviewLog";
CREATE UNIQUE INDEX "ReviewLog_userId_day_key" ON "ReviewLog"("userId", "day");
CREATE TABLE "new_RevisionProblem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'leetcode',
    "problemSlug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "firstSolvedAt" DATETIME,
    "lastSolvedAt" DATETIME,
    "nextReviewAt" DATETIME NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" DATETIME,
    "notes" TEXT DEFAULT '',
    "solution" TEXT DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RevisionProblem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RevisionProblem" ("createdAt", "difficulty", "firstSolvedAt", "id", "interval", "lastReviewedAt", "lastSolvedAt", "nextReviewAt", "notes", "platform", "problemSlug", "reviewCount", "solution", "title", "updatedAt", "url", "userId") SELECT "createdAt", "difficulty", "firstSolvedAt", "id", "interval", "lastReviewedAt", "lastSolvedAt", "nextReviewAt", "notes", "platform", "problemSlug", "reviewCount", "solution", "title", "updatedAt", "url", "userId" FROM "RevisionProblem";
DROP TABLE "RevisionProblem";
ALTER TABLE "new_RevisionProblem" RENAME TO "RevisionProblem";
CREATE INDEX "RevisionProblem_userId_nextReviewAt_idx" ON "RevisionProblem"("userId", "nextReviewAt");
CREATE INDEX "RevisionProblem_userId_difficulty_idx" ON "RevisionProblem"("userId", "difficulty");
CREATE INDEX "RevisionProblem_userId_updatedAt_idx" ON "RevisionProblem"("userId", "updatedAt");
CREATE UNIQUE INDEX "RevisionProblem_userId_platform_problemSlug_key" ON "RevisionProblem"("userId", "platform", "problemSlug");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "password" TEXT,
    "image" TEXT,
    "username" TEXT,
    "usernameLower" TEXT,
    "usernameChangedAt" DATETIME,
    "usernameChangeCount" INTEGER NOT NULL DEFAULT 0,
    "leetcodeUsername" TEXT,
    "codeforcesUsername" TEXT,
    "codechefUsername" TEXT,
    "atcoderUsername" TEXT,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "profileVisibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "showStreak" BOOLEAN NOT NULL DEFAULT true,
    "showPlatforms" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_User" ("atcoderUsername", "codechefUsername", "codeforcesUsername", "createdAt", "email", "emailVerified", "id", "image", "leetcodeUsername", "level", "name", "password", "updatedAt", "username", "usernameChangeCount", "usernameChangedAt", "usernameLower", "xp") SELECT "atcoderUsername", "codechefUsername", "codeforcesUsername", "createdAt", "email", "emailVerified", "id", "image", "leetcodeUsername", "level", "name", "password", "updatedAt", "username", "usernameChangeCount", "usernameChangedAt", "usernameLower", "xp" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_usernameLower_key" ON "User"("usernameLower");
CREATE INDEX "User_usernameLower_idx" ON "User"("usernameLower");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ReviewEvent_userId_reviewedAt_idx" ON "ReviewEvent"("userId", "reviewedAt");

-- CreateIndex
CREATE INDEX "ReviewEvent_problemId_reviewedAt_idx" ON "ReviewEvent"("problemId", "reviewedAt");

-- CreateIndex
CREATE INDEX "FriendRequest_senderId_status_idx" ON "FriendRequest"("senderId", "status");

-- CreateIndex
CREATE INDEX "FriendRequest_receiverId_status_idx" ON "FriendRequest"("receiverId", "status");
