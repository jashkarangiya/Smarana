export const PASSWORD_POLICY = {
    minLength: 8,
    requireUppercase: false,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: false,
} as const

export function getPasswordRules() {
    const rules = [
        {
            id: "minLength",
            label: `At least ${PASSWORD_POLICY.minLength} characters`,
            test: (s: string) => s.length >= PASSWORD_POLICY.minLength,
        },
        ...(PASSWORD_POLICY.requireUppercase
            ? [{ id: "upper", label: "Contains uppercase letter", test: (s: string) => /[A-Z]/.test(s) }]
            : []),
        ...(PASSWORD_POLICY.requireLowercase
            ? [{ id: "lower", label: "Contains lowercase letter", test: (s: string) => /[a-z]/.test(s) }]
            : []),
        ...(PASSWORD_POLICY.requireNumber
            ? [{ id: "number", label: "Contains number", test: (s: string) => /\d/.test(s) }]
            : []),
        ...(PASSWORD_POLICY.requireSpecial
            ? [
                {
                    id: "special",
                    label: "Contains special character",
                    test: (s: string) => /[^A-Za-z0-9]/.test(s),
                },
            ]
            : []),
    ]

    return rules
}

export function validatePassword(password: string) {
    const rules = getPasswordRules()
    const failed = rules.filter((r) => !r.test(password))
    return { ok: failed.length === 0, failed }
}
