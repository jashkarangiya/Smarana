
export type AchievementTier = "BRONZE" | "SILVER" | "GOLD" | "LEGEND";

export type Achievement = {
    id: string;
    title: string;
    description: string;
    tier: AchievementTier;
    xpReward: number;
    isUnlocked: (ctx: AchievementContext) => boolean;
};

export type AchievementContext = {
    totalReviews: number;
    currentStreak: number;
    longestStreak: number;
    problemsTracked: number;
    friendsCount: number;
    // overdueCount: number; // Add back when efficient to compute
};

export const ACHIEVEMENTS: Achievement[] = [
    // --- Onboarding / Setup ---
    {
        id: "first_flame",
        title: "First Flame",
        description: "Complete your first review.",
        tier: "BRONZE",
        xpReward: 20,
        isUnlocked: (ctx) => ctx.totalReviews >= 1,
    },

    // --- Consistency ---
    {
        id: "spark",
        title: "Spark",
        description: "Maintain a 3-day streak.",
        tier: "BRONZE",
        xpReward: 30,
        isUnlocked: (ctx) => ctx.currentStreak >= 3,
    },
    {
        id: "steady_hands",
        title: "Steady Hands",
        description: "Maintain a 7-day streak.",
        tier: "SILVER",
        xpReward: 60,
        isUnlocked: (ctx) => ctx.currentStreak >= 7,
    },
    {
        id: "forge_week",
        title: "Forge Week",
        description: "Maintain a 14-day streak.",
        tier: "GOLD",
        xpReward: 120,
        isUnlocked: (ctx) => ctx.currentStreak >= 14,
    },
    {
        id: "iron_month",
        title: "Iron Month",
        description: "Maintain a 30-day streak.",
        tier: "LEGEND",
        xpReward: 250,
        isUnlocked: (ctx) => ctx.currentStreak >= 30,
    },

    // --- Review Volume ---
    {
        id: "reviewer_10",
        title: "Warm Up",
        description: "Complete 10 total reviews.",
        tier: "BRONZE",
        xpReward: 20,
        isUnlocked: (ctx) => ctx.totalReviews >= 10,
    },
    {
        id: "reviewer_50",
        title: "Recall Rookie",
        description: "Complete 50 total reviews.",
        tier: "BRONZE",
        xpReward: 40,
        isUnlocked: (ctx) => ctx.totalReviews >= 50,
    },
    {
        id: "reviewer_100",
        title: "Recall Regular",
        description: "Complete 100 total reviews.",
        tier: "SILVER",
        xpReward: 80,
        isUnlocked: (ctx) => ctx.totalReviews >= 100,
    },
    {
        id: "reviewer_500",
        title: "Recall Master",
        description: "Complete 500 total reviews.",
        tier: "GOLD",
        xpReward: 200,
        isUnlocked: (ctx) => ctx.totalReviews >= 500,
    },
    {
        id: "reviewer_1000",
        title: "Grandmaster",
        description: "Complete 1000 total reviews.",
        tier: "LEGEND",
        xpReward: 500,
        isUnlocked: (ctx) => ctx.totalReviews >= 1000,
    },

    // --- Problem Tracking ---
    {
        id: "collector_10",
        title: "Collector",
        description: "Track 10 problems.",
        tier: "BRONZE",
        xpReward: 20,
        isUnlocked: (ctx) => ctx.problemsTracked >= 10,
    },
    {
        id: "curator_50",
        title: "Curator",
        description: "Track 50 problems.",
        tier: "SILVER",
        xpReward: 60,
        isUnlocked: (ctx) => ctx.problemsTracked >= 50,
    },
    {
        id: "archivist_150",
        title: "Archivist",
        description: "Track 150 problems.",
        tier: "GOLD",
        xpReward: 150,
        isUnlocked: (ctx) => ctx.problemsTracked >= 150,
    },

    // --- Social ---
    {
        id: "first_friend",
        title: "First Friend",
        description: "Add a friend.",
        tier: "BRONZE",
        xpReward: 30,
        isUnlocked: (ctx) => ctx.friendsCount >= 1,
    },
    {
        id: "inner_circle",
        title: "Inner Circle",
        description: "Add 3 friends.",
        tier: "SILVER",
        xpReward: 60,
        isUnlocked: (ctx) => ctx.friendsCount >= 3,
    },
];
