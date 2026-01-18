import { addDays } from "date-fns"

/**
 * Calculates the next review date based on the spaced repetition schedule.
 * Schedule:
 * - 0 reviews: +1 day
 * - 1 review: +3 days
 * - 2 reviews: +7 days
 * - 3 reviews: +14 days
 * - 4+ reviews: +30 days
 */
export function getNextReviewDate(reviewCount: number, fromDate: Date = new Date()): Date {
    let daysToAdd = 1

    switch (reviewCount) {
        case 0:
            daysToAdd = 1
            break
        case 1:
            daysToAdd = 3
            break
        case 2:
            daysToAdd = 7
            break
        case 3:
            daysToAdd = 14
            break
        default:
            daysToAdd = 30
            break
    }

    return addDays(fromDate, daysToAdd)
}
