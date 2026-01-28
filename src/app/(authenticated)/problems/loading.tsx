import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ProblemsLoading() {
    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Filters Skeleton */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-[150px]" />
            </div>

            {/* Desktop Table Skeleton */}
            <Card className="hidden md:block">
                <CardHeader className="border-b bg-muted/5 p-4">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border/40">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex items-center p-4">
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-64" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <div className="w-[100px] flex justify-center">
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                                <div className="w-[120px]">
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <div className="w-[80px] text-right">
                                    <Skeleton className="h-4 w-8 ml-auto" />
                                </div>
                                <div className="w-[80px] text-right flex justify-end gap-2">
                                    <Skeleton className="h-8 w-8" />
                                    <Skeleton className="h-8 w-8" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Mobile Card Skeleton */}
            <div className="space-y-4 md:hidden">
                {[...Array(5)].map((_, i) => (
                    <Card key={i} className="p-4">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-3" />
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
