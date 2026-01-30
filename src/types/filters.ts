export type FilterJoin = "and" | "or";

export type FilterField =
    | "reviewState"
    | "difficulty"
    | "platform"
    | "title"
    | "nextReviewAt"
    | "firstSolvedAt"
    | "reviewCount";

export type FilterOp =
    | "is"
    | "is_not"
    | "contains"
    | "not_contains"
    | "before"
    | "after"
    | "between"
    | "gte"
    | "lte"
    | "is_set"
    | "is_not_set";

export type FilterRule = {
    id: string;
    field: FilterField;
    op: FilterOp;
    value?: any;
};

export type FilterGroup = {
    join: FilterJoin;
    rules: FilterRule[];
};

export const REVIEW_STATE_OPTIONS = [
    { value: "PENDING", label: "Pending (due now)" },
    { value: "OVERDUE", label: "Overdue" },
    { value: "DUE_TODAY", label: "Due today" },
    { value: "UPCOMING_7D", label: "Upcoming (7 days)" },
    { value: "UPCOMING_30D", label: "Upcoming (30 days)" },
    { value: "NEVER_REVIEWED", label: "Never reviewed" },
];

export const DIFFICULTY_OPTIONS = [
    { value: "Easy", label: "Easy" },
    { value: "Medium", label: "Medium" },
    { value: "Hard", label: "Hard" },
];

export const PLATFORM_OPTIONS = [
    { value: "LeetCode", label: "LeetCode" },
    { value: "Blind 75", label: "Blind 75" },
    { value: "NeetCode 150", label: "NeetCode 150" },
];
