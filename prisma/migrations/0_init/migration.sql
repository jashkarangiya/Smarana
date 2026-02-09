-- CreateEnum
CREATE TYPE "ProfileVisibility" AS ENUM ('PUBLIC', 'FRIENDS_ONLY', 'PRIVATE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('FRIEND_REQUEST_RECEIVED', 'FRIEND_REQUEST_ACCEPTED', 'SYSTEM');

-- CreateEnum
CREATE TYPE "FriendRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "LeetCodeAuthType" AS ENUM ('PUBLIC', 'COOKIE', 'EXTENSION', 'UPLOAD');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('OK', 'ERROR', 'SYNCING');

-- CreateEnum
CREATE TYPE "AdminInboxStatus" AS ENUM ('NEW', 'OPENED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AttemptSource" AS ENUM ('EXTENSION', 'WEB');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT,
    "passwordUpdatedAt" TIMESTAMP(3),
    "image" TEXT,
    "bio" VARCHAR(160),
    "timezone" TEXT DEFAULT 'UTC',
    "username" TEXT,
    "usernameLower" TEXT,
    "usernameChangedAt" TIMESTAMP(3),
    "usernameChangeCount" INTEGER NOT NULL DEFAULT 0,
    "leetcodeUsername" TEXT,
    "codeforcesUsername" TEXT,
    "codechefUsername" TEXT,
    "atcoderUsername" TEXT,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "profileVisibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "showStreakToPublic" BOOLEAN NOT NULL DEFAULT true,
    "showStreakToFriends" BOOLEAN NOT NULL DEFAULT true,
    "showPlatformsToPublic" BOOLEAN NOT NULL DEFAULT true,
    "showPlatformsToFriends" BOOLEAN NOT NULL DEFAULT true,
    "showBioPublicly" BOOLEAN NOT NULL DEFAULT true,
    "showTimezoneToPublic" BOOLEAN NOT NULL DEFAULT false,
    "showTimezoneToFriends" BOOLEAN NOT NULL DEFAULT true,
    "isProfilePublic" BOOLEAN NOT NULL DEFAULT true,
    "showStreakPublicly" BOOLEAN NOT NULL DEFAULT true,
    "showLeetCodePublicly" BOOLEAN NOT NULL DEFAULT true,
    "showSolutionInExtension" BOOLEAN NOT NULL DEFAULT true,
    "emailReviewRemindersEnabled" BOOLEAN NOT NULL DEFAULT false,
    "emailContestRemindersEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastReviewReminderSentAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "interval" INTEGER NOT NULL,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PomodoroSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "focusDuration" INTEGER NOT NULL DEFAULT 25,
    "shortBreakDuration" INTEGER NOT NULL DEFAULT 5,
    "longBreakDuration" INTEGER NOT NULL DEFAULT 15,
    "longBreakInterval" INTEGER NOT NULL DEFAULT 4,
    "autoStartBreaks" BOOLEAN NOT NULL DEFAULT false,
    "autoStartPomodoros" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PomodoroSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FriendRequest" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FriendRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "RevisionProblem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'leetcode',
    "problemSlug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "firstSolvedAt" TIMESTAMP(3) NOT NULL,
    "lastSolvedAt" TIMESTAMP(3) NOT NULL,
    "nextReviewAt" TIMESTAMP(3) NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" TIMESTAMP(3),
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "attemptTotalSec" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptSec" INTEGER,
    "bestAttemptSec" INTEGER,
    "notes" TEXT DEFAULT '',
    "solution" TEXT DEFAULT '',
    "latestAcceptedSubmissionId" TEXT,
    "latestSolutionLang" TEXT,
    "latestSolutionFetchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevisionProblem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "source" "AttemptSource" NOT NULL DEFAULT 'EXTENSION',
    "platform" TEXT NOT NULL,
    "platformKey" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProblemAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "count" INTEGER NOT NULL DEFAULT 1,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ReviewLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "problemsTracked" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" TIMESTAMP(3),
    "reviewsThisWeek" INTEGER NOT NULL DEFAULT 0,
    "leetcodeActivity" TEXT,
    "unlockedAchievements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeetCodeAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "authType" TEXT NOT NULL DEFAULT 'PUBLIC',
    "lastSyncedAt" TIMESTAMP(3),
    "syncStatus" TEXT DEFAULT 'OK',
    "syncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeetCodeAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeetCodeSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "problemSlug" TEXT NOT NULL,
    "problemTitle" TEXT,
    "status" TEXT NOT NULL,
    "lang" TEXT,
    "code" TEXT,
    "runtime" TEXT,
    "memory" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeetCodeSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "actorId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "href" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "verificationToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceSuggestion" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "suggestedByEmail" TEXT,
    "userId" TEXT,
    "status" "AdminInboxStatus" NOT NULL DEFAULT 'NEW',
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "userId" TEXT,
    "status" "AdminInboxStatus" NOT NULL DEFAULT 'NEW',
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtensionToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "ExtensionToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtensionAuthCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExtensionAuthCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contest" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "url" TEXT NOT NULL,
    "phase" TEXT NOT NULL DEFAULT 'BEFORE',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestReminder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "notifyAt" TIMESTAMP(3) NOT NULL,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContestReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "contestName" TEXT,
    "rank" INTEGER,
    "oldRating" INTEGER,
    "newRating" INTEGER,
    "delta" INTEGER,
    "attendedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContestResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_usernameLower_key" ON "User"("usernameLower");

-- CreateIndex
CREATE INDEX "User_usernameLower_idx" ON "User"("usernameLower");

-- CreateIndex
CREATE INDEX "ReviewEvent_userId_reviewedAt_idx" ON "ReviewEvent"("userId", "reviewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PomodoroSettings_userId_key" ON "PomodoroSettings"("userId");

-- CreateIndex
CREATE INDEX "FriendRequest_receiverId_idx" ON "FriendRequest"("receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "FriendRequest_senderId_receiverId_key" ON "FriendRequest"("senderId", "receiverId");

-- CreateIndex
CREATE INDEX "Friendship_userId_idx" ON "Friendship"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_userId_friendId_key" ON "Friendship"("userId", "friendId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "RevisionProblem_userId_nextReviewAt_idx" ON "RevisionProblem"("userId", "nextReviewAt");

-- CreateIndex
CREATE INDEX "RevisionProblem_userId_lastReviewedAt_idx" ON "RevisionProblem"("userId", "lastReviewedAt");

-- CreateIndex
CREATE INDEX "RevisionProblem_userId_firstSolvedAt_idx" ON "RevisionProblem"("userId", "firstSolvedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RevisionProblem_userId_platform_problemSlug_key" ON "RevisionProblem"("userId", "platform", "problemSlug");

-- CreateIndex
CREATE INDEX "ProblemAttempt_userId_problemId_createdAt_idx" ON "ProblemAttempt"("userId", "problemId", "createdAt");

-- CreateIndex
CREATE INDEX "ProblemAttempt_userId_platform_platformKey_idx" ON "ProblemAttempt"("userId", "platform", "platformKey");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewLog_userId_day_key" ON "ReviewLog"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "UserStats_userId_key" ON "UserStats"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LeetCodeAccount_userId_key" ON "LeetCodeAccount"("userId");

-- CreateIndex
CREATE INDEX "LeetCodeAccount_userId_idx" ON "LeetCodeAccount"("userId");

-- CreateIndex
CREATE INDEX "LeetCodeSubmission_userId_submittedAt_idx" ON "LeetCodeSubmission"("userId", "submittedAt");

-- CreateIndex
CREATE INDEX "LeetCodeSubmission_userId_problemSlug_submittedAt_idx" ON "LeetCodeSubmission"("userId", "problemSlug", "submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LeetCodeSubmission_userId_submissionId_key" ON "LeetCodeSubmission"("userId", "submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_expiresAt_idx" ON "PasswordResetToken"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "PlatformVerification_verificationToken_idx" ON "PlatformVerification"("verificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformVerification_userId_platform_key" ON "PlatformVerification"("userId", "platform");

-- CreateIndex
CREATE INDEX "ResourceSuggestion_status_createdAt_idx" ON "ResourceSuggestion"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ResourceSuggestion_createdAt_idx" ON "ResourceSuggestion"("createdAt");

-- CreateIndex
CREATE INDEX "ResourceSuggestion_ipHash_createdAt_idx" ON "ResourceSuggestion"("ipHash", "createdAt");

-- CreateIndex
CREATE INDEX "ContactMessage_status_createdAt_idx" ON "ContactMessage"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");

-- CreateIndex
CREATE INDEX "ContactMessage_ipHash_createdAt_idx" ON "ContactMessage"("ipHash", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExtensionToken_accessToken_key" ON "ExtensionToken"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "ExtensionToken_refreshToken_key" ON "ExtensionToken"("refreshToken");

-- CreateIndex
CREATE INDEX "ExtensionToken_userId_idx" ON "ExtensionToken"("userId");

-- CreateIndex
CREATE INDEX "ExtensionToken_accessToken_idx" ON "ExtensionToken"("accessToken");

-- CreateIndex
CREATE INDEX "ExtensionToken_refreshToken_idx" ON "ExtensionToken"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "ExtensionAuthCode_code_key" ON "ExtensionAuthCode"("code");

-- CreateIndex
CREATE INDEX "ExtensionAuthCode_code_idx" ON "ExtensionAuthCode"("code");

-- CreateIndex
CREATE INDEX "ExtensionAuthCode_expiresAt_idx" ON "ExtensionAuthCode"("expiresAt");

-- CreateIndex
CREATE INDEX "Contest_platform_startTime_idx" ON "Contest"("platform", "startTime");

-- CreateIndex
CREATE INDEX "Contest_startTime_idx" ON "Contest"("startTime");

-- CreateIndex
CREATE UNIQUE INDEX "Contest_platform_contestId_key" ON "Contest"("platform", "contestId");

-- CreateIndex
CREATE INDEX "ContestReminder_userId_notifyAt_idx" ON "ContestReminder"("userId", "notifyAt");

-- CreateIndex
CREATE INDEX "ContestReminder_notifyAt_notified_idx" ON "ContestReminder"("notifyAt", "notified");

-- CreateIndex
CREATE UNIQUE INDEX "ContestReminder_userId_contestId_key" ON "ContestReminder"("userId", "contestId");

-- CreateIndex
CREATE INDEX "ContestResult_userId_platform_attendedAt_idx" ON "ContestResult"("userId", "platform", "attendedAt");

-- CreateIndex
CREATE INDEX "ContestResult_userId_attendedAt_idx" ON "ContestResult"("userId", "attendedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ContestResult_userId_platform_contestId_key" ON "ContestResult"("userId", "platform", "contestId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewEvent" ADD CONSTRAINT "ReviewEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewEvent" ADD CONSTRAINT "ReviewEvent_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "RevisionProblem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PomodoroSettings" ADD CONSTRAINT "PomodoroSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionProblem" ADD CONSTRAINT "RevisionProblem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemAttempt" ADD CONSTRAINT "ProblemAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemAttempt" ADD CONSTRAINT "ProblemAttempt_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "RevisionProblem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStats" ADD CONSTRAINT "UserStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeetCodeAccount" ADD CONSTRAINT "LeetCodeAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeetCodeSubmission" ADD CONSTRAINT "LeetCodeSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformVerification" ADD CONSTRAINT "PlatformVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceSuggestion" ADD CONSTRAINT "ResourceSuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtensionToken" ADD CONSTRAINT "ExtensionToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtensionAuthCode" ADD CONSTRAINT "ExtensionAuthCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestReminder" ADD CONSTRAINT "ContestReminder_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

