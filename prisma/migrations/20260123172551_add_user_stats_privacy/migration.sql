-- CreateTable
CREATE TABLE "UserStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "problemsTracked" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" DATETIME,
    "reviewsThisWeek" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "isProfilePublic" BOOLEAN NOT NULL DEFAULT true,
    "showStreakPublicly" BOOLEAN NOT NULL DEFAULT true,
    "showLeetCodePublicly" BOOLEAN NOT NULL DEFAULT true
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
CREATE UNIQUE INDEX "UserStats_userId_key" ON "UserStats"("userId");
