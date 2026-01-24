# Database Migration Guide

## Overview
This migration adds new security features and LeetCode sync infrastructure to AlgoRecall.

### What's Changed
1. **User model**: Renamed `password` → `passwordHash` for security clarity
2. **New models**: `LeetCodeAccount`, `LeetCodeSubmission`, `PasswordResetToken`
3. **RevisionProblem**: Added latest solution metadata fields

## Migration Steps

### Step 1: Apply Prisma Migration

```bash
# Create a new migration
npx prisma migrate dev --name add_leetcode_sync_and_password_reset

# Or reset the database (WARNING: destroys all data)
npx prisma migrate reset
```

### Step 2: Manual Data Migration (if you have existing users)

If you have existing users with passwords stored in the `password` field, you need to migrate them to `passwordHash`:

```sql
-- SQLite migration script
-- This renames the password column to passwordHash
-- Run this BEFORE applying the Prisma migration

-- Create a backup first!
PRAGMA foreign_keys=off;

BEGIN TRANSACTION;

-- Create new User table with correct schema
CREATE TABLE "User_new" (
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
  "isProfilePublic" BOOLEAN NOT NULL DEFAULT 1,
  "showStreakPublicly" BOOLEAN NOT NULL DEFAULT 1,
  "showLeetCodePublicly" BOOLEAN NOT NULL DEFAULT 1
);

-- Copy existing data, renaming password to passwordHash
INSERT INTO "User_new" (
  id, name, email, emailVerified, passwordHash, image, username,
  usernameLower, usernameChangedAt, usernameChangeCount,
  leetcodeUsername, codeforcesUsername, codechefUsername, atcoderUsername,
  xp, level, createdAt, updatedAt, isProfilePublic, showStreakPublicly, showLeetCodePublicly
)
SELECT
  id, name, email, emailVerified, password, image, username,
  usernameLower, usernameChangedAt, usernameChangeCount,
  leetcodeUsername, codeforcesUsername, codechefUsername, atcoderUsername,
  xp, level, createdAt, updatedAt, isProfilePublic, showStreakPublicly, showLeetCodePublicly
FROM "User";

-- Drop old table
DROP TABLE "User";

-- Rename new table
ALTER TABLE "User_new" RENAME TO "User";

-- Recreate indexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_usernameLower_key" ON "User"("usernameLower");
CREATE INDEX "User_usernameLower_idx" ON "User"("usernameLower");

COMMIT;

PRAGMA foreign_keys=on;
```

### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

### Step 4: Verify Migration

```bash
# Check the database schema
npx prisma db push --accept-data-loss

# Verify in Prisma Studio
npx prisma studio
```

## New Features Enabled

### 1. Password Reset Flow
- Users can now reset forgotten passwords via email
- Token-based reset (15-minute expiry)
- Strong password requirements (12+ chars, uppercase, lowercase, number, symbol)

**Usage:**
- Navigate to `/forgot-password`
- Enter email
- Check console logs for reset link (in production, send via email)
- Click link to `/reset-password?token=...`
- Set new password

### 2. Set Password (for OAuth Users)
- Google OAuth users can now set a password
- Enables signing in with both Google and email/password

**Usage:**
- Sign in with Google
- Go to Settings → Security
- Enter and confirm new password
- Now can sign in with email + password

### 3. LeetCode Sync Infrastructure
- Database models ready for storing submission history
- Tracks sync status and errors
- Supports multiple auth types (PUBLIC, COOKIE, EXTENSION, UPLOAD)

**Status:** Infrastructure ready, sync implementation pending

## Rollback Instructions

If you need to rollback:

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back 20XXXXXX_migration_name

# Restore from backup
sqlite3 dev.db < backup.sql
```

## Production Deployment Checklist

- [ ] Backup production database
- [ ] Test migration on staging environment
- [ ] Update environment variables (if needed)
- [ ] Run migration during low-traffic window
- [ ] Monitor error logs after deployment
- [ ] Test password reset email delivery
- [ ] Verify OAuth users can set passwords

## Environment Variables

No new environment variables required for this migration.

Optional for future email functionality:
```env
EMAIL_FROM=noreply@algorecall.com
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key
```

## Support

If you encounter issues:
1. Check Prisma logs: `npx prisma migrate status`
2. Verify schema: `npx prisma validate`
3. Reset (development only): `npx prisma migrate reset`
