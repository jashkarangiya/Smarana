import { z } from "zod"

export const problemCreateSchema = z.object({
    title: z.string().min(1, "Title is required"),
    url: z.string().url("Invalid URL"),
    difficulty: z.string().min(1, "Difficulty is required"), // Could enum this later
    platform: z.string().default("leetcode"),
    tags: z.array(z.string()).optional(),
})

export type ProblemCreateInput = z.infer<typeof problemCreateSchema>
