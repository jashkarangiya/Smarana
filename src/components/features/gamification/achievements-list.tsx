
"use client"

import { ACHIEVEMENTS } from "@/lib/achievements"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Trophy, Lock, Medal } from "lucide-react"
import { cn } from "@/lib/utils"

interface AchievementsListProps {
    unlockedIds: string[]
    isSelf?: boolean
}

export function AchievementsList({ unlockedIds, isSelf }: AchievementsListProps) {
    const unlockedSet = new Set(unlockedIds)

    // Sort: Unlocked first, then by tier (Legend > Gold > Silver > Bronze)
    const sortedAchievements = [...ACHIEVEMENTS].sort((a, b) => {
        const aUnlocked = unlockedSet.has(a.id)
        const bUnlocked = unlockedSet.has(b.id)

        if (aUnlocked && !bUnlocked) return -1
        if (!aUnlocked && bUnlocked) return 1

        // Tier value
        const tierValue = { LEGEND: 4, GOLD: 3, SILVER: 2, BRONZE: 1 }
        return tierValue[b.tier] - tierValue[a.tier]
    })

    // Group by status for potential separate sections, or just render grid
    // Let's render a single grid for cleaner look, but dim locked ones.

    const getTierColors = (tier: string, isUnlocked: boolean) => {
        if (!isUnlocked) return "bg-muted text-muted-foreground border-transparent opacity-50 grayscale"

        switch (tier) {
            case "LEGEND": return "bg-purple-500/10 text-purple-500 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            case "GOLD": return "bg-amber-500/10 text-amber-500 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            case "SILVER": return "bg-slate-300/10 text-slate-300 border-slate-300/50"
            case "BRONZE": return "bg-orange-700/10 text-orange-600 border-orange-700/30" // Darker orange for bronze
            default: return "bg-muted"
        }
    }

    const getTierIcon = (tier: string) => {
        switch (tier) {
            case "LEGEND": return <Trophy className="h-5 w-5 fill-current" /> // Filled trophy for Legend
            case "GOLD": return <Medal className="h-5 w-5 fill-current" />
            case "SILVER": return <Medal className="h-5 w-5" />
            case "BRONZE": return <Medal className="h-5 w-5" />
            default: return <Trophy className="h-5 w-5" />
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Achievements
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                        ({unlockedIds.length} / {ACHIEVEMENTS.length} unlocked)
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {sortedAchievements.map((achievement) => {
                        const isUnlocked = unlockedSet.has(achievement.id)
                        const styles = getTierColors(achievement.tier, isUnlocked)

                        return (
                            <TooltipProvider key={achievement.id}>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={cn(
                                                "relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 text-center gap-2 min-h-[120px]",
                                                styles,
                                                isUnlocked ? "hover:scale-105" : "hover:bg-muted/50"
                                            )}
                                        >
                                            {isUnlocked ? (
                                                <div className="p-2 rounded-full bg-background/20 backdrop-blur-sm">
                                                    {getTierIcon(achievement.tier)}
                                                </div>
                                            ) : (
                                                <div className="p-2 rounded-full bg-muted/50">
                                                    <Lock className="h-5 w-5" />
                                                </div>
                                            )}

                                            <div>
                                                <p className={cn("font-bold text-xs sm:text-sm line-clamp-1", !isUnlocked && "text-muted-foreground/70")}>{achievement.title}</p>
                                                <p className="text-[10px] opacity-70 mt-0.5">{achievement.tier}</p>
                                            </div>

                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <div className="text-center">
                                            <p className="font-semibold">{achievement.title}</p>
                                            <p className="text-sm">{achievement.description}</p>
                                            <p className="text-xs text-muted-foreground mt-1">Reward: {achievement.xpReward} XP</p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
