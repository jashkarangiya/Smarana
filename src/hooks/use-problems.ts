import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { RevisionProblem, User } from "@prisma/client"

export function useProblems(filter: 'solved-today' | 'due' | 'upcoming' | 'all' = 'all') {
    return useQuery<RevisionProblem[]>({
        queryKey: ["problems", filter],
        queryFn: async () => {
            const res = await fetch(`/api/problems?filter=${filter}`)
            if (!res.ok) throw new Error("Failed to fetch problems")
            return res.json()
        },
    })
}

export function useStats() {
    return useQuery<{
        total: number
        easy: number
        medium: number
        hard: number
        reviewedToday: number
        streak: number
        xp: number
        level: number
        xpForNextLevel: number
        xpProgress: number
        heatmapData: Record<string, number>
        achievements: Array<{ id: string; name: string; emoji: string; description: string }>
    }>({
        queryKey: ["stats"],
        queryFn: async () => {
            const res = await fetch("/api/stats")
            if (!res.ok) throw new Error("Failed to fetch stats")
            return res.json()
        },
    })
}

export function useUser() {
    return useQuery<User>({
        queryKey: ["me"],
        queryFn: async () => {
            const res = await fetch("/api/me")
            if (!res.ok) throw new Error("Failed to fetch user")
            return res.json()
        },
    })
}

export function useSync() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/sync", { method: "POST" })
            if (!res.ok) throw new Error("Sync failed")
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["problems"] })
            queryClient.invalidateQueries({ queryKey: ["stats"] })
        },
    })
}

export function useReviewProblem() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/problems/${id}/review`, { method: "POST" })
            if (!res.ok) throw new Error("Review failed")
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["problems"] })
            queryClient.invalidateQueries({ queryKey: ["stats"] })
        },
    })
}

export function useUpdateLeetCodeUsername() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (username: string) => {
            const res = await fetch("/api/me/leetcode", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leetcodeUsername: username }),
            })
            if (!res.ok) {
                const errorText = await res.text()
                throw new Error(errorText || "Update failed")
            }
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["me"] })
        },
    })
}

export function useUndoReview() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/problems/${id}/undo-review`, { method: "POST" })
            if (!res.ok) throw new Error("Undo failed")
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["problems"] })
            queryClient.invalidateQueries({ queryKey: ["stats"] })
        },
    })
}

