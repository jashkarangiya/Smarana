import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function DashboardLoading() {
    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            {/* Hero Skeleton */}
            <div className="mb-8 p-10 rounded-2xl border border-white/10 bg-white/5 h-[300px] flex flex-col justify-center gap-4">
                <Skeleton className="h-10 w-2/3 max-w-md" />
                <Skeleton className="h-6 w-1/2 max-w-sm" />
                <div className="flex gap-4 pt-4">
                    <Skeleton className="h-12 w-48 rounded-full" />
                    <Skeleton className="h-12 w-32 rounded-full" />
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="bg-card/50">
                        <CardContent className="p-4">
                            <div className="flex justify-between mb-2">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-4 w-4 rounded-full" />
                            </div>
                            <Skeleton className="h-8 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Skeleton */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Due Problems List */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="h-full border-muted bg-card/50">
                        <CardHeader className="pb-4">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="space-y-4 p-6">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-48" />
                                            <div className="flex gap-2">
                                                <Skeleton className="h-3 w-12" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-8 w-24" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Skeleton */}
                <div className="space-y-6">
                    <Skeleton className="h-48 w-full rounded-xl" /> {/* Social Pulse */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-12" />
                                <Skeleton className="h-4 w-12" />
                                <Skeleton className="h-4 w-12" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-32 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
