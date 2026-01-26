# ![Smarana Logo](public/logo.png) Smarana

**The Spaced Repetition Layer for Algorithms**

Smarana is a spaced repetition application designed to help you master algorithms and patterns. Whether you practice on LeetCode, Codeforces, or AtCoder, Smarana helps you track your solved problems and schedules them for review to maximize long-term retention.

## Features

- **Google Login**: Secure authentication.
- **LeetCode Sync**: Automatically fetch your recent solved problems.
- **Spaced Repetition**: Smart scheduling (1, 3, 7, 14, 30 days).
- **Dashboard**: "Solved Today", "Due for Revision", and "Upcoming" views.
- **Dark Mode**: Focused, developer-friendly UI.

## Local Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google Cloud Console Project (for OAuth)

### 1. Clone and Install

```bash
git clone <repo-url>
cd mvp-project
npm install
```

### 2. Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

**Required variables:**
- `DATABASE_URL`: Connection string to your PostgreSQL DB.
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: From Google Cloud Console.
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`.
- `NEXTAUTH_URL`: `http://localhost:3000` (for local dev).
- `CRON_SECRET`: Arbitrary secret for protecting cron endpoints.

### 3. Database Setup

Initialize the DB schema:

```bash
npm run db:push
# OR
npx prisma migrate dev
```

### 4. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Architecture

- **Stack**: Next.js 14, TypeScript, Tailwind CSS, Prisma, PostgreSQL.
- **Auth**: NextAuth.js.
- **State**: React Query.
- **UI**: Shadcn UI + Radix Primitives.

### LeetCode Integration

Currently uses a mock implementation in `src/lib/leetcode.ts`. To use real data:
1. Replace the mock function with a call to an unofficial LeetCode API (e.g., via GraphQL).
2. Or use a library like `leetcode-query`.

## Background Jobs

To run the daily sync:
- Set up a cron job (e.g., Vercel Cron).
- Target URL: `YOUR_DOMAIN/api/cron/sync`.
- Header: `Authorization: Bearer <CRON_SECRET>`.

## License

MIT
