export type PerformanceNudge = {
    title: string
    body: string
    tone: "success" | "neutral" | "encourage"
}

export function buildPerformanceNudge(opts: {
    currentSec: number
    prevLastSec: number | null
    prevBestSec: number | null
}): PerformanceNudge {
    const { currentSec, prevLastSec, prevBestSec } = opts

    const fmt = (s: number) => {
        const m = Math.floor(s / 60)
        const r = s % 60
        return m > 0 ? `${m}m ${r}s` : `${r}s`
    }

    if (prevLastSec == null) {
        return {
            title: "Time logged ✅",
            body: `Baseline set at ${fmt(currentSec)}. Next time we’ll try to beat it.`,
            tone: "neutral",
        }
    }

    const delta = prevLastSec - currentSec
    const pct = Math.round((Math.abs(delta) / Math.max(1, prevLastSec)) * 100)
    const isNewBest = prevBestSec != null && currentSec < prevBestSec

    if (isNewBest) {
        return {
            title: "New personal best 🔥",
            body: `You finished in ${fmt(currentSec)} — ${pct}% faster than last time.`,
            tone: "success",
        }
    }

    if (delta > 0) {
        return {
            title: "Nice speed-up ⚡",
            body: `${fmt(currentSec)} — ${pct}% faster than last attempt.`,
            tone: "success",
        }
    }

    if (delta === 0) {
        return {
            title: "Consistency win ✅",
            body: `Same time as last run (${fmt(currentSec)}). That’s stable recall.`,
            tone: "neutral",
        }
    }

    return {
        title: "Still progress 💪",
        body: `${fmt(currentSec)} — more time than last attempt, but deeper recall sticks longer.`,
        tone: "encourage",
    }
}
