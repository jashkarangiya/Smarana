import { z } from "zod";

export const FilterRuleSchema = z.object({
    id: z.string(),
    field: z.enum([
        "reviewState",
        "difficulty",
        "platform",
        "title",
        "nextReviewAt",
        "firstSolvedAt",
        "reviewCount",
    ]),
    op: z.enum([
        "is",
        "is_not",
        "contains",
        "not_contains",
        "before",
        "after",
        "between",
        "gte",
        "lte",
        "is_set",
        "is_not_set",
    ]),
    value: z.any().optional(),
});

export const FilterGroupSchema = z.object({
    join: z.enum(["and", "or"]),
    rules: z.array(FilterRuleSchema).max(20),
});
