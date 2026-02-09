# <img src="public/logo-filled.jpg" width="30" height="30" alt="Smarana Logo" /> Smarana

**Master Algorithms with Spaced Repetition & Gamification.**

Smarana ("Remembrance" in Sanskrit) is a specialized spaced repetition platform for competitive programmers. It seamlessly integrates with your workflow to help you track, schedule, and master algorithmic problems from LeetCode, Codeforces, and AtCoder.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.0-teal)

## 🚀 Features

### 🧠 Core Learning Platform
- **Spaced Repetition System (SRS)**: Smart scheduling (1, 3, 7, 14, 30 days) based on your performance to maximize retention.
- **Review Queue**: A prioritized daily dashboard of problems you need to review.
- **Problem Sync**: Automatic history tracking from **LeetCode**, **Codeforces**, and **AtCoder**.

### 🧩 Browser Extension
- **In-Context Overlay**: Solve problems directly on LeetCode with a non-intrusive floating panel.
- **Focus Timer**: High-precision timer that tracks solve duration and auto-pauses when you switch tabs.
- **One-Click Review**: Instantly save solutions, notes, and difficulty ratings to your dashboard without leaving the problem page.

### 🎮 Gamification
- **XP & Ranking**: Earn XP for consistency and solving hard problems. Climb from "Novice" to "Grandmaster".
- **Ember Trail**: Visualize your consistency with a GitHub-style activity heatmap.
- **Achievements**: Unlock badges for milestones like "7-Day Streak" or "100 Problems Solved".
- **Leaderboards**: Compete globally or with friends.

### 👥 Social & Admin
- **Community**: Follow friends, view their stats, and get inspired by their activity pulse.
- **Admin Console**: dedicated tools for managing resource suggestions and user feedback.

### 🎨 Design & Experience
- **"Night Garden" Aesthetic**: A premium dark UI with ember-orange accents (`#BB7331`) designed for late-night coding sessions.
- **Developer First**: optimized for keyboard navigation and speed.

## 🛠️ Tech Stack

### Web Application
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Prisma ORM](https://www.prisma.io/))
- **Auth**: [NextAuth.js](https://next-auth.js.org/)
- **State**: [TanStack Query](https://tanstack.com/query/latest)

### Browser Extension
- **Core**: [Vite](https://vitejs.dev/) + [React](https://react.dev/)
- **Architecture**: Shadow DOM for style isolation
- **Communication**: Chrome Runtime Messaging

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL Database
- Google Cloud Project (for OAuth)

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

Fill in your secrets:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smarana"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### 3. Setup Database
```bash
npm run build # Runs prisma generate + migrate deploy
```

### 4. Run Web App
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000).

### 5. Build Extension (Optional)
To run the browser extension locally:
```bash
cd extension
npm install
npm run build
```
Load the `extension/dist` folder in Chrome via `chrome://extensions` > "Load unpacked".

## 📂 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── (authenticated)/ # Dashboard, Profile, Admin
│   └── api/             # API Routes
├── components/          # React Components
├── lib/                 # Utilities & Business Logic
extension/               # Browser Extension Source
│   ├── src/
│   │   ├── content/     # Content Scripts (Overlay)
│   │   └── background/  # Service Worker
└── prisma/              # Database Schema & Migrations
```

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes
4. Push to the Branch
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

built with 🧡 by [Jash Karangiya](https://github.com/jashkarangiya)
