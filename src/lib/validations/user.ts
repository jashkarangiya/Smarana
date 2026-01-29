import { z } from "zod"

export const usernameSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be at most 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username must be alphanumeric or underscores only"),
})

export type UsernameInput = z.infer<typeof usernameSchema>
