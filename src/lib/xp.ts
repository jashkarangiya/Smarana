
/**
 * Calculates XP for a single review.
 * 
 * Formula:
 * Base XP by difficulty: Easy (8), Medium (12), Hard (18)
 * Multiplied by Rating: 1 (0.75x), 2 (1.0x), 3 (1.25x)
 * +5 XP Kicker if it's the first review of the day.
 */
export function calculateReviewXP(
    difficulty: string,
    rating: number, // 1-5 scale assumed from logs, but logic mentions 1/2/3 mapping? 
    // User prompt said: "Multiply by recall rating (assuming 1/2/3 where 3 = best recall)" 
    // My Review/Rate logic uses: 1 (Forgot), 2 (Hard), 3 (Good), 4 (Easy) often simplifed.
    // Let's assume input rating is the specific 1-4 scale used in `rate` endpoint or simplified to 1-3.
    // Actually the review endpoint receives `rating` (1=Forgot, 2=Hard, 3=Good, 4=Easy).
    // Let's map 1->0.75, 2->1.0, 3->1.0, 4->1.25 to be safe/generous?
    // Or stick to prompt: Rating 1 (Forgot) x0.75, Rating 2 (Hard) x1.0, Rating 3 (Good/Easy) x1.25.
    isFirstOfDay: boolean
): number {
    let base = 12; // default Medium
    const d = difficulty.toLowerCase();
    if (d === "easy") base = 8;
    if (d === "hard") base = 18;

    let multiplier = 1.0;
    if (rating <= 1) multiplier = 0.75;      // Forgot
    else if (rating === 2) multiplier = 1.0; // Hard
    else if (rating >= 3) multiplier = 1.25; // Good/Easy (3 or 4)

    let xp = Math.round(base * multiplier);

    if (isFirstOfDay) {
        xp += 5;
    }

    return xp;
}

/**
 * Calculates XP required to reach the NEXT level.
 * Formula: 450 + level * 60 + level^2 * 2
 */
export function xpToNextLevel(currentLevel: number) {
    return Math.floor(450 + currentLevel * 60 + currentLevel * currentLevel * 2);
}

/**
 * Given total XP, calculates the current Level and progress to next level.
 * This ensures Level is always derived from XP (Single Source of Truth).
 */
export function calculateLevelFromXP(totalXP: number): { level: number; currentLevelXP: number; requiredXP: number } {
    let level = 1;
    let xp = totalXP;

    while (true) {
        const required = xpToNextLevel(level);
        if (xp < required) {
            return { level, currentLevelXP: xp, requiredXP: required };
        }
        xp -= required;
        level++;
    }
}
