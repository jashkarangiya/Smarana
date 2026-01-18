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
            if (!res.ok) throw new Error("Update failed")
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["me"] })
        },
    })
}
