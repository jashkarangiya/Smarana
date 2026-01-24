-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "actorId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "href" TEXT,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- AlterTable User - Add new privacy fields
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "passwordHash" TEXT,
    "passwordUpdatedAt" DATETIME,
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
    "showStreakToPublic" BOOLEAN NOT NULL DEFAULT 1,
    "showStreakToFriends" BOOLEAN NOT NULL DEFAULT 1,
    "showPlatformsToPublic" BOOLEAN NOT NULL DEFAULT 1,
    "showPlatformsToFriends" BOOLEAN NOT NULL DEFAULT 1,
    "isProfilePublic" BOOLEAN NOT NULL DEFAULT 1,
    "showStreakPublicly" BOOLEAN NOT NULL DEFAULT 1,
    "showLeetCodePublicly" BOOLEAN NOT NULL DEFAULT 1
);

INSERT INTO "new_User" (
    "id", "name", "email", "emailVerified", "image", "username", "usernameLower",
    "usernameChangedAt", "usernameChangeCount", "leetcodeUsername", "codeforcesUsername",
    "codechefUsername", "atcoderUsername", "xp", "level", "createdAt", "updatedAt",
    "isProfilePublic", "showStreakPublicly", "showLeetCodePublicly"
)
SELECT
    "id", "name", "email", "emailVerified", "image", "username", "usernameLower",
    "usernameChangedAt", "usernameChangeCount", "leetcodeUsername", "codeforcesUsername",
    "codechefUsername", "atcoderUsername", "xp", "level", "createdAt", "updatedAt",
    "isProfilePublic", "showStreakPublicly", "showLeetCodePublicly"
FROM "User";

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_usernameLower_key" ON "User"("usernameLower");
CREATE INDEX "User_usernameLower_idx" ON "User"("usernameLower");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
