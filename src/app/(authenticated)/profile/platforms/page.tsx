"use client"

import { useStats, useSync } from "@/hooks/use-problems"
import { PlatformConnector } from "@/components/platform-connector"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function PlatformsPage() {
    const { data: stats } = useStats()
    const { mutate: sync, isPending: syncing } = useSync()

    const handleSync = () => {
        sync(undefined, {
            onSuccess: (data: any) => toast.success(`Synced ${data.added || 0} new problems`),
            onError: () => toast.error("Sync failed. Check your username."),
        })
    }

    return (
        <div className="space-y-6">
            <PlatformConnector />

            {/* Sync All Platforms Card */}
            <Card className="border-white/10 bg-white/[0.03]">
                <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-lg font-medium text-white/90 flex items-center gap-2">
                                <RefreshCw className="h-5 w-5" />
                                Sync Problems
                            </h2>
                            <p className="text-sm text-white/50 mt-1">
                                Fetch your latest solved problems from all connected platforms.
                            </p>
                        </div>

                        {stats && stats.total > 0 && (
                            <div className="flex gap-2 text-center">
                                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                                    <p className="text-sm font-bold text-emerald-500">{stats.easy}</p>
                                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Easy</p>
                                </div>
                                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                                    <p className="text-sm font-bold text-amber-500">{stats.medium}</p>
                                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Med</p>
                                </div>
                                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                                    <p className="text-sm font-bold text-rose-500">{stats.hard}</p>
                                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Hard</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <Button onClick={handleSync} disabled={syncing} className="w-full bg-white text-black hover:bg-white/90 h-10">
                        <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                        {syncing ? "Syncing All Platforms..." : "Sync All Platforms"}
                    </Button>
                    <p className="text-xs text-white/30 text-center mt-3">
                        Syncs problems from LeetCode, Codeforces, AtCoder
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
