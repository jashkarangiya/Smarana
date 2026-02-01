# <img src="public/logo.png" width="25" height="25" alt="Smarana Logo" /> Smarana

**Master Algorithms with Spaced Repetition & Gamification.**

Smarana ("Remembrance" in Sanskrit) is a spaced repetition platform designed for competitive programmers and software engineers. It helps you track, schedule, and master algorithmic problems from LeetCode, Codeforces, and AtCoder using smart retention intervals.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## 🚀 Features

### 🧠 Core Learning
- **Spaced Repetition System (SRS)**: Automatically schedules reviews at optimal intervals (1, 3, 7, 14, 30 days) to maximize long-term retention.
- **Review Queue**: A daily prioritized list of problems you are likely to forget.
- **Problem Sync**: Seamlessly sync your solved history from **LeetCode**, **Codeforces**, and **AtCoder**.

### 🎮 Gamification
- **XP & Levels**: Earn XP for solving problems and reviewing due items. Level up from "Novice" to "Grandmaster".
- **Ember Trail (Heatmap)**: Visualize your daily consistency with a GitHub-style activity graph.
- **Achievements**: Unlock badges for streaks, total solves, and hard problems.
- **Leaderboards**: Compete with friends and the global community.

### 👥 Social & Community
- **Friends System**: Follow other users and track their progress.
- **Social Pulse**: A real-time feed of your friends' recent activity and achievements.
- **Profile Sharing**: Public profiles to showcase your stats, streak, and badges.

### 🎨 Design & Experience
- **"Night Garden" Aesthetic**: A premium, deep dark mode with ember/orange accents (`#BB7331`).
- **Responsive Layout**: polished mobile and desktop experience with a 2-column settings layout.
- **Keyboard First**: Optimized for developer workflow.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Prisma ORM](https://www.prisma.io/))
- **Auth**: [NextAuth.js](https://next-auth.js.org/) (Google OAuth + Credentials)
- **State**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: Playwright (E2E)

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL Database (Local or Cloud like Neon/Supabase)
- Google Cloud Project (for OAuth, optional for dev)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/smarana.git
cd smarana
npm install
```

### 2. Configure Environment
Copy the example environment file:
```bash
cp .env.example .env
```

Fill in your secrets in `.env`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smarana"

# Auth (NextAuth)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key" # Generate with: openssl rand -base64 32

# Google OAuth (Optional for local dev if using Credentials)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Setup Database
Initialize the database schema and generate the Prisma client:
```bash
npx prisma migrate dev --name init
# or simply
npm run build # (Runs prisma generate + migrate deploy)
```

### 4. Seed Data (Optional)
Populate the database with demo user, problems, and activity:
```bash
npm run seed:demo
```
*Creates a test user: `demo@example.com` / `Password123!`*

### 5. Run Locally
Start the development server:
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to start mastering algorithms.

## 📂 Project Structure

```
src/
├── app/                 # Next.js App Router pages & layouts
│   ├── (auth)/          # Login/Signup routes
│   ├── (authenticated)/ # App routes (Dashboard, Profile, etc.)
│   └── api/             # API Routes (Next.js Route Handlers)
├── components/          # Reusable UI components
│   ├── ui/              # Shadcn primitive components
│   └── ...              # Feature-specific components (SettingsNav, DailyChallenge)
├── lib/                 # Utilities, helpers, and constants
├── actions/             # Server Actions
└── hooks/               # Custom React hooks (useUser, useStats)
```

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

built with 🧡 by [Jash Karangiya](https://github.com/jashkarangiya)
